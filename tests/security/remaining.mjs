import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log("PASS", name);
};
test("No runtime, commercial, payment or subscription migration changes versus PR7", () => {
  const changed = execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "25d3c68",
      "--",
      "src",
      "supabase/functions",
      "supabase/migrations",
    ],
    { encoding: "utf8" },
  );
  assert.equal(changed.trim(), "");
});
test("Official CORS and existing input limits are inherited unchanged", () => {
  assert.ok(
    readFileSync("supabase/functions/_shared/http.ts", "utf8").includes(
      "https://app.empreendajacomsoph.com.br",
    ),
  );
  for (const path of [
    "supabase/functions/_shared/http.ts",
    "supabase/functions/soph-chat/index.ts",
    "public/_headers",
  ])
    assert.equal(
      readFileSync(path, "utf8"),
      execFileSync("git", ["show", `25d3c68:${path}`], { encoding: "utf8" }),
    );
});
test("Monitoring is prepared without enabling a scheduled workflow", () => {
  const path = ".github/workflow-templates/security-monitor.yml";
  assert.ok(existsSync(path));
  assert.ok(!existsSync(".github/workflows/security-monitor.yml"));
  const workflow = readFileSync(path, "utf8");
  assert.ok(workflow.includes("contents: read"));
  assert.ok(workflow.includes("persist-credentials: false"));
  assert.ok(workflow.includes("npm run security:audit"));
  assert.ok(workflow.includes("steps.audit.outcome != 'success'"));
  assert.ok(!workflow.includes("secrets."));
  assert.ok(!workflow.includes("issues: write"));
});
test("SQL delivery changes only three helper definitions and no grants/RLS/records", () => {
  const sql = readFileSync(
    "release/security-definer/restrict-targets.sql",
    "utf8",
  );
  assert.equal((sql.match(/CREATE OR REPLACE FUNCTION/g) || []).length, 3);
  assert.ok(
    !/^\s*(GRANT|REVOKE|ALTER POLICY|CREATE POLICY|UPDATE |DELETE |INSERT |DROP )/im.test(
      sql,
    ),
  );
  assert.ok(sql.includes("Definition drift"));
  assert.ok(sql.includes("auth.role() = 'service_role'"));
});
console.log(`${passed} remaining-security scope checks passed`);
