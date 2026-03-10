"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Intent } from "../api/chat/route";

// ── Types ──────────────────────────────────────────────────────────────────────

type Mode = "explanation" | "hint";
type Message = {
  role: "user" | "assistant";
  content: string;
  intent?: Intent;
  // student_chat specific
  mode?: Mode;
  displayContent?: string;
};

// ── Intent config ──────────────────────────────────────────────────────────────

const INTENT_CONFIG: Record<Intent, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  lesson_plan:  { label: "Lesson Plan",   emoji: "📋", color: "#BC5F04", bg: "#FDF0E3", border: "#E8B87A" },
  essay_grade:  { label: "Essay Grader",  emoji: "✏️",  color: "#BC5F04", bg: "#FDF0E3", border: "#E8B87A" },
  student_chat: { label: "Study Tutor",   emoji: "💬", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  general:      { label: "AI Assistant",  emoji: "✨", color: "#BC5F04", bg: "#FDF0E3", border: "#E8B87A" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseMode(raw: string): { mode: Mode; displayContent: string } {
  const match = raw.match(/^\[MODE:\s*(explanation|hint)\]\s*/i);
  if (match) return { mode: match[1].toLowerCase() as Mode, displayContent: raw.slice(match[0].length).trim() };
  return { mode: "explanation", displayContent: raw.trim() };
}

// ── Markdown renderer ──────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-stone-800">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-stone-100 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return <span key={i}>{part}</span>;
  });
}

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={`list-${key}`} className="space-y-1 my-1">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#94a3b8" }} />
            <span className="text-sm text-stone-700 leading-relaxed">{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, i) => {
    const isBullet = /^[-•*]\s/.test(line);
    if (!isBullet && listBuffer.length > 0) flushList(String(i));

    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={i} className="font-bold text-stone-800 text-sm mt-4 mb-1.5 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      nodes.push(
        <h4 key={i} className="font-semibold text-stone-700 text-sm mt-3 mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {renderInline(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith("#### ")) {
      nodes.push(
        <p key={i} className="text-xs font-bold text-stone-500 uppercase tracking-wide mt-2 mb-0.5">
          {renderInline(line.slice(5))}
        </p>
      );
    } else if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} className="my-3 border-stone-200" />);
    } else if (isBullet) {
      listBuffer.push(line.slice(2));
    } else if (!line.trim()) {
      nodes.push(<div key={i} className="h-1.5" />);
    } else {
      nodes.push(
        <p key={i} className="text-sm text-stone-700 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  });
  if (listBuffer.length > 0) flushList("end");

  return <div className="space-y-0.5">{nodes}</div>;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-1 py-1">
      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm" style={{ backgroundColor: "#FDF0E3" }}>
        ✨
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
        style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-2 h-2 rounded-full block bg-stone-300"
            style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes typingDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  );
}

