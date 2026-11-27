interface PreviewUser {
  id: string;
  is_anonymous?: boolean;
}

export function createPreviewHandler({
  adminId,
  origin,
  getUser,
}: {
  adminId?: string;
  origin?: string;
  getUser: (token: string) => Promise<PreviewUser | null>;
}) {
  return async (request: Request): Promise<Response> => {
    const headers = new Headers({
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
      "Vary": "Origin",
    });
    const requestOrigin = request.headers.get("Origin");
    const respond = (status: number) =>
      new Response(JSON.stringify({ allowed: status === 200 }), { status, headers });

    if (requestOrigin) {
      if (requestOrigin !== origin) return respond(403);
      headers.set("Access-Control-Allow-Origin", requestOrigin);
      headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers",
        "authorization, apikey, content-type, x-client-info, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version");
    }
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return respond(405);

    const token = /^Bearer (\S+)$/i.exec(request.headers.get("Authorization") ?? "")?.[1];
    if (!token) return respond(401);
    if (!adminId || !origin) return respond(503);

    try {
      const user = await getUser(token);
      if (!user) return respond(401);
      return respond(user.id === adminId && !user.is_anonymous ? 200 : 403);
    } catch {
      return respond(503);
    }
  };
}
