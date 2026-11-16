import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Package,
  DollarSign,
  Loader2,
  UserRound,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { SophViewport } from "@/components/soph/SophViewport";
import "./soph-premium.css";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/soph-chat`;

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
  const location = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialMessageHandled = useRef(false);

  const userName = profile?.first_name || user?.email?.split("@")[0] || "";

  useEffect(() => {
    const end = messagesEndRef.current;
    const viewport = end?.closest<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    );
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    } else {
      end?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  const streamChat = useCallback(
    async (allMessages: ChatMessage[]) => {
      const controller = new AbortController();
      abortRef.current = controller;

      const userContext = {
        userName,
        currentModule: "Soph (Assistente)",
        hasSubscription,
      };

      // Refresh session to ensure we have a valid, non-expired token
      let token: string | undefined;
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (!sessionError && session?.access_token) {
        token = session.access_token;
      } else {
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();
        if (!refreshError && refreshData?.session?.access_token) {
          token = refreshData.session.access_token;
        }
      }
      if (!token) {
        throw new Error(
          "Sua sessão expirou. Faça login novamente para conversar com a Soph.",
        );
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp
          .json()
          .catch(() => ({ error: "Erro desconhecido" }));
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
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: snapshot } : m,
            );
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
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as
              string | undefined;
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
            const content = parsed.choices?.[0]?.delta?.content as
              string | undefined;
            if (content) upsert(content);
          } catch {
            /* ignore */
          }
        }
      }
    },
    [userName, hasSubscription],
  );

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

  // Auto-send initial message from floating widget navigation
  useEffect(() => {
    const initialMessage = (location.state as any)?.initialMessage;
    if (initialMessage && !initialMessageHandled.current) {
      initialMessageHandled.current = true;
      // Clear the state to prevent re-sending on re-render
      window.history.replaceState({}, "");
      // Small delay to ensure component is fully mounted
      setTimeout(() => sendMessage(initialMessage), 100);
    }
  }, [location.state]);

  const greeting = userName
    ? `Olá, ${userName}! Sou a Soph, sua sócia digital. Como posso te ajudar hoje?`
    : "Olá! Sou a Soph, sua sócia digital. Como posso te ajudar hoje?";

  return (
    <SophViewport>
      <div className="soph-panel">
        <header className="soph-header">
          <svg
            className="soph-header-wave"
            viewBox="0 0 1000 140"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="soph-header-glow" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#00485c" stopOpacity="0" />
                <stop offset="1" stopColor="#00dbe0" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path
              d="M380 140 C650 160 680 38 1000 4 L1000 140 Z"
              fill="url(#soph-header-glow)"
            />
            <path
              d="M380 140 C650 160 680 38 1000 4"
              fill="none"
              stroke="#22dce1"
              strokeOpacity="0.55"
            />
          </svg>
          <span className="soph-header-mark" aria-hidden="true">
            <Sparkles />
          </span>
          <div className="soph-header-copy">
            <h1 id="soph-title">
              Soph — Sua Sócia <span>Digital</span>
            </h1>
            <p className="soph-header-subtitle">
              Sua assistente estratégica para cada etapa do seu negócio.
            </p>
            <p className="soph-availability">
              <span aria-hidden="true" />
              {isLoading ? "Respondendo…" : "Online"}
            </p>
          </div>
        </header>

        <ScrollArea
          className="soph-messages"
          aria-label="Histórico da conversa"
        >
          <div className="soph-message-list" role="log" aria-live="polite">
            <article
              className="soph-message"
              data-role="assistant"
              aria-label="Mensagem da Soph"
            >
              <span className="soph-message-avatar" aria-hidden="true">
                <Sparkles />
              </span>
              <div className="soph-message-content">
                <p className="soph-message-author">Soph</p>
                <div className="soph-bubble">{greeting}</div>
              </div>
            </article>
            {messages.map((msg, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="soph-message"
                data-role={msg.role}
                aria-label={
                  msg.role === "assistant" ? "Mensagem da Soph" : "Sua mensagem"
                }
              >
                <span className="soph-message-avatar" aria-hidden="true">
                  {msg.role === "assistant" ? <Sparkles /> : <UserRound />}
                </span>
                <div className="soph-message-content">
                  <p className="soph-message-author">
                    {msg.role === "assistant" ? "Soph" : userName || "Você"}
                  </p>
                  <div className="soph-bubble">
                    {msg.role === "assistant" ? (
                      <div className="soph-markdown">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="soph-message" data-role="assistant" role="status">
                <span className="soph-message-avatar" aria-hidden="true">
                  <Sparkles />
                </span>
                <div className="soph-message-content">
                  <p className="soph-message-author">Soph</p>
                  <div className="soph-bubble soph-thinking">
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    <span>Pensando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="soph-composer">
          <div className="soph-suggestions" aria-label="Sugestões de perguntas">
            {quickQuestions.map((q, i) => {
              const Icon = [Sparkles, DollarSign, Package][i];
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  aria-label={q}
                >
                  <Icon aria-hidden="true" />
                  <span>
                    {
                      [
                        "Começar meu negócio",
                        "Calcular meu preço",
                        "Escolher fornecedores",
                      ][i]
                    }
                  </span>
                </button>
              );
            })}
          </div>
          <div className="soph-input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage(input)
              }
              placeholder="Escreva sua mensagem..."
              enterKeyHint="send"
              aria-label="Mensagem para a Soph"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="soph-send"
              aria-label="Enviar mensagem"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Send aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </SophViewport>
  );
}