function IntentBadge({ intent }: { intent: Intent }) {
  const cfg = INTENT_CONFIG[intent];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span>{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}

function ModeBadge({ mode }: { mode: Mode }) {
  return mode === "hint" ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide mb-1"
      style={{ backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74" }}>
      💡 Hint
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide mb-1"
      style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
      📘 Explanation
    </span>
  );
}

const EXAMPLE_ESSAY_TEXT =
  "The invention of the printing press in the 15th century was one of the most transformative events in human history. Before Gutenberg's press, books were hand-copied by scribes, making them rare and expensive. The press allowed identical copies to be produced quickly and cheaply, spreading literacy and new ideas across Europe. This democratization of knowledge directly contributed to the Renaissance, the Reformation, and eventually the Scientific Revolution. Without it, these intellectual movements would have spread far more slowly, if at all.";

// ── Welcome screen (shown before any message) ─────────────────────────────────

function WelcomeScreen({ onSend }: { onSend: (text: string) => void }) {
  const chips = [
    {
      label: "📋 Make a lesson plan",
      text: "Make a lesson plan for photosynthesis, grade 9",
    },
    {
      label: "✏️ Grade this essay",
      text: `Grade this essay for high school:\n\n"${EXAMPLE_ESSAY_TEXT}"`,
    },
    {
      label: "💬 Explain a concept",
      text: "Explain black holes like I'm in middle school",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-3xl"
        style={{ backgroundColor: "#FDF0E3" }}>
        ✨
      </div>
      <h2 className="text-xl font-extrabold text-stone-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
        AI Toolkit
      </h2>
      <p className="text-sm text-stone-500 leading-relaxed mb-8">
        Ask anything — lesson plans, essay grading, or help understanding any topic.
      </p>

      <div className="flex flex-col gap-2 w-full">
        {chips.map((c) => (
          <button key={c.label} onClick={() => onSend(c.text)}
            className="text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
            style={{ borderColor: "#e7e5e4", color: "#78716c", backgroundColor: "#fafaf9" }}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIntent, setActiveIntent] = useState<Intent>("general");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const lastIntent: Intent | null = messages.filter(m => m.role === "assistant" && m.intent)
    .slice(-1)[0]?.intent ?? null;

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput("");
    setError("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi, newMessage: msg, lastIntent }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`);

      const intent: Intent = data.intent ?? "general";
      setActiveIntent(intent);

      let newMsg: Message = { role: "assistant", content: data.reply, intent };

      // For student_chat, parse the [MODE: ...] tag
      if (intent === "student_chat") {
        const { mode, displayContent } = parseMode(data.reply);
        newMsg = { ...newMsg, mode, displayContent };
      }

      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, messages, lastIntent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const cfg = INTENT_CONFIG[activeIntent];

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#FAFAF7" }}>

      {/* ── Header ── */}
      <header className="shrink-0 border-b z-10"
        style={{ backgroundColor: "rgba(255,251,247,0.97)", borderColor: cfg.border }}>
        <div className="px-4 h-14 flex items-center justify-between gap-3 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
            <span className="text-stone-300 hidden sm:inline">/</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-stone-900 text-sm shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                AI Toolkit
              </span>
              {messages.length > 0 && (
                <div className="hidden sm:block">
                  <IntentBadge intent={activeIntent} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {messages.length > 0 && (
              <button onClick={() => { setMessages([]); setActiveIntent("general"); setError(""); }}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:border-stone-300 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span className="hidden sm:inline">New chat</span>
              </button>
            )}
            <Link href="/lesson-prep" className="hidden md:flex text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 transition-all items-center gap-1">
              📋 <span>Tools</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4">

          {messages.length === 0 && !loading && (
            <WelcomeScreen onSend={sendMessage} />
          )}

          {messages.length > 0 && (
            <div className="py-4 space-y-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm mb-0.5"
                      style={{ backgroundColor: msg.intent ? INTENT_CONFIG[msg.intent].bg : "#FDF0E3" }}>
                      {msg.intent ? INTENT_CONFIG[msg.intent].emoji : "✨"}
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    {/* Mode badge for student_chat */}
                    {msg.role === "assistant" && msg.intent === "student_chat" && msg.mode && (
                      <ModeBadge mode={msg.mode} />
                    )}

                    <div className="px-4 py-3"
                      style={msg.role === "user"
                        ? { backgroundColor: cfg.color, color: "#fff", borderRadius: "24px 24px 8px 24px" }
                        : { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px 24px 24px 8px", color: "#010001" }}>
                      {msg.role === "user"
                        ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        : <MarkdownContent text={msg.displayContent ?? msg.content} />}
                    </div>

                    {/* Intent badge on assistant messages (mobile fallback) */}
                    {msg.role === "assistant" && msg.intent && (
                      <div className="mt-1 sm:hidden">
                        <IntentBadge intent={msg.intent} />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && <TypingIndicator />}

              {error && (
                <div className="py-2 px-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}

          {loading && messages.length === 0 && (
            <div className="py-8">
              <TypingIndicator />
            </div>
          )}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 border-t px-4 py-3" style={{ backgroundColor: "#fff", borderColor: "#e2e8f0" }}>
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-end gap-2">
            <textarea ref={inputRef} rows={1}
              className="flex-1 resize-none rounded-2xl border px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all leading-snug"
              style={{ borderColor: "#e2e8f0", maxHeight: "180px", "--tw-ring-color": cfg.color } as React.CSSProperties}
              placeholder="Lesson plan, essay grading, topic question…"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
              style={{ backgroundColor: input.trim() && !loading ? cfg.color : "#cbd5e1" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-stone-300 mt-2">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
