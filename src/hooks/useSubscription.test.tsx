import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useSubscription } from "./useSubscription";
const mock = vi.hoisted(() => ({
  user: { id: "fictional-owner" } as { id: string } | null,
  rpc: vi.fn(),
  from: vi.fn(),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mock.user }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mock.rpc, from: mock.from },
}));
afterEach(cleanup);
beforeEach(() => {
  mock.user = { id: "fictional-owner" };
  mock.rpc.mockReset().mockImplementation(async (name) => ({
    data: name === "has_active_subscription" ? true : 0,
    error: null,
  }));
  mock.from.mockReset().mockImplementation(() => {
    const q = {
      select: () => q,
      eq: () => q,
      order: async () => ({
        data: [{ id: "original-purchase", user_id: mock.user?.id }],
        error: null,
      }),
    };
    return q;
  });
});
function mount(
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  return renderHook(() => useSubscription(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}
it("retries the existing server claim before reading subscriptions without a new confirmation flow", async () => {
  const { result } = mount();
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.hasActive).toBe(true);
  expect(result.current.subscriptions[0].id).toBe("original-purchase");
  const calls = mock.rpc.mock.calls.map((c) => c[0]);
  expect(calls[0]).toBe("claim_subscriptions_for_current_user");
  expect(calls).toContain("has_active_subscription");
  expect(mock.rpc).toHaveBeenCalledWith("has_active_subscription", {
    user_uuid: "fictional-owner",
  });
});
it.each(["returned error", "transport exception"])(
  "preserves existing access if claim recovery has a %s",
  async (kind) => {
    mock.rpc.mockImplementation(async (name) => {
      if (name === "claim_subscriptions_for_current_user") {
        if (kind === "transport exception")
          throw new Error("fictional timeout");
        return { data: null, error: { message: "fictional database failure" } };
      }
      return { data: true, error: null };
    });
    const { result } = mount();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasActive).toBe(true);
    expect(result.current.subscriptions[0].id).toBe("original-purchase");
  },
);
it("does not claim or query subscriptions without a logged-in user", () => {
  mock.user = null;
  const { result } = mount();
  expect(result.current.hasActive).toBe(false);
  expect(result.current.subscriptions).toEqual([]);
  expect(mock.rpc).not.toHaveBeenCalled();
  expect(mock.from).not.toHaveBeenCalled();
});

it("refreshes this user's cached benefits after a recovered verified link without changing Stage 1", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const key = ["product-access", "fictional-owner"];
  client.setQueryDefaults(key, {
    queryFn: async () => ({ soph: true, erp: true }),
  });
  client.setQueryData(key, { soph: false, erp: false });
  client.setQueryData(["product-access", "another-owner"], {
    soph: false,
    erp: false,
  });
  let claimed = false;
  mock.rpc.mockImplementation(async (name) => {
    if (name === "claim_subscriptions_for_current_user") {
      const data = claimed ? 0 : 1;
      claimed = true;
      return { data, error: null };
    }
    return { data: true, error: null };
  });
  const { result } = mount(client);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  await waitFor(() =>
    expect(client.getQueryData(key)).toEqual({ soph: true, erp: true }),
  );
  expect(client.getQueryData(["product-access", "another-owner"])).toEqual({
    soph: false,
    erp: false,
  });
});
