import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Send, Package, FileText, Shield, Globe, ShoppingCart, DollarSign, BarChart3, Building2, Lightbulb, ArrowRight, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const shortcuts = [
  { label: "Fornecedores", desc: "Encontre os melhores parceiros", icon: Package, emoji: "📦" },
  { label: "Abrir MEI", desc: "Formalize seu negócio", icon: FileText, emoji: "📋" },
  { label: "Registrar Marca", desc: "Proteja sua identidade", icon: Shield, emoji: "🛡️" },
  { label: "Presença Online", desc: "Domine o digital", icon: Globe, emoji: "🌐" },
  { label: "Marketplaces", desc: "Venda em grandes canais", icon: ShoppingCart, emoji: "🛒" },
  { label: "Precificação", desc: "Preço certo, lucro real", icon: DollarSign, emoji: "💰" },
  { label: "ERP / Gestão", desc: "Controle sua operação", icon: BarChart3, emoji: "📊" },
  { label: "Gestão do Negócio", desc: "Visão completa do seu negócio", icon: Building2, emoji: "🏢" },
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
          <div className="h-18 w-18 rounded-2xl bg-gradient-primary-soft border border-primary/20 flex items-center justify-center mx-auto animate-float shadow-glow-sm">
            <Sparkles className="h-9 w-9 text-white" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Soph, sua <span className="text-gradient-primary">Sócia Digital</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Sua assistente estratégica para orientar decisões, destravar dúvidas e ajudar você em cada etapa do negócio.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-emerald-400 font-medium">Pronta para te orientar</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat area */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 flex flex-col gap-4">
          {/* Chat container */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 flex flex-col h-[480px]">
            <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary-soft flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Conversa com a Soph</p>
                <p className="text-[11px] text-muted-foreground">Assistente estratégica do ecossistema</p>
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
                        ? "bg-gradient-primary-btn text-primary-foreground rounded-br-md"
                        : "bg-muted/40 text-foreground border border-border/50 rounded-bl-md"
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
            <div className="px-5 pb-3 flex flex-wrap gap-1.5">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 rounded-full bg-muted/40 border border-border/50 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted/60 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/60">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Escreva sua dúvida e a Soph te orienta com clareza prática..."
                  className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 transition-all"
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="px-5 rounded-xl bg-gradient-primary-btn text-primary-foreground hover:brightness-110 transition-all shadow-glow-sm"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          {/* Insight da Soph */}
          <div className="bg-[hsl(210,63%,16%)] rounded-xl border border-primary/15 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-primary-soft flex items-center justify-center">
                <Lightbulb className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground">Insight da Soph</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Percebi que você já avançou em fornecedores e estruturação. O próximo passo ideal é fortalecer sua presença digital para começar a vender com mais consistência.
            </p>
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-primary-btn text-primary-foreground text-xs font-medium hover:brightness-110 transition-all">
              <Zap className="h-3.5 w-3.5" />
              Seguir recomendação
            </button>
          </div>

          {/* Shortcuts */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/60 p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Atalhos rápidos</h3>
            <div className="space-y-1">
              {shortcuts.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => sendMessage(`Me ajude com ${s.label.toLowerCase()}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left hover:bg-muted/40 transition-all duration-200 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted/40 border border-border/40 flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{s.desc}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 ml-auto flex-shrink-0 group-hover:text-primary/60 transition-colors" />
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
