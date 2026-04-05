import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { LogOut, User, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SidebarAccountBlock({ collapsed }: { collapsed: boolean }) {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  if (!user) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-white font-semibold hover:bg-white/5 transition-colors"
      >
        <LogIn className="h-4 w-4 text-primary flex-shrink-0" />
        {!collapsed && <span>Entrar</span>}
      </button>
    );
  }

  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? " " + profile.last_name[0] + "." : ""}`
    : user.email?.split("@")[0] || "Usuário";

  const initials = profile?.first_name
    ? (profile.first_name[0] + (profile.last_name?.[0] || "")).toUpperCase()
    : (user.email?.[0] || "U").toUpperCase();

  if (collapsed) {
    return (
      <button
        onClick={() => navigate("/conta")}
        className="flex items-center justify-center w-full"
        title={displayName}
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-primary-btn flex items-center justify-center text-xs font-bold text-primary-foreground">
          {initials}
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-xl p-3 border border-white/10" style={{ background: '#0A192F' }}>
      <button
        onClick={() => navigate("/conta")}
        className="flex items-center gap-3 w-full text-left group"
      >
        <div className="h-9 w-9 rounded-lg bg-gradient-primary-btn flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">{displayName}</p>
          <p className="text-[10px] text-white/50 truncate">{user.email}</p>
        </div>
      </button>
      <div className="mt-2 pt-2 border-t border-white/10">
        <button
          onClick={async () => { await signOut(); navigate("/login"); }}
          className="flex items-center gap-2 text-xs text-white/60 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="h-3.5 w-3.5" /> Sair da conta
        </button>
      </div>
    </div>
  );
}
