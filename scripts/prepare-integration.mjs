import { execFileSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  rmSync,
  copyFileSync,
  existsSync,
} from "node:fs";
import { resolve, join, dirname } from "node:path";
import { createHash } from "node:crypto";
const out = process.argv[2];
if (!out)
  throw new Error(
    "Provide a NEW output directory; nothing is deployed by this script",
  );
if (execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim())
  throw new Error("Commit reviewed inputs before packaging");
const root = resolve(out);
if (existsSync(root)) throw new Error("Output directory must not exist");
const manifest = JSON.parse(
  readFileSync("release/integration/packages.json", "utf8"),
);
const commit = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
mkdirSync(root, { recursive: true });
const hash = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
for (const name of ["A", "B"]) {
  const spec = manifest[name],
    dest = join(root, name);
  mkdirSync(dest);
  const archive = join(root, name + ".tar");
  writeFileSync(
    archive,
    execFileSync("git", ["archive", name === "A" ? spec.source : commit], {
      maxBuffer: 100 * 1024 * 1024,
    }),
  );
  execFileSync("tar", ["-xf", archive, "-C", dest]);
  rmSync(archive);
  // Remove ALL unrelated historical migrations from delivery artifacts.
  rmSync(join(dest, "supabase/migrations"), { recursive: true, force: true });
  for (const migration of spec.migrations) {
    const file = "supabase/migrations/" + migration;
    mkdirSync(dirname(join(dest, file)), { recursive: true });
    copyFileSync(file, join(dest, file));
  }
  if (name === "B")
    writeFileSync(
      join(dest, "apply-approved.sql"),
      "-- Prepared only; requires final production approval and recovery proof.\nBEGIN;\n" +
        spec.migrations
          .map((m) => readFileSync("supabase/migrations/" + m, "utf8"))
          .join("\n") +
        "\nCOMMIT;\n",
    );
  const sha256 = {};
  function walk(dir, prefix = "") {
    for (const entry of readdirSync(dir).sort()) {
      const rel = prefix + entry,
        p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p, rel + "/");
      else sha256[rel] = hash(p);
    }
  }
  walk(dest);
  writeFileSync(
    join(dest, "delivery-manifest.json"),
    JSON.stringify(
      {
        package: name,
        commit: name === "A" ? spec.source : commit,
        ...spec,
        sha256,
      },
      null,
      2,
    ) + "\n",
  );
}
writeFileSync(
  join(root, "README.txt"),
  "Prepared only. A then B; never downgrade B functions to A. See B/docs/security/INTEGRACAO_IMPLANTACAO.md. No deployment executed.\n",
);
console.log(
  JSON.stringify({
    output: root,
    sourceCommit: commit,
    packages: ["A", "B"],
    deployed: false,
  }),
);
