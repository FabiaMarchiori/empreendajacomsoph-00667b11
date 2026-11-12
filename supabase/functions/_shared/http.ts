// CORS controls browser response access; Auth and product authorization stay in each handler.
const origins = new Set([
  "https://app.empreendajacomsoph.com.br",
  "https://appempreendajacomsoph.netlify.app",
  "https://empreendajacomsophi.netlify.app",
  "https://appempreendajacomsoph.lovable.app",
]);
const previews = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject-dev\.com$/,
  /^https:\/\/[a-z0-9-]+\.gpt-eng\.com$/,
  /^https:\/\/[a-z0-9-]+--(?:appempreendajacomsoph|empreendajacomsophi)\.netlify\.app$/,
  /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
];
export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed =
    origins.has(origin) || previews.some((pattern) => pattern.test(origin));
  return {
    ...(allowed ? { "Access-Control-Allow-Origin": origin } : {}),
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Expose-Headers": "X-Request-Id",
    "Cache-Control": "no-store",
  };
}

export class RequestProblem extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
// Count actual bytes while reading: Content-Length alone is attacker-controlled.
export async function readBoundedJson(
  req: Request,
  maxBytes: number,
): Promise<unknown> {
  const length = req.headers.get("Content-Length");
  if (length && Number(length) > maxBytes)
    throw new RequestProblem(413, "Requisição muito grande.");
  if (
    !req.headers
      .get("Content-Type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new RequestProblem(415, "Envie conteúdo JSON.");
  const reader = req.body?.getReader();
  if (!reader) throw new RequestProblem(400, "Conteúdo JSON obrigatório.");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new RequestProblem(413, "Requisição muito grande.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const content = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    content.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(content));
  } catch {
    throw new RequestProblem(400, "JSON inválido.");
  }
}
