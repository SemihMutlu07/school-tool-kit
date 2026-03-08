"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

type Mode = "explanation" | "hint";
type Message = {
  role: "user" | "assistant";
  content: string; // raw, with [MODE: ...] tag still present in assistant msgs
  mode?: Mode;
  displayContent?: string; // tag stripped
};

// ── Parse [MODE: ...] from assistant reply ─────────────────────────────────────

function parseMode(raw: string): { mode: Mode; content: string } {
  const match = raw.match(/^\[MODE:\s*(explanation|hint)\]\s*/i);
  if (match) {
    return {
      mode: match[1].toLowerCase() as Mode,
      content: raw.slice(match[0].length).trim(),
    };
  }
  return { mode: "explanation", content: raw.trim() };
}

// ── Chat-bubble loading animation ──────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}
      >
        AI
      </div>
      {/* Bubble with dots */}
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
        style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "#38bdf8",
              animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              display: "block",
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Mode badge ─────────────────────────────────────────────────────────────────

function ModeBadge({ mode }: { mode: Mode }) {
  if (mode === "hint") {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide mb-1"
        style={{ backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74" }}
      >
        <span>💡</span> Hint
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide mb-1"
      style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
    >
      <span>📘</span> Explanation
    </span>
  );
}

// ── Simple markdown-lite renderer ─────────────────────────────────────────────
// Handles **bold**, *italic*, and line breaks — no library needed.

function MessageText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="text-sm leading-relaxed space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Bold + italic inline
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        const rendered = parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**"))
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          if (part.startsWith("*") && part.endsWith("*"))
            return <em key={j}>{part.slice(1, -1)}</em>;
          return <span key={j}>{part}</span>;
        });

        // List items
        if (line.match(/^[-•]\s/)) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#60a5fa" }} />
              <span>{rendered}</span>
            </div>
          );
        }

        return <p key={i}>{rendered}</p>;
      })}
    </div>
  );
}

// ── Grade level config ─────────────────────────────────────────────────────────

const gradeLevels = [
  {
    value: "Elementary (Grades 3–5)",
    label: "Elementary",
    sub: "Grades 3–5",
    emoji: "🌱",
    color: "#f97316",
    bg: "#fff7ed",
    border: "#fdba74",
  },
  {
    value: "Middle School (Grades 6–8)",
    label: "Middle School",
    sub: "Grades 6–8",
    emoji: "📚",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    value: "High School (Grades 9–12)",
    label: "High School",
    sub: "Grades 9–12",
    emoji: "🎓",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
];

// ── Setup Screen ───────────────────────────────────────────────────────────────

function SetupScreen({
  onStart,
}: {
  onStart: (grade: string, topic: string) => void;
}) {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [customGrade, setCustomGrade] = useState("");
  const [topic, setTopic] = useState("");

  const activeGrade = customGrade.trim() || selectedGrade;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#fffbf7" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-sm border-b shrink-0"
        style={{
          backgroundColor: "rgba(255,251,247,0.92)",
          borderColor: "#fed7aa",
        }}
      >
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              All tools
            </Link>
            <span className="text-stone-300">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">💬</span>
              <span className="font-bold text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
                Student Chatbot
              </span>
            </div>
          </div>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full border"
            style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}
          >
            For Students
          </span>
        </div>
      </header>

      {/* Setup form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Hero */}
          <div className="text-center mb-10">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5"
              style={{ backgroundColor: "#eff6ff" }}
            >
              💬
            </div>
            <h1
              className="text-3xl font-extrabold text-stone-900 mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Hey! I&rsquo;m your AI tutor.
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed">
              Ask me anything — I&rsquo;ll explain it at your level. You can also ask me
              to quiz you anytime!
            </p>
          </div>

          {/* Grade selection */}
          <div className="mb-6">
            <p
              className="text-sm font-bold text-stone-700 mb-3 text-center"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What grade are you in?
            </p>
            <div className="space-y-2.5">
              {gradeLevels.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => { setSelectedGrade(g.value); setCustomGrade(""); }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left"
                  style={{
                    borderColor: selectedGrade === g.value && !customGrade ? g.color : "#e7e5e4",
                    backgroundColor: selectedGrade === g.value && !customGrade ? g.bg : "#fff",
                    boxShadow: selectedGrade === g.value && !customGrade ? `0 0 0 3px ${g.color}22` : "none",
                  }}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <div
                      className="font-bold text-stone-900"
                      style={{ fontFamily: "var(--font-display)", color: selectedGrade === g.value && !customGrade ? g.color : undefined }}
                    >
                      {g.label}
                    </div>
                    <div className="text-xs text-stone-400">{g.sub}</div>
                  </div>
                  {selectedGrade === g.value && !customGrade && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: g.color }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom grade input */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 shrink-0">or type yours</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>
            <input
              type="text"
              className="mt-3 w-full rounded-xl border px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
              style={{ borderColor: customGrade ? "#3b82f6" : "#e7e5e4", backgroundColor: customGrade ? "#eff6ff" : "#fff" }}
              placeholder='e.g. "Grade 7", "11th grade", "University"'
              value={customGrade}
              onChange={(e) => { setCustomGrade(e.target.value); if (e.target.value) setSelectedGrade(""); }}
            />
          </div>

          {/* Optional topic */}
          <div className="mb-7">
            <label className="block text-sm font-bold text-stone-700 mb-2 text-center" style={{ fontFamily: "var(--font-display)" }}>
              What do you want to study?{" "}
              <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
              placeholder='e.g. "Algebra", "The French Revolution", "Ecosystems"'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Start */}
          <button
            type="button"
            disabled={!activeGrade}
            onClick={() => onStart(activeGrade, topic)}
            className="w-full py-4 px-6 rounded-2xl text-base font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: activeGrade ? "#3b82f6" : "#93c5fd",
              boxShadow: activeGrade ? "0 4px 18px 0 rgba(59,130,246,0.3)" : "none",
            }}
          >
            Start Chatting
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onStart("General", "")}
            className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors mt-3"
          >
            Skip setup — just start chatting →
          </button>

          <p className="text-center text-xs text-stone-400 mt-3">
            Tip: type &ldquo;quiz me&rdquo; any time to practice!
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Chat Screen ────────────────────────────────────────────────────────────────

