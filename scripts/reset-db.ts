/**
 * Reset the Farmart development database.
 *
 * Deletes farmart.db (and WAL/SHM files) so that the next request to the
 * dev server triggers a fresh schema creation + auto-seed.
 *
 * Usage:
 *   npm run db:reset
 */
import { existsSync, rmSync } from "fs";
import { join } from "path";

const root = join(process.cwd(), "data");
const files = ["farmart.db", "farmart.db-shm", "farmart.db-wal"];

let deleted = 0;
for (const file of files) {
  const full = join(root, file);
  if (existsSync(full)) {
    rmSync(full);
    console.log(`Deleted: ${file}`);
    deleted++;
  }
}

if (deleted === 0) {
  console.log("No database files found — nothing to reset.");
} else {
  console.log(`\nDatabase reset. Restart the dev server to re-seed.`);
  console.log("  npm run dev");
}
