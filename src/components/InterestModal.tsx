import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InterestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleTitle: string;
}

export function InterestModal({ open, onOpenChange, moduleTitle }: InterestModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = () => {
    setSubmitted(true);
    setTimeout(() => {
      onOpenChange(false);
      setTimeout(() => setSubmitted(false), 300);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(() => setSubmitted(false), 300); }}>
      <DialogContent className="sm:max-w-md bg-[#0A192F] border-primary/20">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-white font-display text-lg">{moduleTitle}</DialogTitle>
                <DialogDescription className="text-white/70 text-sm leading-relaxed">
                  Este módulo ainda está em desenvolvimento. Registre seu interesse e avisaremos assim que estiver disponível.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-white/20 text-white hover:bg-white/10">
                  Voltar
                </Button>
                <Button onClick={handleConfirm} className="flex-1 bg-gradient-primary-btn text-[#0A192F] font-bold hover:brightness-110">
                  Quero ser avisado
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-4">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <p className="text-white font-display font-bold text-lg mb-1">Interesse registrado!</p>
              <p className="text-white/60 text-sm">Você será avisado quando <strong className="text-white/80">{moduleTitle}</strong> estiver disponível.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
