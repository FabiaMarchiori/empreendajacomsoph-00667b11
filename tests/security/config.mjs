import assert from "node:assert/strict";
import {
  readFileSync,
  existsSync,
  mkdtempSync,
  writeFileSync,
  chmodSync,
  rmSync,
} from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, delimiter } from "node:path";
import { withoutConsole, canonicalRuntime } from "./runtime.mjs";
import { createHash } from "node:crypto";
let passed = 0;
const test = (n, f) => {
  f();
  passed++;
  console.log("PASS", n);
};
const headers = readFileSync("public/_headers", "utf8");
for (const value of [
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: strict-origin-when-cross-origin",
  "X-Frame-Options: SAMEORIGIN",
  "Strict-Transport-Security: max-age=31536000; includeSubDomains",
  "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "X-DNS-Prefetch-Control: off",
  "X-Permitted-Cross-Domain-Policies: none",
])
  test(value, () => assert.ok(headers.includes("  " + value)));
test("Netlify wildcard applies and Vite copies headers to publish directory", () => {
  assert.equal(headers.split("\n")[0], "/*");
  assert.equal(readFileSync("dist/_headers", "utf8"), headers);
});
test("No untested CSP/COEP policy is added", () => {
  assert.ok(!headers.includes("Content-Security-Policy"));
  assert.ok(!headers.includes("Cross-Origin-Embedder-Policy"));
});

for (const path of [
  "src/hooks/useErpEntry.ts",
  "src/pages/ForgotPassword.tsx",
  "src/pages/ResetPassword.tsx",
  "src/pages/Soph.tsx",
  "src/pages/NotFound.tsx",
  "src/lib/pwa.ts",
])
  test(`${path}: runtime unchanged after removing console statements and erased types`, () => {
    const old = execFileSync("git", ["show", `4fdd39f:${path}`], {
        encoding: "utf8",
      }),
      now = readFileSync(path, "utf8");
    assert.equal(withoutConsole(now, path), withoutConsole(old, path));
  });
test("No changes to DB/Auth/product/legal source and PR4 migrations", () => {
  const changed = execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "4fdd39f",
      "--",
      "supabase/migrations",
      "src/contexts",
      "src/integrations",
      "src/hooks/useSubscription.ts",
      "src/hooks/usePlanAccess.ts",
      "src/hooks/useErpAccess.ts",
      "src/pages/Obrigado.tsx",
      "docs/legal",
      "src/legal",
    ],
    { encoding: "utf8" },
  );
  assert.equal(changed.trim(), "");
});
test("Soph existing system prompt stays identical", () => {
  const before = execFileSync(
    "git",
    ["show", "4fdd39f:supabase/functions/soph-chat/index.ts"],
    { encoding: "utf8" },
  );
  const now = readFileSync("supabase/functions/soph-chat/index.ts", "utf8");
  const prompt = (s) => s.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/)[1];
  assert.equal(prompt(now), prompt(before));
});
test("ERP secret prefix and client SSO URL are absent from log statements", () => {
  const server = readFileSync("supabase/functions/erp-entry/index.ts", "utf8");
  assert.ok(!/ecosystemSecret\.(substring|slice)/.test(server));
  const client = readFileSync("src/hooks/useErpEntry.ts", "utf8");
  for (const line of client.split("\n").filter((l) => l.includes("console.")))
    assert.ok(!/entry_url|data\)|err\)|error\)/.test(line));
});
test("Unused zod/resolvers removed without framework major upgrades", () => {
  const p = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(p.dependencies.zod, undefined);
  assert.equal(p.dependencies["@hookform/resolvers"], undefined);
  assert.match(p.devDependencies.vite, /5\./);
  assert.match(p.devDependencies.vitest, /3\./);
});
test("Single current Bun lock and consistent npm manifest", () => {
  assert.ok(existsSync("bun.lock"));
  assert.ok(!existsSync("bun.lockb"));
  const p = JSON.parse(readFileSync("package.json", "utf8")),
    lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  assert.deepEqual(lock.packages[""].dependencies, p.dependencies);
  assert.deepEqual(lock.packages[""].devDependencies, p.devDependencies);
});
test("Legacy code generator preserves the audited production runtime exactly outside logs", () => {
  const baseline = JSON.parse(
    readFileSync("docs/security/deployed-baseline.json", "utf8"),
  ).functions.find((f) => f.slug === "generate-soph-token");
  const code = readFileSync(
    "supabase/functions/generate-soph-token/index.ts",
    "utf8",
  );
  const hash = createHash("sha256")
    .update(canonicalRuntime(code, "index.ts"))
    .digest("hex");
  assert.equal(hash, baseline.runtime_without_console_sha256);
});
function fakeAudit(report) {
  const dir = mkdtempSync(join(tmpdir(), "security-audit-fixture-"));
  try {
    const command = join(dir, "npm");
    writeFileSync(
      command,
      "#!/usr/bin/env node\nconsole.log(process.env.SECURITY_AUDIT_FIXTURE);process.exit(1);\n",
    );
    chmodSync(command, 0o700);
    return spawnSync(process.execPath, ["scripts/security-audit.mjs"], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: dir + delimiter + process.env.PATH,
        SECURITY_AUDIT_FIXTURE: JSON.stringify(report),
      },
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
test("Dependency monitor fails for a new critical advisory", () => {
  const r = fakeAudit({
    metadata: { vulnerabilities: { critical: 1, total: 1 } },
    vulnerabilities: {
      "new-fixture-package": {
        severity: "critical",
        via: [{ url: "https://example.test/new-advisory" }],
      },
    },
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /New\/unreviewed/);
});
test("Dependency monitor never declares success if the registry check fails", () => {
  const r = fakeAudit({ error: { code: "fixture-registry-unavailable" } });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /npm audit failed/);
});
console.log(`${passed} security headers/scope/configuration tests passed`);
