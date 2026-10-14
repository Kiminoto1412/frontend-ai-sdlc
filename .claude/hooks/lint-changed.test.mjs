// Tests for the lint-on-edit guard. Run: node .claude/hooks/lint-changed.test.mjs
//
// Spawns the hook with a real payload on stdin, the same way Claude Code does.
// Exit 2 = lint failure reported back, exit 0 = nothing to say.

import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const HOOK = path.join(here, "lint-changed.mjs");
const PROJECT = path.resolve(here, "..", "..");

// Scratch files live under the project so eslint resolves the real config.
const scratch = path.join(PROJECT, ".lint-hook-scratch");

function run(toolName, filePath) {
  return spawnSync("node", [HOOK], {
    input: JSON.stringify({ tool_name: toolName, tool_input: { file_path: filePath } }),
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: PROJECT },
  }).status;
}

let failures = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${label} (exit ${actual}, expected ${expected})`);
}

mkdirSync(scratch, { recursive: true });
try {
  const dirty = path.join(scratch, "dirty.ts");
  const clean = path.join(scratch, "clean.ts");
  const notCode = path.join(scratch, "notes.md");

  // 'let' never reassigned + unused binding: warnings, which --max-warnings 0 fails on.
  writeFileSync(dirty, "export function f() {\n  const unused = 1;\n  return 2;\n}\n");
  writeFileSync(clean, "export function f(): number {\n  return 2;\n}\n");
  writeFileSync(notCode, "# just a document\n");

  console.log("--- must REPORT a lint failure (exit 2) ---");
  check("dirty .ts after Edit", run("Edit", dirty), 2);
  check("dirty .ts after Write", run("Write", dirty), 2);

  console.log("\n--- must stay quiet (exit 0) ---");
  check("clean .ts", run("Edit", clean), 0);
  check("non-code file", run("Edit", notCode), 0);
  check("non-edit tool", run("Bash", dirty), 0);
  check("file outside the project", run("Edit", "/tmp/elsewhere.ts"), 0);
  check("generated output", run("Edit", path.join(PROJECT, "coverage", "x.js")), 0);
  check("missing file", run("Edit", path.join(scratch, "gone.ts")), 0);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