function ChatScreen({
  gradeLevel,
  topic,
  onReset,
}: {
  gradeLevel: string;
  topic: string;
  onReset: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const gradeConfig = gradeLevels.find((g) => g.value === gradeLevel)!;

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Welcome message on mount
  useEffect(() => {
    const topicPart = topic
      ? ` Let's explore **${topic}** together.`
      : " Ask me anything you're curious about!";

    setMessages([
      {
        role: "assistant",
        content: "[MODE: explanation] Welcome!",
        mode: "explanation",
        displayContent: `Hi! I'm your AI tutor.${topicPart} You can ask me questions, or say **"quiz me"** anytime and I'll test you with hints instead of answers. Ready? 🚀`,
      },
    ]);
  }, [topic]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Build history for the API — only include the raw content (no display extras)
    const historyForApi = messages
      .filter((m) => m.role === "user" || (m.role === "assistant" && m.content !== "[MODE: explanation] Welcome!"))
      .map((m) => ({
        role: m.role,
        // For assistant messages, send the original raw content (with tag)
        content: m.content,
      }));

    try {
      const res = await fetch("/api/student-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          newMessage: text,
          gradeLevel,
          topic,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const { mode, content } = parseMode(data.reply);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          mode,
          displayContent: content,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      // Re-focus input on desktop
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, messages, gradeLevel, topic]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="flex flex-col"
      style={{ height: "100dvh", backgroundColor: "#fffbf7" }}
    >
      {/* ── Chat Header ── */}
      <header
        className="shrink-0 border-b px-4 py-3 flex items-center justify-between gap-3"
        style={{
          backgroundColor: "rgba(255,251,247,0.97)",
          borderColor: "#bfdbfe",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="hidden sm:inline">All tools</span>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: gradeConfig.bg, color: gradeConfig.color }}
            >
              {gradeConfig.emoji}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-stone-900 text-sm leading-tight truncate" style={{ fontFamily: "var(--font-display)" }}>
                {topic || "Your AI Tutor"}
              </div>
              <div className="text-xs text-stone-400 truncate">{gradeLevel}</div>
            </div>
          </div>
        </div>

        <button
          onClick={onReset}
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:border-stone-300 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span className="hidden sm:inline">New chat</span>
        </button>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mb-0.5"
                style={{ backgroundColor: gradeConfig.bg, color: gradeConfig.color }}
              >
                AI
              </div>
            )}

            {/* Bubble */}
            <div className={`max-w-[80%] sm:max-w-[70%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              {msg.role === "assistant" && msg.mode && (
                <ModeBadge mode={msg.mode} />
              )}
              <div
                className="px-4 py-3 rounded-2xl"
                style={
                  msg.role === "user"
                    ? {
                        backgroundColor: gradeConfig.color,
                        color: "#fff",
                        borderRadius: "18px 18px 4px 18px",
                      }
                    : {
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "18px 18px 18px 4px",
                        color: "#1c1917",
                      }
                }
              >
                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <MessageText text={msg.displayContent ?? msg.content} />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        {/* Error */}
        {error && (
          <div className="mx-4 py-2 px-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        className="shrink-0 border-t px-4 py-3"
        style={{
          backgroundColor: "#fff",
          borderColor: "#e2e8f0",
        }}
      >
        {/* Quick prompts (only when no messages yet beyond welcome) */}
        {messages.length <= 1 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {["Explain this topic", "Quiz me!", "Give me an example"].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{
                  borderColor: gradeConfig.border,
                  backgroundColor: gradeConfig.bg,
                  color: gradeConfig.color,
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            className="flex-1 resize-none rounded-2xl border px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all leading-snug"
            style={{
              borderColor: "#e2e8f0",
              maxHeight: "120px",
              "--tw-ring-color": gradeConfig.color,
            } as React.CSSProperties}
            placeholder="Ask a question…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-grow
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
            style={{
              backgroundColor: input.trim() && !loading ? gradeConfig.color : "#cbd5e1",
            }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-stone-300 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ── Root page ──────────────────────────────────────────────────────────────────

export default function StudentChatPage() {
  const [session, setSession] = useState<{
    gradeLevel: string;
    topic: string;
  } | null>(null);

  if (!session) {
    return (
      <SetupScreen
        onStart={(gradeLevel, topic) => setSession({ gradeLevel, topic })}
      />
    );
  }

  return (
    <ChatScreen
      gradeLevel={session.gradeLevel}
      topic={session.topic}
      onReset={() => setSession(null)}
    />
  );
}
