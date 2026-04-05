import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Send, Package, FileText, Shield, Globe, ShoppingCart, DollarSign, BarChart3, Building2, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import sophAvatar from "@/assets/soph-avatar.png";

const shortcuts = [
  { label: "Fornecedores", desc: "Encontre os melhores parceiros", icon: Package },
  { label: "Abrir MEI", desc: "Formalize seu negócio", icon: FileText },
  { label: "Registrar Marca", desc: "Proteja sua identidade", icon: Shield },
  { label: "Presença Online", desc: "Domine o digital", icon: Globe },
  { label: "Marketplaces", desc: "Venda em grandes canais", icon: ShoppingCart },
  { label: "Precificação", desc: "Preço certo, lucro real", icon: DollarSign },
  { label: "ERP / Gestão", desc: "Controle sua operação", icon: BarChart3 },
  { label: "Gestão do Negócio", desc: "Visão completa do seu negócio", icon: Building2 },
];

const quickQuestions = [
  "Por onde devo começar meu negócio?",
  "Como calcular meu preço corretamente?",
  "Como escolher melhores fornecedores?",
];

export default function SophPage() {
  const [messages, setMessages] = useState<{ role: "soph" | "user"; text: string }[]>([
    { role: "soph", text: "Olá! Sou a Soph, sua sócia digital. Em breve vou poder te orientar com inteligência real sobre cada etapa do seu negócio. Por enquanto, explore os atalhos ao lado para navegar pelo ecossistema! 💜" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "soph", text: "Ainda estou em fase de preparação para responder com inteligência real. Em breve, vou conseguir te orientar de forma personalizada. Enquanto isso, use os atalhos rápidos para explorar o ecossistema! 🚀" },
    ]);
    setInput("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div className="h-16 w-16 rounded-full border-2 border-primary/40 flex items-center justify-center mx-auto shadow-glow-sm overflow-hidden">
          <img src={sophAvatar} alt="Soph" width={64} height={64} className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-white mb-1">
            Soph, sua <span className="text-gradient-primary">Sócia Digital</span>
          </h1>
          <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
            Navegue pelo ecossistema e em breve a Soph vai te orientar com inteligência real.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat area */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-[hsl(210,63%,10%)] backdrop-blur-sm rounded-xl border border-primary/20 flex flex-col h-[420px] sm:h-[500px]">
            <div className="px-5 py-3 border-b border-primary/15 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/30">
                <img src={sophAvatar} alt="Soph" width={32} height={32} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Conversa com a Soph</p>
                <p className="text-[10px] text-white/50">Em breve com inteligência real</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-5">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-primary-btn text-white rounded-br-md shadow-[0_2px_12px_-2px_hsl(var(--primary)/0.4)]"
                        : "bg-[hsl(210,63%,14%)] text-white border border-primary/15 rounded-bl-md"
                    }`}>
                      {msg.role === "soph" && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span className="text-[11px] font-semibold text-gradient-primary">Soph</span>
                        </div>
                      )}
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick questions - discrete */}
            <div className="px-5 pb-2 flex flex-wrap gap-1.5">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 rounded-full bg-[hsl(210,63%,14%)] border border-primary/15 text-[10px] text-white/60 font-medium hover:border-primary/30 hover:text-white/80 transition-all duration-200 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-primary/15">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Escreva sua dúvida..."
                  className="flex-1 bg-[hsl(210,63%,14%)] border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="px-5 rounded-xl bg-gradient-primary-btn text-[#0A192F] font-medium hover:brightness-110 transition-all shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar - Shortcuts */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-[hsl(210,63%,10%)] backdrop-blur-sm rounded-xl border border-primary/15 p-5">
            <h3 className="font-display font-semibold text-sm text-white mb-3">Atalhos rápidos</h3>
            <div className="space-y-1">
              {shortcuts.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => sendMessage(`Me ajude com ${s.label.toLowerCase()}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left hover:bg-primary/10 transition-all duration-200 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-white group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{s.label}</p>
                      <p className="text-[10px] text-white/60 truncate">{s.desc}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-white/30 ml-auto flex-shrink-0 group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
