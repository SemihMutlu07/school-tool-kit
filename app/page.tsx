import Link from "next/link";

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function PencilSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-emerald-500 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const tools = [
  {
    href: "/lesson-prep",
    Icon: BookOpenIcon,
    name: "Lesson Prep Assistant",
    audience: "For Teachers",
    description:
      "Transform any topic into a complete, classroom-ready lesson plan in seconds. From objectives to differentiation tips.",
    features: [
      "Learning objectives & vocabulary",
      "Timed lesson outline",
      "Discussion questions & assessment",
    ],
    iconBg: "bg-orange-100",
    iconColor: "text-orange-800",
    topBorderColor: "#BC5F04",
    tagStyle:
      "bg-orange-50 text-orange-800 border border-orange-200",
    btnStyle:
      "text-white shadow-md",
    btnInlineStyle: { backgroundColor: "#BC5F04", boxShadow: "0 4px 12px rgba(188,95,4,0.3)" },
    cardGlow: "hover:shadow-orange-100",
  },
  {
    href: "/essay-grader",
    Icon: PencilSquareIcon,
    name: "Essay Grader",
    audience: "For Teachers",
    description:
      "Paste any student essay and get instant rubric-based feedback across 4 criteria. Consistent, detailed, and fair every time.",
    features: [
      "Auto-detects essay type",
      "Scored rubric out of 20",
      "Shareable student feedback",
    ],
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    topBorderColor: "#10b981",
    tagStyle:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    btnStyle:
      "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 shadow-md hover:shadow-emerald-300",
    btnInlineStyle: {},
    cardGlow: "hover:shadow-emerald-100",
  },
  {
    href: "/student-chat",
    Icon: ChatBubbleIcon,
    name: "Student Chatbot",
    audience: "For Students",
    description:
      "An AI tutor that speaks your student's language — calibrated to their grade level, with a Socratic quiz mode for deeper learning.",
    features: [
      "Grade-calibrated answers",
      "Quiz mode with Socratic hints",
      "Any subject, any time",
    ],
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    topBorderColor: "#3b82f6",
    tagStyle:
      "bg-blue-50 text-blue-700 border border-blue-200",
    btnStyle:
      "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200 shadow-md hover:shadow-blue-300",
    btnInlineStyle: {},
    cardGlow: "hover:shadow-blue-100",
  },
];

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#FAFAF7", color: "#010001" }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-sm border-b"
        style={{
          backgroundColor: "rgba(250, 250, 247, 0.92)",
          borderColor: "#E8B87A",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl leading-none">🎓</span>
            <span
              className="text-lg font-bold tracking-tight text-stone-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              AI Toolkit
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Claude AI
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Warm gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #FDF0E3 0%, #FAE8D5 30%, #FAFAF7 70%)",
          }}
        />

        {/* Dot grid decoration — top right */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #BC5F04 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Dot grid decoration — bottom left */}
        <div
          className="absolute bottom-0 left-0 w-72 h-72 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #BC5F04 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Soft blob */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-64 opacity-20 blur-3xl rounded-full"
          style={{ backgroundColor: "#E8B87A" }}
        />

        <div className="relative max-w-4xl mx-auto px-6 py-28 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-2 border-[#010001]"
            style={{
              backgroundColor: "#FDF0E3",
              borderColor: "#010001",
              color: "#BC5F04",
            }}
          >
            <span>✨</span>
            AI-Powered EdTech Mini Tools
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-display)", color: "#010001", letterSpacing: "-0.02em" }}
          >
            Teaching smarter,
            <br />
            <span style={{ color: "#BC5F04" }}>learning deeper.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl leading-relaxed max-w-2xl mx-auto mb-12"
            style={{ color: "#78716c" }}
          >
            Three AI tools built for K–12 classrooms — helping teachers
            prepare lessons faster and students understand concepts better.
          </p>

          {/* Stats row */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium"
            style={{ color: "#a8a29e" }}
          >
            <div className="flex items-center gap-1.5">
              <span style={{ color: "#010001" }} className="font-bold">3</span>
              AI-powered tools
            </div>
            <div className="w-1 h-1 rounded-full bg-stone-300" />
            <div className="flex items-center gap-1.5">
              Built for{" "}
              <span style={{ color: "#010001" }} className="font-bold">
                K–12
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-stone-300" />
            <div className="flex items-center gap-1.5">
              <span style={{ color: "#010001" }} className="font-bold">
                Free
              </span>{" "}
              to try
            </div>
          </div>
        </div>

        {/* Smooth fade into cards section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background: "linear-gradient(to bottom, transparent, #FAFAF7)",
          }}
        />
      </section>

      {/* ── Unified Experience Banner ───────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-10 -mt-4">
        <Link
          href="/chat"
          className="group flex items-center justify-between gap-4 w-full rounded-2xl border px-6 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          style={{ backgroundColor: "#FDF0E3", borderColor: "#E8B87A" }}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: "#F7D9B4" }}>
              ✨
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ fontFamily: "var(--font-display)", color: "#7A3D02" }}>
                Try the unified experience →
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "#BC5F04" }}>
                One chat interface — lesson plans, essay grading, tutoring, all in one.
              </p>
            </div>
          </div>
          <svg className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: "#BC5F04" }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </section>

      {/* ── Tool Cards ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        {/* Section label */}
        <div className="text-center mb-12">
          <p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#BC5F04" }}
          >
            Or choose a specific tool
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {tools.map((tool) => {
            const {
              href,
              Icon,
              name,
              audience,
              description,
              features,
              iconBg,
              iconColor,
              topBorderColor,
              tagStyle,
              btnStyle,
              btnInlineStyle,
              cardGlow,
            } = tool;

            return (
              <div
                key={href}
                className={`group relative rounded-2xl bg-white border-2 border-[#010001] shadow-[4px_4px_0px_0px_#010001] hover:shadow-[6px_6px_0px_0px_#010001] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col`}
                style={{ borderTop: `4px solid ${topBorderColor}` }}
              >
                {/* Subtle inner gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{
                    background: `radial-gradient(ellipse at top, ${topBorderColor}08 0%, transparent 60%)`,
                  }}
                />

                <div className="relative p-7 flex flex-col flex-1">
                  {/* Icon + audience tag */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`${iconBg} p-3.5 rounded-xl`}>
                      <Icon className={`w-7 h-7 ${iconColor}`} />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagStyle}`}
                    >
                      {audience}
                    </span>
                  </div>

                  {/* Name */}
                  <h2
                    className="text-xl font-bold text-stone-900 mb-2.5 leading-snug"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {name}
                  </h2>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-stone-500 mb-6">
                    {description}
                  </p>

                  {/* Feature list */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2.5 text-sm text-stone-600"
                      >
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <Link
                    href={href}
                    className={`flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl border-2 border-[#010001] shadow-[2px_2px_0px_0px_#010001] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 text-sm font-semibold transition-all duration-200 ${btnStyle}`}
                    style={btnInlineStyle}
                  >
                    Open Tool
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
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{ borderColor: "#E8B87A", backgroundColor: "rgba(250,250,247,0.6)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-400">
          <span>© 2025 AI Toolkit · A product case study demo</span>
          <span className="flex items-center gap-1.5">
            Built with Next.js · Claude AI
          </span>
        </div>
      </footer>
    </div>
  );
}
