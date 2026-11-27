import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { createPreviewHandler } from "./authorize.ts";

const auth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(createPreviewHandler({
  adminId: Deno.env.get("SOPH_GESTAO_PREVIEW_ADMIN_ID"),
  origin: Deno.env.get("SOPH_GESTAO_PREVIEW_ORIGIN"),
  async getUser(token) {
    const { data, error } = await auth.auth.getUser(token);
    if (error && error.status !== 401 && error.status !== 403) throw error;
    return error ? null : data.user;
  },
}));
