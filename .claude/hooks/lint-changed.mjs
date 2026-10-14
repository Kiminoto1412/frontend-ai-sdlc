#!/usr/bin/env node
// PostToolUse hook: lint the file that was just written.
//
// Lints the single changed file rather than the whole project, so the cost is
// a second per edit instead of a full-repo pass. `npm run lint` still exists
// for the whole tree; this only keeps new problems from accumulating silently.
//
// Exit 0 = nothing to say, exit 2 = report the lint failure back to the agent.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);
const LINTABLE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const SKIP_DIRS = ["node_modules", ".next", "coverage", "storybook-static", "graphify-out", ".agents"];

function readStdin() {
  return new Promise((resolve) => {
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (raw += c));
    process.stdin.on("end", () => resolve(raw));
  });
}

const raw = await readStdin();

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0); // Malformed payload: stay quiet rather than nag on every edit.
}

if (!EDIT_TOOLS.has(payload.tool_name)) process.exit(0);

const filePath = payload.tool_input?.file_path ?? payload.tool_input?.notebook_path;
if (typeof filePath !== "string" || !LINTABLE.has(path.extname(filePath))) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const rel = path.relative(projectDir, filePath);
// Outside the project, or inside generated output: not ours to lint.
if (rel.startsWith("..") || path.isAbsolute(rel)) process.exit(0);
if (rel.split(path.sep).some((seg) => SKIP_DIRS.includes(seg))) process.exit(0);

const eslint = path.join(projectDir, "node_modules", ".bin", "eslint");
// No install (fresh clone, or node_modules removed) — a missing linter must not
// turn every edit into an error.
if (!existsSync(eslint) || !existsSync(filePath)) process.exit(0);

const res = spawnSync(eslint, ["--max-warnings", "0", filePath], {
  cwd: projectDir,
  encoding: "utf8",
  timeout: 30_000,
});

if (res.status === 0) process.exit(0);

// ESLint could not run at all (config error, timeout). Report it, but do not
// pretend the file is dirty.
if (res.status === null || res.error) {
  process.stderr.write(
    `eslint could not run on ${rel}: ${res.error?.message ?? "timed out"}\n`,
  );
  process.exit(0);
}

process.stderr.write(
  `Lint failed on ${rel} (project hook: .claude/hooks/lint-changed.mjs)\n\n` +
    `${(res.stdout || res.stderr).trim()}\n\n` +
    `Fix it now, in this file, before moving on — lint problems are not left for later ` +
    `in this project. \`npx eslint --fix ${rel}\` handles the mechanical ones. ` +
    `Warnings count as failures here (\`--max-warnings 0\`), deliberately, so they cannot accumulate.\n`,
);
process.exit(2);
