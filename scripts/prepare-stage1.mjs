import { readFile, writeFile, mkdir, rm, copyFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve, join } from "node:path";
const root = process.cwd(),
  out = resolve(process.argv[2] || "/workspace/work/stage1-plan-benefits");
const manifest = JSON.parse(
  await readFile("release/stage1-plan-benefits.json", "utf8"),
);
// Never overwrite an existing checkout or artifact. All removal below is confined
// to the fresh archive directory created by this script, never the repository.
await mkdir(out, { recursive: false });
const archive = execFileSync(
  "git",
  ["archive", "--format=tar", manifest.baseRef],
  { maxBuffer: 64 * 1024 * 1024 },
);
execFileSync("tar", ["-x", "-C", out], { input: archive });
await rm(join(out, "supabase"), { recursive: true, force: true });
const files = [
  ...manifest.frontend,
  ...manifest.tests,
  manifest.migration,
  ...manifest.edgeFunctions.map(
    (name) => `supabase/functions/${name}/index.ts`,
  ),
];
for (const file of files) {
  await mkdir(resolve(out, file, ".."), { recursive: true });
  await copyFile(join(root, file), join(out, file));
}
// Unchanged ERP endpoint is copied from the base only for regression tests.
// It is not part of edgeFunctions and must not be deployed by this release.
for (const file of manifest.validationOnlyFromBase) {
  await mkdir(resolve(out, file, ".."), { recursive: true });
  await writeFile(
    join(out, file),
    execFileSync("git", ["show", `${manifest.baseRef}:${file}`]),
  );
}
const pkg = JSON.parse(await readFile("package.json", "utf8"));
pkg.scripts["test:subscriptions"] =
  "node tests/subscriptions/stage1-benefits.mjs && node tests/subscriptions/endpoints.mjs";
pkg.scripts["test:stage1"] = pkg.scripts["test:subscriptions"];
delete pkg.scripts["prepare:stage1"];
await writeFile(join(out, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
await copyFile("package-lock.json", join(out, "package-lock.json"));
await writeFile(
  join(out, "stage1-manifest.json"),
  JSON.stringify(
    {
      ...manifest,
      baseCommit: execFileSync("git", ["rev-parse", manifest.baseRef], {
        encoding: "utf8",
      }).trim(),
    },
    null,
    2,
  ) + "\n",
);
console.log(`Prepared isolated Stage 1 package: ${out}`);
