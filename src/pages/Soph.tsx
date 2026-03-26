import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Send, Package, FileText, Shield, Globe, ShoppingCart, DollarSign, BarChart3, Building2, Lightbulb, ArrowRight, Zap } from "lucide-react";
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
  "Como escolher melhores fornecedores?",
  "Como calcular meu preço corretamente?",
  "Vale a pena vender em marketplaces?",
  "Preciso abrir MEI agora?",
  "Como criar minha marca?",
];

export default function SophPage() {
  const [messages, setMessages] = useState<{ role: "soph" | "user"; text: string }[]>([
    { role: "soph", text: "Olá! Vi que você já avançou em algumas etapas do ecossistema. Quer que eu te ajude a decidir o próximo passo mais inteligente para o seu negócio? 💜" },
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
      { role: "soph", text: "Essa é uma ótima pergunta! Na versão completa, vou analisar seu contexto e te dar uma orientação personalizada. Por enquanto, explore as áreas da plataforma para avançar na sua jornada! 🚀" },
    ]);
    setInput("");
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="relative mx-auto w-fit">
          <div className="h-20 w-20 rounded-full border-2 border-primary/40 flex items-center justify-center mx-auto animate-float shadow-glow-sm overflow-hidden">
            <img src={sophAvatar} alt="Soph" width={80} height={80} className="h-full w-full object-cover" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
            Soph, sua <span className="text-gradient-primary">Sócia Digital</span>
          </h1>
          <p className="text-sm text-white/80 max-w-lg mx-auto leading-relaxed">
            Sua assistente estratégica para orientar decisões, destravar dúvidas e ajudar você em cada etapa do negócio.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "hsl(var(--primary))" }}></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: "hsl(var(--primary))" }}></span>
          </span>
          <span className="text-xs text-primary font-medium">Pronta para te orientar</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat area */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 flex flex-col gap-4">
          {/* Chat container */}
          <div className="bg-[hsl(210,63%,10%)] backdrop-blur-sm rounded-xl border border-primary/20 flex flex-col h-[520px] shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)]">
            <div className="px-5 py-4 border-b border-primary/15 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full overflow-hidden border border-primary/30">
                <img src={sophAvatar} alt="Soph" width={36} height={36} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Conversa com a Soph</p>
                <p className="text-[11px] text-white/70">Assistente estratégica do ecossistema</p>
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

            {/* Quick questions */}
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3.5 py-2 rounded-full bg-[hsl(210,63%,14%)] border border-primary/25 text-[11px] text-white font-medium hover:border-primary/50 hover:bg-[hsl(210,63%,18%)] hover:shadow-[0_0_12px_-3px_hsl(var(--primary)/0.3)] transition-all duration-200 cursor-pointer"
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
                  placeholder="Escreva sua dúvida e a Soph te orienta com clareza prática..."
                  className="flex-1 bg-[hsl(210,63%,14%)] border border-primary/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="px-6 rounded-xl bg-gradient-primary-btn text-white font-medium hover:brightness-110 transition-all shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar - Shortcuts only */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          {/* Shortcuts */}
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

      {/* Insight da Soph - Bottom */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="bg-[hsl(210,63%,10%)] rounded-xl border border-primary/20 p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary-soft flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 space-y-1.5">
            <h3 className="font-display font-semibold text-sm text-white">Insight da Soph</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Percebi que você já avançou em fornecedores e estruturação. O próximo passo ideal é fortalecer sua presença digital para começar a vender com mais consistência.
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-primary-btn text-white text-sm font-medium hover:brightness-110 transition-all shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)] flex-shrink-0">
            <Zap className="h-4 w-4" />
            Seguir recomendação
          </button>
        </div>
      </motion.div>
    </div>
  );
}
