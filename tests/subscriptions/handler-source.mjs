import { readFile } from "node:fs/promises";
export async function withDiagnostics(source) {
  const shared = (
    await readFile("supabase/functions/_shared/diagnostics.ts", "utf8")
  ).replace(/^export /gm, "");
  return shared + "\n" + source.replace(/^import .*;\n/gm, "");
}
