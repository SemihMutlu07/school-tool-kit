"use client";

import { useState, useRef } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

type Criterion = { name: string; score: number; feedback: string };
type GradeResult = {
  essayType: string;
  criteria: Criterion[];
  totalScore: number;
  shareableSummary: string;
};

// ── PDF / file text extraction via pdf.js ─────────────────────────────────────

async function extractFileText(file: File): Promise<{ text: string; error?: string }> {
  const FAIL = { text: "", error: "Could not extract text from this PDF, please paste your essay text instead." };

  // Plain text files
  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ text: (e.target?.result as string) ?? "" });
      reader.onerror = () => resolve(FAIL);
      reader.readAsText(file);
    });
  }

  // PDF — use pdf.js for reliable extraction (handles compressed streams)
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");
      pages.push(pageText);
    }

    const text = pages.join("\n").replace(/\s+/g, " ").trim();
    if (!text || text.length < 30) return FAIL;
    return { text };
  } catch {
    return FAIL;
  }
}

// ── Loading Animation — pencil writing ────────────────────────────────────────

function PencilLoadingAnimation() {
  return (
    <div className="flex flex-col items-center gap-5 py-16">
      <div className="relative w-56 h-12">
        {/* The 3 "lines" that fill in */}
        <div className="absolute inset-0 flex flex-col justify-between py-1">
          {[100, 75, 88].map((w, i) => (
            <div
              key={i}
              className="h-0.5 rounded-full bg-stone-200 overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-amber-400"
                style={{
                  animation: `lineGrow 1.8s ease-in-out ${i * 0.3}s infinite`,
                  width: `${w}%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Pencil that slides across */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ animation: "pencilSlide 1.8s ease-in-out infinite" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 drop-shadow-sm"
            fill="none"
          >
            {/* Pencil body */}
            <path
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 0 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Tip */}
            <path d="M3 21l1.5-4.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-1.5">
        <p
          className="font-semibold text-stone-700"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Grading essay…
        </p>
        <p className="text-sm text-stone-400">
          Claude is reviewing all 4 criteria
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-amber-400"
            style={{
              animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes lineGrow {
          0%   { transform: scaleX(0); transform-origin: left; }
          50%  { transform: scaleX(1); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; }
        }
        @keyframes pencilSlide {
          0%   { left: -8px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { left: calc(100% + 8px); opacity: 0; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Score helpers ──────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 4) return { bar: "#10b981", text: "#065f46", bg: "#ecfdf5" }; // green
  if (score >= 3) return { bar: "#f97316", text: "#7c2d12", bg: "#fff7ed" }; // orange
  return         { bar: "#ef4444", text: "#7f1d1d", bg: "#fef2f2" };         // red
}

function totalScoreLabel(total: number) {
  if (total >= 18) return { label: "Excellent", color: "#10b981" };
  if (total >= 14) return { label: "Proficient", color: "#34d399" };
  if (total >= 10) return { label: "Developing", color: "#f59e0b" };
  if (total >= 6)  return { label: "Approaching", color: "#f97316" };
  return { label: "Beginning", color: "#ef4444" };
}

function criterionIcon(name: string) {
  if (name.includes("Thesis")) return "🎯";
  if (name.includes("Evidence")) return "🔍";
  if (name.includes("Organization")) return "🗂️";
  if (name.includes("Language")) return "✍️";
  return "📌";
}

// ── Copy Button ────────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-all duration-200"
      style={{
        borderColor: copied ? "#10b981" : "#e7e5e4",
        color: copied ? "#10b981" : "#78716c",
        backgroundColor: copied ? "#f0fdf4" : "transparent",
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
          {label}
        </>
      )}
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function EssayGraderPage() {
  const [essayText, setEssayText] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState("");
  // PDF upload state — separate from textarea
  const [uploadedFile, setUploadedFile] = useState<{ name: string; text: string; wordCount: number } | null>(null);
  const [pdfError, setPdfError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // What we actually send to the API
  const textToGrade = uploadedFile?.text ?? essayText;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfError("");
    setUploadedFile(null);

    const { text, error: extractError } = await extractFileText(file);

    // Reset after extraction so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (extractError || !text) {
      setPdfError(extractError ?? "Could not extract text from this PDF, please paste your essay text instead.");
      return;
    }

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    setUploadedFile({ name: file.name, text, wordCount });
    setEssayText("");
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPdfError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const EXAMPLE_ESSAY =
    "The invention of the printing press in the 15th century was one of the most transformative events in human history. Before Gutenberg's press, books were hand-copied by scribes, making them rare and expensive. The press allowed identical copies to be produced quickly and cheaply, spreading literacy and new ideas across Europe. This democratization of knowledge directly contributed to the Renaissance, the Reformation, and eventually the Scientific Revolution. Without it, these intellectual movements would have spread far more slowly, if at all.";

  const gradeEssay = async (text: string, grade: string) => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/essay-grader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essayText: text, gradeLevel: grade }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`);
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textToGrade.trim() || !gradeLevel) return;
    await gradeEssay(textToGrade, gradeLevel);
  };

  const tryExample = () => {
    const g = "High School (Grades 9–12)";
    setEssayText(EXAMPLE_ESSAY);
    setUploadedFile(null);
    setPdfError("");
    setGradeLevel(g);
    gradeEssay(EXAMPLE_ESSAY, g);
  };

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-1.5";
  const selectClass =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all appearance-none cursor-pointer";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fffbf7" }}>
      {/* ── Header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-sm border-b"
        style={{
          backgroundColor: "rgba(255,251,247,0.92)",
          borderColor: "#fed7aa",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
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
              <span className="text-xl leading-none">✏️</span>
              <span className="font-bold text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
                Essay Grader
              </span>
            </div>
          </div>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full border"
            style={{ backgroundColor: "#fff7ed", borderColor: "#fdba74", color: "#c2410c" }}
          >
            For Teachers
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
          {/* ── Form ────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div
                className="px-6 py-5 border-b border-stone-100 flex items-start justify-between gap-3"
                style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fffbf7 100%)" }}
              >
                <div>
                  <h2 className="text-lg font-bold text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
                    Grade an Essay
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    Paste or upload a student essay below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={tryExample}
                  disabled={loading}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40"
                  style={{ borderColor: "#e7e5e4", color: "#78716c" }}
                >
                  ✨ Try Example
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                {/* Essay input — textarea OR uploaded file card */}
                <div>
                  <label className={labelClass}>
                    Essay Text <span className="text-amber-500 font-bold">*</span>
                  </label>

                  {uploadedFile ? (
                    /* ── Uploaded file success card ── */
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-800 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Text extracted successfully · {uploadedFile.wordCount} words
                        </p>
                      </div>
                      <button type="button" onClick={removeFile}
                        className="shrink-0 text-xs text-emerald-600 hover:text-red-500 font-medium transition-colors">
                        Remove
                      </button>
                    </div>
                  ) : (
                    /* ── Manual textarea ── */
                    <>
                      <textarea
                        className={`${inputClass} resize-none focus:ring-amber-300`}
                        rows={10}
                        placeholder="Paste the student's essay here…"
                        value={essayText}
                        onChange={(e) => setEssayText(e.target.value)}
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-stone-400">
                          {essayText.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                        {essayText && (
                          <button type="button" onClick={() => setEssayText("")}
                            className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                            Clear
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* PDF upload */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-stone-100" />
                    <span className="text-xs text-stone-400 font-medium">or upload file</span>
                    <div className="flex-1 h-px bg-stone-100" />
                  </div>

                  <div className="mt-3">
                    <input ref={fileInputRef} type="file" accept=".pdf,.txt,application/pdf,text/plain"
                      className="hidden" onChange={handleFileUpload} id="file-upload" />
                    <label htmlFor="file-upload"
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-300 text-sm text-stone-500 cursor-pointer hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                      Upload PDF or .txt file
                    </label>
                  </div>

                  {pdfError && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      {pdfError}
                    </div>
                  )}
                </div>

                {/* Grade Level */}
                <div>
                  <label className={labelClass}>
                    Grade Level <span className="text-amber-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      required
                    >
                      <option value="">Select grade level…</option>
                      <option value="Elementary (Grades 3–5)">Elementary (Grades 3–5)</option>
                      <option value="Middle School (Grades 6–8)">Middle School (Grades 6–8)</option>
                      <option value="High School (Grades 9–12)">High School (Grades 9–12)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !textToGrade.trim() || !gradeLevel}
                  className="w-full py-3.5 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: loading || !textToGrade.trim() || !gradeLevel ? "#fcd34d" : "#f59e0b",
                    boxShadow: "0 4px 14px 0 rgba(245,158,11,0.25)",
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Grading…
                    </>
                  ) : result ? (
                    <>
                      Grade Another Essay
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Grade Essay
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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
            {!loading && !result && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 text-4xl"
                  style={{ backgroundColor: "#fffbeb" }}
                >
                  ✏️
                </div>
                <h3 className="text-xl font-bold text-stone-700 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Ready to grade
                </h3>
                <p className="text-sm text-stone-400 max-w-xs">
                  Paste an essay, select the grade level, and get detailed rubric feedback instantly.
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && <PencilLoadingAnimation />}

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="space-y-5">
                {/* Score hero */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  <div
                    className="px-7 py-6"
                    style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fff 60%)" }}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Left: type badge + heading */}
                      <div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span
                            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                            style={{ backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74" }}
                          >
                            {result.essayType}
                          </span>
                          <span className="text-xs text-stone-400">{gradeLevel}</span>
                        </div>
                        <h2 className="text-xl font-extrabold text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
                          Grading Complete
                        </h2>
                        <p className="text-sm text-stone-500 mt-0.5">
                          {result.criteria.length} criteria evaluated
                        </p>
                      </div>

                      {/* Right: big score */}
                      <div className="text-center">
                        <div
                          className="text-5xl font-extrabold leading-none"
                          style={{ color: totalScoreLabel(result.totalScore).color, fontFamily: "var(--font-display)" }}
                        >
                          {result.totalScore}
                        </div>
                        <div className="text-sm text-stone-400 mt-1">out of 20</div>
                        <div
                          className="mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{
                            color: totalScoreLabel(result.totalScore).color,
                            backgroundColor: `${totalScoreLabel(result.totalScore).color}18`,
                          }}
                        >
                          {totalScoreLabel(result.totalScore).label}
                        </div>
                      </div>
                    </div>

                    {/* Total progress bar */}
                    <div className="mt-5">
                      <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(result.totalScore / 20) * 100}%`,
                            backgroundColor: totalScoreLabel(result.totalScore).color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Criteria cards — 2 col on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.criteria.map((c) => {
                    const colors = scoreColor(c.score);
                    return (
                      <div
                        key={c.name}
                        className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5"
                        style={{ borderTop: `3px solid ${colors.bar}` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg leading-none">{criterionIcon(c.name)}</span>
                            <span
                              className="text-sm font-bold text-stone-800 leading-tight"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              {c.name}
                            </span>
                          </div>
                          <span
                            className="shrink-0 text-sm font-extrabold px-2 py-0.5 rounded-lg"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {c.score}/5
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 rounded-full bg-stone-100 overflow-hidden mb-3">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(c.score / 5) * 100}%`, backgroundColor: colors.bar }}
                          />
                        </div>

                        {/* Feedback */}
                        <p className="text-xs text-stone-600 leading-relaxed">{c.feedback}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Shareable Summary */}
                <div
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                  style={{ borderTop: "3px solid #a78bfa" }}
                >
                  <div
                    className="px-6 py-4 border-b border-stone-100 flex items-center justify-between"
                    style={{ backgroundColor: "#f5f3ff" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💌</span>
                      <h3
                        className="font-bold text-stone-800 text-base"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Shareable Summary
                      </h3>
                    </div>
                    <CopyButton text={result.shareableSummary} label="Copy for student" />
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-sm text-stone-700 leading-relaxed italic">
                      "{result.shareableSummary}"
                    </p>
                    <p className="text-xs text-stone-400 mt-3">
                      Copy and share this message directly with your student.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
