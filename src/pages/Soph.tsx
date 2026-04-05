import { motion } from "framer-motion";
import { Sparkles, Send, Package, FileText, Shield, Globe, ShoppingCart, DollarSign, BarChart3, Building2, ArrowRight, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import sophAvatar from "@/assets/soph-avatar.png";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/soph-chat`;

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

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function SophPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { hasActive: hasSubscription } = useSubscription();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const userName = profile?.first_name || user?.email?.split("@")[0] || "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = useCallback(async (allMessages: ChatMessage[]) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const userContext = {
      userName,
      currentModule: "Soph (Assistente)",
      hasSubscription,
    };

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        userContext,
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
      throw new Error(err.error || `Erro ${resp.status}`);
    }

    if (!resp.body) throw new Error("Sem resposta do servidor");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantSoFar = "";

    const upsert = (text: string) => {
      assistantSoFar += text;
      const snapshot = assistantSoFar;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
        }
        return [...prev, { role: "assistant", content: snapshot }];
      });
    };

    let streamDone = false;
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsert(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // flush remaining
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsert(content);
        } catch { /* ignore */ }
      }
    }
  }, [userName, hasSubscription]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(updated);
    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.error("[Soph] Error:", e);
      toast.error(e.message || "Erro ao enviar mensagem");
      // Remove failed assistant partial if any
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content.trim()) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const greeting = userName
    ? `Olá, ${userName}! Sou a Soph, sua sócia digital. Como posso te ajudar hoje?`
    : "Olá! Sou a Soph, sua sócia digital. Como posso te ajudar hoje?";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="h-28 w-28 rounded-full border-2 border-primary/40 flex items-center justify-center mx-auto shadow-glow overflow-hidden">
          <img src={sophAvatar} alt="Soph" width={112} height={112} className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-white mb-1">
            Soph, sua <span className="text-gradient-primary">Sócia Digital</span>
          </h1>
          <p className="text-sm text-white max-w-md mx-auto leading-relaxed">
            Sua assistente estratégica para cada etapa do seu negócio.
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
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="text-[10px] text-white">Online</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-5 [&_[data-radix-scroll-area-scrollbar]]:bg-white/10 [&_[data-radix-scroll-area-thumb]]:bg-white">
              <div className="space-y-4">
                {/* Welcome message (static, not in state) */}
                <div className="flex justify-start">
                  <div className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-[hsl(210,63%,14%)] text-white border border-primary/15 rounded-bl-md">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-[11px] font-semibold text-gradient-primary">Soph</span>
                    </div>
                    {greeting}
                  </div>
                </div>

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-primary-btn text-primary-foreground rounded-br-md shadow-[0_2px_12px_-2px_hsl(var(--primary)/0.4)]"
                        : "bg-[hsl(210,63%,14%)] text-white border border-primary/15 rounded-bl-md"
                    }`}>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span className="text-[11px] font-semibold text-gradient-primary">Soph</span>
                        </div>
                      )}
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="max-w-[82%] rounded-2xl px-4 py-3 text-sm bg-[hsl(210,63%,14%)] text-white border border-primary/15 rounded-bl-md">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-[11px] font-semibold text-gradient-primary">Soph</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick questions */}
            {messages.length === 0 && (
              <div className="px-5 pb-2 flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full bg-[hsl(210,63%,14%)] border border-primary/15 text-[10px] text-white font-medium hover:border-primary/30 hover:text-primary transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-primary/15">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Escreva sua dúvida..."
                  disabled={isLoading}
                  className="flex-1 bg-[hsl(210,63%,14%)] border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="px-5 rounded-xl bg-gradient-primary-btn text-[#0A192F] font-medium hover:brightness-110 transition-all shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left hover:bg-primary/10 transition-all duration-200 group disabled:opacity-50"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-white group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{s.label}</p>
                      <p className="text-[10px] text-white truncate">{s.desc}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-white ml-auto flex-shrink-0 group-hover:text-primary transition-colors" />
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
