"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

type VocabItem = { term: string; definition: string };
type OutlinePhase = { phase: string; duration: string; activity: string };
type LessonPlan = {
  objectives: string[];
  vocabulary: VocabItem[];
  outline: OutlinePhase[];
  discussionQuestions: string[];
  assessment: string;
  differentiation: { struggling: string; advanced: string };
};

// ── Loading Animation — animated book ─────────────────────────────────────────

function BookLoadingAnimation() {
  return (
    <div className="flex flex-col items-center gap-5 py-16">
      {/* Book SVG with CSS animation */}
      <div className="relative w-20 h-16">
        {/* Book spine */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-1.5 rounded-sm -translate-x-1/2 z-10"
          style={{ backgroundColor: "#BC5F04" }}
        />
        {/* Left cover */}
        <div
          className="absolute left-0 top-0 bottom-0 right-1/2 rounded-l-md"
          style={{
            backgroundColor: "#F7D9B4",
            borderRight: "1.5px solid #f97316",
            animation: "bookLeft 1.6s ease-in-out infinite",
            transformOrigin: "right center",
          }}
        />
        {/* Right cover */}
        <div
          className="absolute right-0 top-0 bottom-0 left-1/2 rounded-r-md overflow-hidden"
          style={{
            backgroundColor: "#FDF0E3",
            borderLeft: "1.5px solid #f97316",
            animation: "bookRight 1.6s ease-in-out infinite",
            transformOrigin: "left center",
          }}
        >
          {/* Lines on the right page */}
          <div className="absolute inset-x-2 top-2 space-y-1.5">
            {[70, 90, 60, 80].map((w, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full bg-orange-200"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
        {/* Page flip */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-1/2 rounded-r-sm"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #fed7aa",
            transformOrigin: "left center",
            animation: "pageFlip 1.6s ease-in-out infinite",
          }}
        />
      </div>

      <div className="text-center space-y-1.5">
        <p
          className="font-semibold text-stone-700"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Building your lesson plan…
        </p>
        <p className="text-sm text-stone-400">
          Claude is crafting objectives, activities, and more
        </p>
      </div>

      {/* Animated progress dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-orange-400"
            style={{
              animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bookLeft {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-12deg); }
        }
        @keyframes bookRight {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(12deg); }
        }
        @keyframes pageFlip {
          0% { transform: rotateY(0deg); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: rotateY(-175deg); opacity: 1; }
          70% { opacity: 0; }
          100% { transform: rotateY(-175deg); opacity: 0; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Result Section Card ────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  accentColor,
  children,
  copyText,
}: {
  title: string;
  icon: string;
  accentColor: string;
  children: React.ReactNode;
  copyText?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyText) return;
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div
        className="px-6 py-4 border-b border-stone-100 flex items-center gap-2.5 group"
        style={{ backgroundColor: `${accentColor}08` }}
      >
        <span className="text-xl leading-none">{icon}</span>
        <h3
          className="font-bold text-stone-800 text-base flex-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        {copyText && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-black/5"
            title={`Copy ${title}`}
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Copy Button ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
      style={{
        backgroundColor: copied ? "#10b981" : "#BC5F04",
        color: "#fff",
        boxShadow: copied ? "0 4px 12px rgba(16,185,129,0.3)" : "0 4px 12px rgba(188,95,4,0.3)",
      }}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
          Copy plan
        </>
      )}
    </button>
  );
}

// ── Lesson Plan to plain text ──────────────────────────────────────────────────

function planToText(
  plan: LessonPlan,
  topic: string,
  gradeLevel: string,
  duration: string
): string {
  const lines: string[] = [
    `LESSON PLAN: ${topic.toUpperCase()}`,
    `Grade Level: ${gradeLevel} | Duration: ${duration || "45"} min`,
    "",
    "── LEARNING OBJECTIVES ──",
    ...plan.objectives.map((o, i) => `${i + 1}. ${o}`),
    "",
    "── KEY VOCABULARY ──",
    ...plan.vocabulary.map((v) => `• ${v.term}: ${v.definition}`),
    "",
    "── LESSON OUTLINE ──",
    ...plan.outline.map((p) => `[${p.duration}] ${p.phase}: ${p.activity}`),
    "",
    "── DISCUSSION QUESTIONS ──",
    ...plan.discussionQuestions.map((q, i) => `${i + 1}. ${q}`),
    "",
    "── ASSESSMENT ──",
    plan.assessment,
    "",
    "── DIFFERENTIATION ──",
    `Struggling learners: ${plan.differentiation.struggling}`,
    `Advanced learners: ${plan.differentiation.advanced}`,
  ];
  return lines.join("\n");
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function LessonPrepPage() {
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState("");
  const [showExampleBanner, setShowExampleBanner] = useState(true);

  const generatePlan = async (t: string, g: string, d: string, n: string) => {
    setLoading(true);
    setPlan(null);
    setError("");
    try {
      const res = await fetch("/api/lesson-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, gradeLevel: g, duration: d, notes: n }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`);
      setPlan(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !gradeLevel) return;
    await generatePlan(topic, gradeLevel, duration, notes);
  };

  const tryExample = () => {
    const t = "Photosynthesis";
    const g = "High School (Grades 9–12)";
    const d = "30";
    const n = "Focus on visual learners";
    setTopic(t);
    setGradeLevel(g);
    setDuration(d);
    setNotes(n);
    generatePlan(t, g, d, n);
  };

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all";
  const selectClass =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all appearance-none cursor-pointer";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-1.5";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      {/* ── Header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-sm border-b"
        style={{
          backgroundColor: "rgba(250,250,247,0.92)",
          borderColor: "#E8B87A",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
              All tools
            </Link>
            <span className="text-stone-300">/</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none">📋</span>
                <span
                  className="font-bold text-stone-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Lesson Prep Assistant
                </span>
              </div>
              <span className="text-[10px] text-stone-400 pl-7 -mt-0.5 font-medium tracking-wide">
                AI Toolkit
              </span>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: "#FDF0E3",
              borderColor: "#E8B87A",
              color: "#BC5F04",
            }}
          >
            For Teachers
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* ── Try Example Banner ──────────────────────── */}
        {showExampleBanner && (
          <div
            className="mb-6 rounded-2xl border flex items-center gap-4 px-6 py-4"
            style={{ backgroundColor: "#FDF0E3", borderColor: "#E8B87A" }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: "#7A3D02", fontFamily: "var(--font-display)" }}>
                ✨ Not sure where to start?
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9A6030" }}>
                Try a pre-filled example — Photosynthesis for High School with visual learning notes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { tryExample(); setShowExampleBanner(false); }}
              disabled={loading}
              className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: "#BC5F04", boxShadow: "0 4px 12px rgba(188,95,4,0.3)" }}
            >
              Try Example
            </button>
            <button
              type="button"
              onClick={() => setShowExampleBanner(false)}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-black/10"
              style={{ color: "#BC5F04" }}
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* ── Form ────────────────────────────────────── */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div
                className="px-6 py-5 border-b border-stone-100 flex items-start justify-between gap-3"
                style={{
                  background:
                    "linear-gradient(135deg, #FDF0E3 0%, #FAFAF7 100%)",
                }}
              >
                <div>
                  <h2
                    className="text-lg font-bold text-stone-900"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Build a Lesson Plan
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    Fill in the details below and Claude will do the rest.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                {/* Topic */}
                <div>
                  <label className={labelClass}>
                    Topic{" "}
                    <span className="text-orange-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder='e.g. "Photosynthesis", "World War II causes"'
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                {/* Grade Level */}
                <div>
                  <label className={labelClass}>
                    Grade Level{" "}
                    <span className="text-orange-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      required
                    >
                      <option value="">Select grade level…</option>
                      <option value="Elementary (Grades 3–5)">
                        Elementary (Grades 3–5)
                      </option>
                      <option value="Middle School (Grades 6–8)">
                        Middle School (Grades 6–8)
                      </option>
                      <option value="High School (Grades 9–12)">
                        High School (Grades 9–12)
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg
                        className="w-4 h-4 text-stone-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className={labelClass}>
                    Duration{" "}
                    <span className="text-stone-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <option value="">Default (45 min)</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg
                        className="w-4 h-4 text-stone-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelClass}>
                    Additional Notes{" "}
                    <span className="text-stone-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={3}
                    placeholder='e.g. "include hands-on activity", "focus on visual learners"'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !topic.trim() || !gradeLevel}
                  className="w-full py-3.5 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor:
                      loading || !topic.trim() || !gradeLevel
                        ? "#E8B87A"
                        : "#BC5F04",
                    boxShadow: "0 4px 14px 0 rgba(188,95,4,0.25)",
                  }}
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>
                      Generate Lesson Plan
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Output ──────────────────────────────────── */}
          <div>
            {/* Empty state */}
            {!loading && !plan && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 text-4xl"
                  style={{ backgroundColor: "#FDF0E3" }}
                >
                  📋
                </div>
                <h3
                  className="text-xl font-bold text-stone-700 mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Ready when you are
                </h3>
                <p className="text-sm text-stone-400 max-w-xs">
                  Fill in the form and click Generate — your complete lesson
                  plan will appear here.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  {[
                    { label: "Photosynthesis · Middle School", topic: "Photosynthesis", grade: "Middle School (Grades 6–8)" },
                    { label: "World War II causes · High School", topic: "World War II causes", grade: "High School (Grades 9–12)" },
                    { label: "Fractions · Elementary", topic: "Fractions", grade: "Elementary (Grades 3–5)" },
                  ].map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => { setTopic(ex.topic); setGradeLevel(ex.grade); }}
                      className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
                      style={{ borderColor: "#e7e5e4", color: "#78716c", backgroundColor: "#fafaf9" }}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && <BookLoadingAnimation />}

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Results */}
            {plan && !loading && (
              <div className="space-y-5">
                {/* Result header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2
                      className="text-2xl font-extrabold text-stone-900"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {topic}
                    </h2>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {gradeLevel} · {duration || "45"} min
                    </p>
                  </div>
                  <CopyButton
                    text={planToText(plan, topic, gradeLevel, duration)}
                  />
                </div>

                {/* Learning Objectives */}
                <SectionCard
                  title="Learning Objectives"
                  icon="🎯"
                  accentColor="#BC5F04"
                  copyText={plan.objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}
                >
                  <ol className="space-y-2.5">
                    {plan.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-stone-700">
                        <span
                          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                          style={{ backgroundColor: "#BC5F04" }}
                        >
                          {i + 1}
                        </span>
                        {obj}
                      </li>
                    ))}
                  </ol>
                </SectionCard>

                {/* Key Vocabulary */}
                <SectionCard
                  title="Key Vocabulary"
                  icon="📖"
                  accentColor="#8b5cf6"
                  copyText={plan.vocabulary.map((v) => `${v.term}: ${v.definition}`).join("\n")}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plan.vocabulary.map((v, i) => (
                      <div
                        key={i}
                        className="flex flex-col rounded-xl px-4 py-3 border border-stone-100"
                        style={{ backgroundColor: "#faf5ff" }}
                      >
                        <span className="font-semibold text-sm text-violet-700">
                          {v.term}
                        </span>
                        <p className="flex-1 text-xs text-stone-500 mt-1 leading-relaxed">
                          {v.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Lesson Outline */}
                <SectionCard
                  title="Lesson Outline"
                  icon="🗂️"
                  accentColor="#3b82f6"
                  copyText={plan.outline.map((p) => `[${p.duration}] ${p.phase}: ${p.activity}`).join("\n")}
                >
                  <div className="space-y-0">
                    {plan.outline.map((phase, i) => (
                      <div key={i} className="flex gap-4">
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: "#3b82f6" }}
                          >
                            {i + 1}
                          </div>
                          {i < plan.outline.length - 1 && (
                            <div className="w-px flex-1 my-1 bg-blue-100" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-5 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-semibold text-sm text-stone-800"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              {phase.phase}
                            </span>
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={
                                i === 0
                                  ? { backgroundColor: "#FDF0E3", color: "#BC5F04", border: "1px solid #E8B87A" }
                                  : i === 1
                                  ? { backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd" }
                                  : { backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" }
                              }
                            >
                              ⏱ {phase.duration}
                            </span>
                          </div>
                          <p className="text-sm text-stone-600 leading-relaxed">
                            {phase.activity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Discussion Questions */}
                <SectionCard
                  title="Discussion Questions"
                  icon="💬"
                  accentColor="#f59e0b"
                  copyText={plan.discussionQuestions.map((q, i) => `Q${i + 1}. ${q}`).join("\n")}
                >
                  <ul className="space-y-3">
                    {plan.discussionQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-stone-700"
                      >
                        <span
                          className="shrink-0 text-amber-500 font-bold text-base leading-snug"
                        >
                          Q{i + 1}.
                        </span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </SectionCard>

                {/* Assessment */}
                <SectionCard
                  title="Assessment Suggestion"
                  icon="📊"
                  accentColor="#10b981"
                  copyText={plan.assessment}
                >
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {plan.assessment}
                  </p>
                </SectionCard>

                {/* Differentiation */}
                <SectionCard
                  title="Differentiation Tips"
                  icon="🌱"
                  accentColor="#ec4899"
                  copyText={`Struggling Learners:\n${plan.differentiation.struggling}\n\nAdvanced Learners:\n${plan.differentiation.advanced}`}
                >
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden border border-rose-200">
                      <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: "#ffe4e6" }}>
                        <span className="text-base">🤝</span>
                        <span
                          className="text-sm font-bold text-rose-800"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          Struggling Learners
                        </span>
                      </div>
                      <div className="px-4 py-3" style={{ backgroundColor: "#fff1f2" }}>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          {plan.differentiation.struggling}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-emerald-200">
                      <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: "#bbf7d0" }}>
                        <span className="text-base">🚀</span>
                        <span
                          className="text-sm font-bold text-emerald-900"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          Advanced Learners
                        </span>
                      </div>
                      <div className="px-4 py-3" style={{ backgroundColor: "#f0fdf4" }}>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          {plan.differentiation.advanced}
                        </p>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
