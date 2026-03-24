import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Send, ArrowRight } from "lucide-react";
import { useState } from "react";

const shortcuts = [
  { label: "Fornecedores", emoji: "📦" },
  { label: "Abrir MEI", emoji: "📋" },
  { label: "Registrar Marca", emoji: "🛡️" },
  { label: "Presença Online", emoji: "🌐" },
  { label: "Marketplaces", emoji: "🛒" },
  { label: "Precificação", emoji: "💰" },
  { label: "ERP / Gestão", emoji: "📊" },
  { label: "Gestão do Negócio", emoji: "🏢" },
];

const quickQuestions = [
  "Por onde devo começar meu negócio?",
  "Como escolher os melhores fornecedores?",
  "Qual a diferença entre MEI e ME?",
  "Como precificar meus produtos?",
  "Preciso de um site para vender?",
];

export default function SophPage() {
  const [messages, setMessages] = useState<{ role: "soph" | "user"; text: string }[]>([
    { role: "soph", text: "Olá! Sou a Soph, sua Sócia Digital. 💜 Estou aqui para te ajudar em cada etapa do seu negócio. O que você gostaria de saber?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "soph", text: "Essa é uma ótima pergunta! Na versão completa, vou analisar seu contexto e te dar uma orientação personalizada. Por enquanto, explore as áreas da plataforma para avançar na sua jornada! 🚀" },
    ]);
    setInput("");
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4 animate-float">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Soph, sua Sócia Digital</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">Agente virtual consultiva, prática, acolhedora e inteligente. Pronta para te orientar.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-card rounded-xl border border-border flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground border border-border"
                }`}>
                  {msg.role === "soph" && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageCircle className="h-3 w-3 text-primary" />
                      <span className="text-[11px] font-medium text-primary">Soph</span>
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick questions */}
          <div className="px-5 pb-2 flex flex-wrap gap-1.5">
            {quickQuestions.map((q) => (
              <button key={q} onClick={() => sendMessage(q)} className="px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Digite sua pergunta para a Soph..."
                className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button onClick={() => sendMessage(input)} className="px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Shortcuts sidebar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Atalhos por assunto</h3>
            <div className="space-y-1.5">
              {shortcuts.map((s) => (
                <button key={s.label} onClick={() => sendMessage(`Me ajude com ${s.label.toLowerCase()}`)} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left">
                  <span className="text-base">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
