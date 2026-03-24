import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function SophFloatingButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/soph") return null;

  const quickActions = [
    { label: "Por onde começo?", action: () => navigate("/soph") },
    { label: "Me ajude a precificar", action: () => navigate("/soph") },
    { label: "Quero encontrar fornecedores", action: () => navigate("/fornecedores") },
    { label: "Conversar com a Soph", action: () => navigate("/soph") },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-72 bg-gradient-card border border-border rounded-xl p-4 shadow-glow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Soph, sua Sócia Digital</p>
                <p className="text-[11px] text-muted-foreground">Como posso te ajudar?</p>
              </div>
            </div>
            <div className="space-y-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => { qa.action(); setOpen(false); }}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-secondary/50 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="h-14 w-14 rounded-full bg-gradient-primary-btn text-primary-foreground flex items-center justify-center shadow-glow hover:shadow-lg transition-shadow"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </motion.button>
    </div>
  );
}
