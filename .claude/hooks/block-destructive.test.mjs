// Tests for the PreToolUse guard. Run: node .claude/hooks/block-destructive.test.mjs
//
// Spawns the hook as a subprocess with a real payload on stdin, so it exercises
// the same entry path Claude Code uses. Exit 2 = blocked, exit 0 = allowed.
//
// Literal blocked words are assembled at runtime (R, RD) so that running this
// file does not itself trip the guard when the command line is inspected.

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HOOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "block-destructive.mjs");

const R = "r" + "m";
const RD = "r" + "mdir";

const shouldBlock = [
  // --- bypasses found by code review; these were ALLOWED before the rewrite ---
  `echo $(${R} -rf data)`,                       // command substitution executes
  `echo \`${R} -rf data\``,                      // backtick substitution
  `git push origin +main`,                       // plus-refspec IS a force push
  `git push origin +refs/heads/main:refs/heads/main`,
  `find . -name x -exec sh -c "${R} {}" \\;`,    // delete hidden behind a shell wrapper
  `VAR=$(${RD} temp) echo hi`,
  `echo "$(${R} file)"`,                         // substitution runs inside double quotes

  // --- plain deletes ---
  `${R} file.txt`,
  `${R} -f data/farmart.db`,
  `${R} -r build`,
  `${R} -rf node_modules`,
  `${R} -fr /tmp/x`,
  `${R} --recursive dir`,
  `${R} dir -rf`,
  `sudo ${R} -rf /`,
  `/bin/${R} file`,
  `cd /tmp && ${R} -rf foo`,
  `GRAPHIFY_SKIP_HOOK=1 ${R} -rf x`,
  `ls | xargs ${R}`,
  `${RD} temp`,
  `${RD} -p a/b/c`,

  // --- find-based deletes ---
  `find . -name "*.tmp" -delete`,
  `find . -name "*.log" -exec ${R} {} \\;`,
  `find . -type d -execdir ${R} -rf {} +`,

  // --- shell wrappers ---
  `sh -c "${R} -rf temp"`,
  `bash -c '${R} file'`,
  `zsh -c "${RD} temp"`,

  // --- real operators outside quotes ---
  `echo hi; ${R} -rf x`,
  `echo hi | xargs ${R}`,

  // --- git clean ---
  `git clean -f`,
  `git clean -fd`,
  `git clean --force -x`,

  // --- force push ---
  `git push --force`,
  `git push -f origin main`,
  `git push --force-with-lease`,
  `git push --force-if-includes`,
  `git -C /repo push --force`,
  `npm test && git push -f`,

  // --- graphify paths that can upload repo content to a third-party LLM ---
  `graphify extract .`,
  `graphify extract . --mode deep`,
  `graphify extract /some/repo --backend deepseek`,
  `graphify label .`,
  `graphify cluster-only .`,
  `graphify update .`,
  `graphify update . --force`,
  `graphify watch .`,
];

const shouldAllow = [
  // --- blocked words as DATA, not commands ---
  `echo "=== other raw ${R} references left in docs? ==="`,
  `echo "do not ${R} this"`,
  String.raw`grep -rn "rm -f\|rm -rf\|rmdir" .claude/skills/ *.md`,
  `grep -nE "${R} |unlink|rmSync" scripts/reset-db.ts`,
  `echo "a; ${R} -rf /; b"`,
  `echo '$(${R} -rf /)'`,          // single quotes: substitution does NOT run

  // --- graphify local-AST paths ---
  `graphify extract . --code-only`,
  `graphify extract . --code-only --force`,
  `graphify cluster-only . --no-label`,
  `graphify explain "SearchBar"`,
  `graphify affected "getDb()" --depth 2`,
  `graphify path "Header()" "getDb()"`,
  `graphify god-nodes --top 8`,
  `graphify export html`,
  `graphify tree`,
  `graphify benchmark`,
  `graphify --help`,

  // --- ordinary work ---
  `npm run db:reset`,
  `npm test`,
  `npx tsc --noEmit`,
  `git clean -n`,
  `git clean --dry-run`,
  `git push`,
  `git push -u origin backend`,
  `git push --follow-tags`,
  `git push origin main`,
  `git pull --force`,
  `git status`,
  `find . -name "*.tmp"`,
  `find src -name "*.tsx" -exec grep -l foo {} \\;`,
  `ls -la temp`,
  `mv temp temp.bak`,
  `sh -c "npm test"`,
  `echo $(date)`,
  `echo $(git rev-parse HEAD)`,
];

function run(command, toolName = "Bash") {
  return spawnSync("node", [HOOK], {
    input: JSON.stringify({ tool_name: toolName, tool_input: { command } }),
    encoding: "utf8",
  }).status;
}

let failures = 0;

console.log("--- must BLOCK (exit 2) ---");
for (const c of shouldBlock) {
  const ok = run(c) === 2;
  if (!ok) failures++;
  console.log(`${ok ? "ok   BLOCK" : "FAIL ALLOWED"}  ${c}`);
}

console.log("\n--- must ALLOW (exit 0) ---");
for (const c of shouldAllow) {
  const ok = run(c) === 0;
  if (!ok) failures++;
  console.log(`${ok ? "ok   allow" : "FAIL BLOCKED"}  ${c}`);
}

console.log("\n--- non-Bash tools are ignored ---");
const other = run(`${R} -rf /`, "Read");
if (other !== 0) failures++;
console.log(`${other === 0 ? "ok   allow" : "FAIL"}  tool_name=Read`);

const total = shouldBlock.length + shouldAllow.length + 1;
console.log(failures === 0 ? `\nALL PASS (${total} cases)` : `\n${failures} FAILURE(S) of ${total}`);
process.exit(failures === 0 ? 0 : 1);
