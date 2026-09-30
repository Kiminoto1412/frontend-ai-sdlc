#!/usr/bin/env node
// PreToolUse hook: no agent-initiated deletes, no force pushes.
// Deleting is never the agent's call, so every delete path is blocked here,
// not only the recursive-force ones.
// Exit 0 = allow, exit 2 = block (stderr is fed back to the agent).

// Split on shell operators, but only outside quotes. A naive split breaks
// `grep "rm -f\|rmdir"` into a phantom segment starting with a bare `rm`,
// which reads as a delete command that was never there.
function splitSegments(command) {
  const segments = [];
  let current = "";
  let quote = null; // "'" or '"' while inside that quote

  for (let i = 0; i < command.length; i++) {
    const c = command[i];

    if (quote) {
      current += c;
      if (c === quote) quote = null;
      else if (c === "\\" && quote === '"' && i + 1 < command.length) current += command[++i];
      continue;
    }

    if (c === "'" || c === '"') {
      quote = c;
      current += c;
      continue;
    }

    if (c === "\\" && i + 1 < command.length) {
      current += c + command[++i];
      continue;
    }

    if (c === ";" || c === "|" || c === "&" || c === "\n") {
      segments.push(current);
      current = "";
      continue;
    }

    current += c;
  }

  segments.push(current);
  return segments;
}

// Tokens that precede the real command without being it, so `sudo rm` and
// `VAR=1 xargs rm` still resolve to rm.
const TRANSPARENT = new Set([
  "sudo", "command", "env", "time", "nohup", "nice", "exec", "builtin",
  "xargs", "then", "else", "elif", "do", "!", "{", "(",
]);

const SHELLS = new Set(["sh", "bash", "zsh", "dash", "ksh"]);

function readStdin() {
  return new Promise((resolve) => {
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (raw += c));
    process.stdin.on("end", () => resolve(raw));
  });
}

const isWord = (token, word) => token === word || token.endsWith(`/${word}`);

// The command word of a segment: skip sudo/env-assignment/shell-keyword noise.
// Matching only here is what keeps `echo "remove rm later"` from tripping the
// hook — a bare word inside prose is not in command position.
function commandWord(tokens) {
  for (const t of tokens) {
    if (TRANSPARENT.has(t)) continue;
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(t)) continue; // VAR=value prefix
    return t;
  }
  return null;
}

function hasFlag(tokens, ...names) {
  return tokens.some((t) => {
    if (names.includes(t)) return true;
    if (/^-[A-Za-z]+$/.test(t)) {
      return names.some((n) => /^-[A-Za-z]$/.test(n) && t.includes(n[1]));
    }
    return false;
  });
}

function classify(tokens) {
  const cmd = commandWord(tokens);
  if (!cmd) return null;

  if (isWord(cmd, "rm")) return "rm";
  if (isWord(cmd, "rmdir")) return "rmdir";

  // A shell wrapper hides its payload in a quoted string, so the command-word
  // check cannot see it. Scan the whole segment for a delete verb instead.
  if (SHELLS.has(cmd.split("/").pop()) && hasFlag(tokens, "-c")) {
    if (tokens.some((t) => /(^|["'\s/])(rm|rmdir)\b/.test(t))) return "shell -c wrapping a delete";
  }

  if (isWord(cmd, "find")) {
    if (tokens.includes("-delete")) return "find -delete";
    const execIdx = tokens.findIndex((t) => t === "-exec" || t === "-execdir");
    if (execIdx !== -1 && tokens.slice(execIdx + 1).some((t) => isWord(t, "rm")))
      return "find -exec rm";
  }

  if (isWord(cmd, "git")) {
    // `git clean` without a force flag deletes nothing; -n is a dry run.
    if (tokens.includes("clean") && hasFlag(tokens, "-f", "--force")) return "git clean -f";
    if (tokens.includes("push")) {
      if (hasFlag(tokens, "-f", "--force")) return "force push";
      if (tokens.some((t) => t.startsWith("--force-with-lease") || t.startsWith("--force-if-includes")))
        return "force push";
    }
  }

  // graphify ships LLM backends that upload file content for doc/image/community
  // work. Only the local-AST paths are allowed on this repo.
  if (isWord(cmd, "graphify")) {
    if (tokens.includes("extract") && !tokens.includes("--code-only"))
      return "graphify extract without --code-only";
    if (tokens.includes("label")) return "graphify label";
    if (tokens.includes("cluster-only") && !tokens.includes("--no-label"))
      return "graphify cluster-only without --no-label";
    // `update` and `watch` re-extract with no --code-only option at all, and were
    // measured pulling 144 document + 38 concept nodes out of the markdown files.
    // With an API key in the environment that content would reach an LLM.
    if (tokens.includes("update")) return "graphify update";
    if (tokens.includes("watch")) return "graphify watch";
  }

  return null;
}

const DELETE_RULES = new Set([
  "rm", "rmdir", "find -delete", "find -exec rm", "git clean -f",
  "shell -c wrapping a delete",
]);

const LLM_UPLOAD_RULES = new Set([
  "graphify extract without --code-only",
  "graphify label",
  "graphify cluster-only without --no-label",
  "graphify update",
  "graphify watch",
]);

function inspect(command) {
  for (const segment of splitSegments(command)) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) continue;
    const rule = classify(tokens);
    if (rule) return rule;
  }
  return null;
}

const raw = await readStdin();

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0); // Malformed payload: stay out of the way rather than block everything.
}

if (payload.tool_name !== "Bash") process.exit(0);

const command = payload.tool_input?.command;
if (typeof command !== "string") process.exit(0);

const rule = inspect(command);
if (!rule) process.exit(0);

let guidance;
if (DELETE_RULES.has(rule)) {
  guidance =
    `Deleting files is never the agent's call in this project. Ask the user to confirm the exact ` +
    `paths first, then stop — they run it themselves by typing the command with a leading "!" in the prompt.\n\n` +
    `To drop the database, use \`npm run db:reset\` — it deletes through Node, not \`rm\`, and is allowed.`;
} else if (LLM_UPLOAD_RULES.has(rule)) {
  guidance =
    `That graphify path uploads repository content to whichever third-party LLM backend an API key ` +
    `in the environment selects (Anthropic, OpenAI, Gemini, DeepSeek, Moonshot, …). Sending internal ` +
    `code or documents to an external service is not allowed here.\n\n` +
    `Use the local-AST equivalents instead — they need no API key and send nothing:\n` +
    `  graphify extract . --code-only      (also the only sanctioned REBUILD — \`update\`/\`watch\`\n` +
    `                                       take no --code-only flag and re-index the docs)\n` +
    `  graphify cluster-only . --no-label\n` +
    `Then query locally with \`graphify explain\`, \`affected\`, \`path\`, or \`god-nodes\`.`;
} else {
  guidance =
    `Force pushing rewrites remote history and can destroy commits teammates already pulled. ` +
    `Push a normal commit or open a PR. If history genuinely must be rewritten, the user runs it themselves.`;
}

process.stderr.write(
  `Blocked by project hook (.claude/hooks/block-destructive.mjs): ${rule}\n\n` +
    `Command: ${command}\n\n` +
    `${guidance}\n\n` +
    `Do not route around this hook — no alternate tool, no shell wrapper, no temp script, ` +
    `no Write/Edit trick. Report the block and stop.\n`,
);
process.exit(2);
