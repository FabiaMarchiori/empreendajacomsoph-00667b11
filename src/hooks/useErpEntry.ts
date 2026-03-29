import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ERP_CONFIG } from "@/config/erp";
import { toast } from "sonner";

interface ErpEntryResult {
  success: boolean;
  is_new_user?: boolean;
  erp_user_id?: string;
  ecosystem_user_id?: string;
  email?: string;
  erp_status?: string;
  message?: string;
  error?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  NO_ACCESS: "Você ainda não possui acesso ao ERP Soph. Verifique seu plano.",
  UNAUTHORIZED: "Sessão expirada. Faça login novamente.",
  MISSING_ECOSYSTEM_USER_ID: "Erro de identificação do usuário.",
  MISSING_OR_INVALID_EMAIL: "E-mail inválido ou ausente.",
  UPSERT_FAILED: "Falha ao provisionar seu acesso no ERP.",
  CONFIG_ERROR: "Erro de configuração da integração.",
  ERP_ERROR: "O ERP Soph está temporariamente indisponível.",
  INTERNAL_ERROR: "Erro interno. Tente novamente em instantes.",
};

export function useErpEntry() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const enterErp = async (): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para acessar o ERP.");
      return false;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke<ErpEntryResult>(
        ERP_CONFIG.proxyFunctionName,
        { body: {} }
      );

      if (error) {
        console.error("[useErpEntry] Invoke error:", error);
        toast.error("Erro ao conectar com o ERP Soph. Tente novamente.");
        return false;
      }

      if (!data?.success) {
        const errorKey = data?.error || "INTERNAL_ERROR";
        const friendlyMessage =
          ERROR_MESSAGES[errorKey] || data?.message || "Erro desconhecido.";
        toast.error(friendlyMessage);
        console.warn("[useErpEntry] ERP entry denied:", errorKey, data?.message);
        return false;
      }

      // Success
      const isNew = data.is_new_user;
      toast.success(
        isNew
          ? "Seu acesso ao ERP Soph foi criado! Redirecionando..."
          : "Acesso verificado! Redirecionando ao ERP Soph..."
      );

      console.info(
        `[useErpEntry] ERP entry success — new_user: ${isNew}, erp_user_id: ${data.erp_user_id}`
      );

      // Redirect to ERP after brief delay for toast visibility
      setTimeout(() => {
        window.open(ERP_CONFIG.appUrl, "_blank", "noopener,noreferrer");
      }, 1200);

      return true;
    } catch (err) {
      console.error("[useErpEntry] Unexpected error:", err);
      toast.error("Erro inesperado ao acessar o ERP. Tente novamente.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { enterErp, isLoading };
}
