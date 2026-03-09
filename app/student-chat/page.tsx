"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

type Mode = "explanation" | "hint";
type Message = {
  role: "user" | "assistant";
  content: string;
  mode?: Mode;
  displayContent?: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

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

const gradeLevels = [
  { value: "Elementary (Grades 3–5)",   label: "Elementary",   sub: "Grades 3–5",  emoji: "🌱", color: "#f97316", bg: "#fff7ed", border: "#fdba74" },
  { value: "Middle School (Grades 6–8)", label: "Middle School", sub: "Grades 6–8",  emoji: "📚", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  { value: "High School (Grades 9–12)",  label: "High School",  sub: "Grades 9–12", emoji: "🎓", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
];

function getGradeConfig(gradeLevel: string) {
  return gradeLevels.find((g) => g.value === gradeLevel) ?? {
    value: gradeLevel, label: gradeLevel, sub: "", emoji: "💬",
    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe",
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-1 py-1">
      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>AI</div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
        style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-2 h-2 rounded-full block"
            style={{ backgroundColor: "#38bdf8", animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  );
}

function ModeBadge({ mode }: { mode: Mode }) {
  return mode === "hint" ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide mb-1"
      style={{ backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74" }}>
      <span>💡</span> Hint
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide mb-1"
      style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
      <span>📘</span> Explanation
    </span>
  );
}

function MessageText({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed space-y-1.5">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, j) => {
          if (p.startsWith("**") && p.endsWith("**")) return <strong key={j}>{p.slice(2, -2)}</strong>;
          if (p.startsWith("*") && p.endsWith("*")) return <em key={j}>{p.slice(1, -1)}</em>;
          return <span key={j}>{p}</span>;
        });
        if (line.match(/^[-•]\s/)) return (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#60a5fa" }} />
            <span>{parts}</span>
          </div>
        );
        return <p key={i}>{parts}</p>;
      })}
    </div>
  );
}

// ── Main Page (single view) ────────────────────────────────────────────────────

export default function StudentChatPage() {
  // Setup state
  const [selectedGrade, setSelectedGrade] = useState("");
  const [customGrade, setCustomGrade]     = useState("");
  const [topic, setTopic]                 = useState("");
  const activeGrade = customGrade.trim() || selectedGrade;

  // Session state
  const [started, setStarted]   = useState(false);
  const [gradeLevel, setGradeLevel] = useState("");
  const [activeTopic, setActiveTopic] = useState("");

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const gradeConfig = getGradeConfig(gradeLevel);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startSession = useCallback((grade: string, t: string) => {
    setGradeLevel(grade);
    setActiveTopic(t);
    setStarted(true);
    const topicPart = t ? ` Let's explore **${t}** together.` : " Ask me anything you're curious about!";
    setMessages([{
      role: "assistant",
      content: "[MODE: explanation] Welcome!",
      mode: "explanation",
      displayContent: `Welcome to your study session!${topicPart} Ask me questions, or say **"quiz me"** anytime to practice with hints. Ready? 🚀`,
    }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const resetSession = useCallback(() => {
    setStarted(false);
    setGradeLevel("");
    setActiveTopic("");
    setMessages([]);
    setInput("");
    setError("");
    setSelectedGrade("");
    setCustomGrade("");
    setTopic("");
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const historyForApi = messages
      .filter((m) => !(m.role === "assistant" && m.content === "[MODE: explanation] Welcome!"))
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/student-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi, newMessage: text, gradeLevel, topic: activeTopic }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`);
      const { mode, content } = parseMode(data.reply);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, mode, displayContent: content }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, messages, gradeLevel, activeTopic]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#fffbf7" }}>

      {/* ── Header ── */}
      <header className="shrink-0 border-b z-10"
        style={{ backgroundColor: "rgba(255,251,247,0.97)", borderColor: started ? gradeConfig.border : "#fed7aa" }}>
        <div className="px-4 h-14 flex items-center justify-between gap-3 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span className="hidden sm:inline">All tools</span>
            </Link>

            {!started ? (
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">💬</span>
                <span className="font-bold text-stone-900 text-sm" style={{ fontFamily: "var(--font-display)" }}>
                  Student Chatbot
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm"
                  style={{ backgroundColor: gradeConfig.bg, color: gradeConfig.color }}>
                  {gradeConfig.emoji}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-stone-900 text-sm leading-tight truncate" style={{ fontFamily: "var(--font-display)" }}>
                    {activeTopic || "Study Session"}
                  </div>
                  <div className="text-xs truncate" style={{ color: gradeConfig.color }}>{gradeLevel}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!started ? (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border"
                style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}>
                For Students
              </span>
            ) : (
              <button onClick={resetSession}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:border-stone-300 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span className="hidden sm:inline">New chat</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Scrollable area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4">

          {/* ── SETUP (shown when not started) ── */}
          {!started && (
            <div className="py-6">
              {/* Hero card */}
              <div className="rounded-2xl overflow-hidden border border-blue-100 shadow-sm mb-5"
                style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #fffbf7 100%)" }}>
                <div className="px-6 pt-6 pb-5">
                  {/* Teacher session badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 0 0-.788 0l-7 3a1 1 0 0 0 0 1.84L5.25 8.051a.999.999 0 0 1 .356-.257l4-1.714a1 1 0 1 1 .788 1.838L7.667 9.088l1.94.831a1 1 0 0 0 .787 0l7-3a1 1 0 0 0 0-1.838l-7-3zM3.31 9.397 5 10.12v4.102a8.969 8.969 0 0 0-1.05-.174 1 1 0 0 1-.89-.89 11.115 11.115 0 0 1 .25-3.762zM9.3 16.573A9.026 9.026 0 0 0 10 17a9.026 9.026 0 0 0 .7-.427l1.092-1.092a1 1 0 0 0-1.414-1.414L10 14.45l-.378-.383a1 1 0 0 0-1.414 1.414L9.3 16.573z"/>
                      </svg>
                      Teacher Session
                    </span>
                  </div>

                  <h1 className="text-2xl font-extrabold text-stone-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    Your Study Session
                  </h1>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Your teacher prepared this session to help you practice. Pick your level and start learning.
                  </p>
                </div>
              </div>

              {/* Grade selection */}
              <div className="mb-4">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
                  What grade are you in?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {gradeLevels.map((g) => (
                    <button key={g.value} type="button"
                      onClick={() => { setSelectedGrade(g.value); setCustomGrade(""); }}
                      className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all duration-150 text-center"
                      style={{
                        borderColor: selectedGrade === g.value && !customGrade ? g.color : "#e7e5e4",
                        backgroundColor: selectedGrade === g.value && !customGrade ? g.bg : "#fff",
                        boxShadow: selectedGrade === g.value && !customGrade ? `0 0 0 3px ${g.color}22` : "none",
                      }}>
                      <span className="text-xl">{g.emoji}</span>
                      <span className="font-bold text-xs leading-tight"
                        style={{ fontFamily: "var(--font-display)", color: selectedGrade === g.value && !customGrade ? g.color : "#1c1917" }}>
                        {g.label}
                      </span>
                      <span className="text-[10px] text-stone-400">{g.sub}</span>
                    </button>
                  ))}
                </div>

                {/* Custom grade */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-xs text-stone-400 shrink-0">or type yours</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>
                <input type="text"
                  className="mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                  style={{ borderColor: customGrade ? "#3b82f6" : "#e7e5e4", backgroundColor: customGrade ? "#eff6ff" : "#fff" }}
                  placeholder='e.g. "Grade 7", "11th grade", "University"'
                  value={customGrade}
                  onChange={(e) => { setCustomGrade(e.target.value); if (e.target.value) setSelectedGrade(""); }}
                />
              </div>

              {/* Topic */}
              <div className="mb-5">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                  Topic <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span>
                </p>
                <input type="text"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                  placeholder='e.g. "Algebra", "The French Revolution", "Ecosystems"'
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Start button */}
              <button type="button" disabled={!activeGrade}
                onClick={() => startSession(activeGrade, topic)}
                className="w-full py-3.5 px-6 rounded-xl text-base font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
                style={{
                  backgroundColor: activeGrade ? "#3b82f6" : "#93c5fd",
                  boxShadow: activeGrade ? "0 4px 18px 0 rgba(59,130,246,0.28)" : "none",
                }}>
                Start Learning
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>

              {/* Skip — proper outlined button */}
              <button type="button"
                onClick={() => startSession("General", "")}
                className="w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2"
                style={{ borderColor: "#e7e5e4", color: "#78716c", backgroundColor: "#fff" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a8a29e"; e.currentTarget.style.backgroundColor = "#fafaf9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e7e5e4"; e.currentTarget.style.backgroundColor = "#fff"; }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M13 6l6 6-6 6" />
                </svg>
                Continue without selecting
              </button>

              <p className="text-center text-xs text-stone-400 mt-4">
                Tip: type &ldquo;quiz me&rdquo; any time to practice!
              </p>
            </div>
          )}

          {/* ── MESSAGES (shown when started) ── */}
          {started && (
            <div className="py-4 space-y-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mb-0.5"
                      style={{ backgroundColor: gradeConfig.bg, color: gradeConfig.color }}>
                      AI
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[72%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    {msg.role === "assistant" && msg.mode && <ModeBadge mode={msg.mode} />}
                    <div className="px-4 py-3"
                      style={msg.role === "user"
                        ? { backgroundColor: gradeConfig.color, color: "#fff", borderRadius: "18px 18px 4px 18px" }
                        : { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "18px 18px 18px 4px", color: "#1c1917" }}>
                      {msg.role === "user"
                        ? <p className="text-sm leading-relaxed">{msg.content}</p>
                        : <MessageText text={msg.displayContent ?? msg.content} />}
                    </div>
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
        </div>
      </div>

      {/* ── Input bar (only when started) ── */}
      {started && (
        <div className="shrink-0 border-t px-4 py-3" style={{ backgroundColor: "#fff", borderColor: "#e2e8f0" }}>
          <div className="max-w-2xl mx-auto w-full">
            {messages.length <= 1 && (
              <div className="flex gap-2 mb-2.5 flex-wrap">
                {["Explain this topic", "Quiz me!", "Give me an example"].map((q) => (
                  <button key={q} onClick={() => setInput(q)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all"
                    style={{ borderColor: gradeConfig.border, backgroundColor: gradeConfig.bg, color: gradeConfig.color }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea ref={inputRef} rows={1}
                className="flex-1 resize-none rounded-2xl border px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all leading-snug"
                style={{ borderColor: "#e2e8f0", maxHeight: "120px", "--tw-ring-color": gradeConfig.color } as React.CSSProperties}
                placeholder="Ask a question…"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                style={{ backgroundColor: input.trim() && !loading ? gradeConfig.color : "#cbd5e1" }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-stone-300 mt-2">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}
    </div>
  );
}
