import { describe, expect, it } from "vitest";
import { createPreviewHandler } from "../../../../supabase/functions/soph-gestao-preview/authorize";

const origin = "https://preview.example.test";
const configuration = {
  adminId: "admin-id",
  origin,
  async getUser(token: string) {
    if (token === "auth-failure") throw new Error("Auth unavailable");
    if (token === "admin") return { id: "admin-id" };
    if (token === "anonymous") return { id: "admin-id", is_anonymous: true };
    if (token === "member") return { id: "member-id" };
    return null;
  },
};

function request(token?: string, requestOrigin = origin) {
  return new Request(`${origin}/function`, {
    method: "POST",
    headers: { Origin: requestOrigin, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ adminId: "admin-id" }),
  });
}

describe("server authorization for the Soph Gestão preview", () => {
  it.each([
    ["admin", 200],
    ["member", 403],
    ["anonymous", 403],
    ["expired", 401],
    [undefined, 401],
    ["auth-failure", 503],
  ] as const)("returns the expected status for %s", async (token, status) => {
    const response = await createPreviewHandler(configuration)(request(token));
    expect(response.status).toBe(status);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ allowed: status === 200 });
  });

  it("denies unconfigured releases and unapproved browser origins", async () => {
    const unconfigured = createPreviewHandler({ ...configuration, adminId: undefined });
    expect((await unconfigured(request("admin"))).status).toBe(503);
    const response = await createPreviewHandler(configuration)(request("admin", "https://other.example.test"));
    expect(response.status).toBe(403);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("accepts preflight only for the configured origin", async () => {
    const response = await createPreviewHandler(configuration)(new Request(origin, {
      method: "OPTIONS",
      headers: { Origin: origin },
    }));
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
  });
});
