import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { withoutConsole } from "../security/runtime.mjs";
const old = (ref, path) =>
  execFileSync("git", ["show", `${ref}:${path}`], { encoding: "utf8" });
const spec = JSON.parse(
  readFileSync("release/integration/packages.json", "utf8"),
);
for (const name of spec.B.migrations) {
  const p = "supabase/migrations/" + name;
  assert.equal(readFileSync(p, "utf8"), old("8ce43ee", p));
}
console.log(
  "PASS Four migrations are the original focused PR4 migrations, not commercial/Stage1 changes",
);
const normalize = (s, p) =>
  withoutConsole(
    s
      .replace(/^import .*diagnostics.*;\n/gm, "")
.replace("`Acesso liberado para ${email}`","\"Acesso liberado para a compra identificada\"")
.replace("`Acesso liberado para ${email}; e-mail n\u00e3o enviado: identificador est\u00e1vel da compra ausente`","\"Acesso liberado; e-mail n\u00e3o enviado: identificador est\u00e1vel da compra ausente\"")
      .replace(/logEvent\(/g, "console.log(")
      .replace(
        "technicalWebhookPayload(payload)",
        "payload as Record<string, unknown>",
      )
      .replace(
        'subError?.message || "Assinatura não ficou ativa após o registro"',
        '"Falha ao persistir assinatura ativa"',
      )
      .replace(
        "`Acesso revogado para ${email}`",
        '"Acesso revogado para a compra identificada"',
      ),
    p,
  );
for (const slug of ["kiwify-webhook", "generate-soph-token"]) {
  const p = `supabase/functions/${slug}/index.ts`;
  assert.equal(
    normalize(readFileSync(p, "utf8"), p),
    normalize(old("8ce43ee", p), p),
  );
  console.log(
    `PASS ${slug}: PR4 processing/authorization retained outside explicit log redaction`,
  );
}
const changed = execFileSync(
  "git",
  [
    "diff",
    "--name-only",
    "4fdd39f",
    "--",
    "src/contexts",
    "src/integrations",
    "src/hooks/usePlanAccess.ts",
    "src/hooks/useErpAccess.ts",
    "src/pages/Obrigado.tsx",
    "src/legal",
    "docs/legal",
  ],
  { encoding: "utf8" },
);
assert.equal(changed.trim(), "");
console.log("PASS Auth/product/ERP/thank-you/legal implementations unchanged");
assert.deepEqual(spec.A.migrations, []);
assert.equal(spec.B.migrations.length, 4);
console.log(
  "PASS A has no migrations; B allowlists exactly four focused migrations",
);
