import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve, dirname, join } from "node:path";
const root = process.cwd();
const out = resolve(process.argv[2] || "/workspace/work/stage2-subscriptions");
const manifest = JSON.parse(
  await readFile("release/stage2-subscriptions.json", "utf8"),
);
const stage1 = JSON.parse(await readFile(manifest.stage1Manifest, "utf8"));
const protectedStage1 = [
  ...stage1.frontend,
  ...stage1.tests,
  stage1.migration,
  ...stage1.edgeFunctions.map((n) => `supabase/functions/${n}/index.ts`),
  manifest.stage1Manifest,
  "scripts/prepare-stage1.mjs",
  "docs/stage1-plan-benefits.md",
];
// Refuse packaging if this task changed Stage 1, including uncommitted changes.
execFileSync(
  "git",
  [
    "diff",
    "--exit-code",
    manifest.preserveStage1Commit,
    "--",
    ...protectedStage1,
  ],
  { stdio: "pipe" },
);
// The Stage 1 generator creates a fresh archive and refuses existing destinations.
execFileSync(process.execPath, ["scripts/prepare-stage1.mjs", out], {
  stdio: "inherit",
});
const files = [
  ...manifest.migrationsInOrder,
  ...manifest.frontend,
  ...manifest.tests,
  ...manifest.documentation,
  ...manifest.edgeFunctions.map((n) => `supabase/functions/${n}/index.ts`),
  "release/stage2-subscriptions.json",
  manifest.stage1Manifest,
  "docs/stage1-plan-benefits.md",
];
for (const file of files) {
  await mkdir(dirname(join(out, file)), { recursive: true });
  await copyFile(join(root, file), join(out, file));
}
const pkg = JSON.parse(await readFile("package.json", "utf8"));
pkg.scripts["test:subscriptions"] =
  "npm run test:stage1 && npm run test:stage2";
delete pkg.scripts["prepare:stage1"];
delete pkg.scripts["prepare:stage2"];
await writeFile(join(out, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
const stage1Built = JSON.parse(
  await readFile(join(out, "stage1-manifest.json"), "utf8"),
);
const tracked = [
  ...new Set([
    ...files,
    ...stage1.frontend,
    ...stage1.tests,
    stage1.migration,
    ...stage1.edgeFunctions.map((n) => `supabase/functions/${n}/index.ts`),
    ...stage1.validationOnlyFromBase,
    "package.json",
    "package-lock.json",
  ]),
];
const sha256 = {};
for (const file of tracked)
  sha256[file] = createHash("sha256")
    .update(await readFile(join(out, file)))
    .digest("hex");
await writeFile(
  join(out, "stage2-manifest.json"),
  JSON.stringify(
    {
      ...manifest,
      baseCommit: stage1Built.baseCommit,
      sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      stage1Preserved: true,
      sourceDirty:
        execFileSync("git", ["status", "--porcelain"], {
          encoding: "utf8",
        }).trim().length > 0,
      sha256,
    },
    null,
    2,
  ) + "\n",
);
console.log(`Prepared Stage 2 package preserving Stage 1: ${out}`);
