#!/usr/bin/env node
// PreToolUse hook: no agent-initiated deletes, no force pushes.
// Deleting is never the agent's call, so every delete path is blocked here,
// not only the recursive-force ones.
// Exit 0 = allow, exit 2 = block (stderr is fed back to the agent).
//
// A command can hide another command inside itself — `$(…)`, backticks,
// `sh -c "…"`, `find -exec … ;`. Scanning for a bare `rm` token misses all of
// them, so inspection RECURSES into every nested command context instead.

const MAX_DEPTH = 5;

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

// Command substitutions always execute, whatever the surrounding command is:
// `echo $(rm -rf data)` deletes. Single-quoted spans are literal, so they are
// skipped — `echo '$(rm -rf /)'` prints text and deletes nothing.
function substitutions(command) {
  const found = [];
  for (let i = 0; i < command.length; i++) {
    const c = command[i];

    if (c === "\\") { i++; continue; }

    if (c === "'") {
      const end = command.indexOf("'", i + 1);
      if (end === -1) break;
      i = end;
      continue;
    }

    if (c === "`") {
      const end = command.indexOf("`", i + 1);
      if (end === -1) break;
      found.push(command.slice(i + 1, end));
      i = end;
      continue;
    }

    if (c === "$" && command[i + 1] === "(") {
      let depth = 1;
      let j = i + 2;
      while (j < command.length && depth > 0) {
        if (command[j] === "(") depth++;
        else if (command[j] === ")") depth--;
        if (depth > 0) j++;
      }
      found.push(command.slice(i + 2, j));
      i = j;
    }
  }
  return found;
}

function stripQuotes(s) {
  const t = s.trim();
  if (t.length >= 2 && (t[0] === '"' || t[0] === "'") && t[t.length - 1] === t[0]) {
    return t.slice(1, -1);
  }
  return t;
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

// Commands nested inside this one that need inspecting in their own right.
function innerCommands(tokens) {
  const inner = [];
  const cmd = commandWord(tokens);
  if (!cmd) return inner;

  // `sh -c "<command>"` — the payload is a command, not an argument.
  if (SHELLS.has(cmd.split("/").pop())) {
    const i = tokens.indexOf("-c");
    if (i !== -1 && tokens[i + 1] !== undefined) {
      inner.push(stripQuotes(tokens.slice(i + 1).join(" ")));
    }
  }

  // `find … -exec <command> ;` / `-execdir <command> +`
  if (isWord(cmd, "find")) {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] !== "-exec" && tokens[i] !== "-execdir") continue;
      const payload = [];
      for (let j = i + 1; j < tokens.length; j++) {
        const t = tokens[j];
        if (t === ";" || t === "\\;" || t === "+") break;
        payload.push(t);
      }
      if (payload.length) inner.push(payload.join(" "));
    }
  }

  return inner;
}

function classify(tokens) {
  const cmd = commandWord(tokens);
  if (!cmd) return null;

  if (isWord(cmd, "rm")) return "rm";
  if (isWord(cmd, "rmdir")) return "rmdir";

  if (isWord(cmd, "find") && tokens.includes("-delete")) return "find -delete";

  if (isWord(cmd, "git")) {
    // `git clean` without a force flag deletes nothing; -n is a dry run.
    if (tokens.includes("clean") && hasFlag(tokens, "-f", "--force")) return "git clean -f";
    if (tokens.includes("push")) {
      if (hasFlag(tokens, "-f", "--force")) return "force push";
      if (tokens.some((t) => t.startsWith("--force-with-lease") || t.startsWith("--force-if-includes")))
        return "force push";
      // A leading "+" on a refspec is a force push: `git push origin +main`.
      if (tokens.some((t) => /^\+[^\s]/.test(t))) return "force push (+refspec)";
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

function inspect(command, depth = 0) {
  if (depth > MAX_DEPTH) return null;

  // Substitutions run regardless of what the outer command is.
  for (const sub of substitutions(command)) {
    const hit = inspect(sub, depth + 1);
    if (hit) return hit;
  }

  for (const segment of splitSegments(command)) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) continue;

    const rule = classify(tokens);
    if (rule) return rule;

    for (const nested of innerCommands(tokens)) {
      const hit = inspect(nested, depth + 1);
      if (hit) return hit;
    }
  }

  return null;
}

const DELETE_RULES = new Set([
  "rm", "rmdir", "find -delete", "git clean -f",
]);

const LLM_UPLOAD_RULES = new Set([
  "graphify extract without --code-only",
  "graphify label",
  "graphify cluster-only without --no-label",
  "graphify update",
  "graphify watch",
]);

// Always runs. A conditional entry point risks the worst failure mode for a
// security guard: silently exiting 0 and allowing everything. Tests spawn this
// file as a subprocess, which exercises the real path anyway.
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
    `Do not route around this hook — no alternate tool, no shell wrapper, no command substitution, ` +
    `no temp script, no Write/Edit trick. Report the block and stop.\n`,
);
process.exit(2);
