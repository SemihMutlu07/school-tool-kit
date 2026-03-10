import Anthropic from "@anthropic-ai/sdk";

export type Intent = "lesson_plan" | "essay_grade" | "student_chat" | "general";

type Message = { role: "user" | "assistant"; content: string };

// ── System prompts per intent ──────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<Intent, string> = {
  lesson_plan: `You are an expert K-12 curriculum designer helping teachers create lesson plans in a conversational chat.

When asked to create a lesson plan:
- If topic is missing, ask for it before generating
- If grade level is missing, ask for it before generating
- Generate a complete, practical lesson plan in markdown:

## 🎯 Learning Objectives
2–3 measurable objectives starting with action verbs.

## 📖 Key Vocabulary
4–6 key terms with brief, grade-appropriate definitions.

## 🗂️ Lesson Outline
3 phases — Introduction, Main Activity, Closing — each with duration and specific activity.

## 💬 Discussion Questions
2–3 open-ended questions promoting critical thinking.

## 📊 Assessment Suggestion
2–3 sentences on how to assess student understanding.

## 🌱 Differentiation Tips
**Struggling Learners:** concrete support strategies.
**Advanced Learners:** enrichment or extension activities.

After generating, invite the teacher to ask for modifications.
Respond in the same language the user writes (Turkish or English). Tone: professional, warm, practical.`,

  essay_grade: `You are an expert K-12 writing teacher helping grade student essays conversationally.

When a user shares essay text for grading:
- If grade level is not specified, ask for it before grading
- Auto-detect essay type (Argumentative, Narrative, Informative, Descriptive, Persuasive)
- Grade on 4 criteria (each 1–5): Thesis & Focus, Evidence & Support, Organization & Structure, Language & Clarity

Format your evaluation in markdown:

## ✏️ Essay Type: [type detected]

### 🎯 Thesis & Focus — X/5
[2-3 specific sentences about this essay]

### 🔍 Evidence & Support — X/5
[2-3 specific sentences about this essay]

### 🗂️ Organization & Structure — X/5
[2-3 specific sentences about this essay]

### ✍️ Language & Clarity — X/5
[2-3 specific sentences about this essay]

**Total Score: XX / 20**

## 💌 For the Student
[2-3 warm, encouraging sentences the teacher can share directly with the student]

Be specific to THIS essay's actual content. Calibrate expectations to the grade level.
Respond in the same language the user writes (Turkish or English).`,

  student_chat: `You are a friendly, encouraging AI tutor for K-12 students in a conversational interface.

At the very start of EVERY response, output exactly one of these two tags on its own line — before any other text:
- [MODE: explanation] — when you are explaining, answering, or teaching
- [MODE: hint] — when you are in Socratic/quiz mode, guiding with questions and hints

BEHAVIOR RULES:
1. Normal questions → [MODE: explanation]
   - Answer clearly at the right level, with concrete examples or analogies
   - Keep responses focused and digestible

2. Quiz/practice triggers ("quiz me", "soru sor", "test me", "practice") → [MODE: hint]
   - Ask ONE guiding question — NEVER give the direct answer
   - If stuck, give a smaller hint; if correct, praise warmly and ask a follow-up
   - Stay in hint mode until the student asks for a full explanation

3. Tone: warm, patient, enthusiastic — never condescending. Celebrate effort.
4. Safety: only educational topics. Never ask for personal information.
5. Respond in the same language the user writes (Turkish or English).`,

  general: `You are an AI Toolkit assistant — an all-in-one educational platform for teachers and students.

Your three capabilities:
- 📋 **Lesson Plans** — Create detailed K-12 lesson plans for any topic and grade level
- ✏️ **Essay Grader** — Grade student essays with rubric-based feedback and a shareable summary
- 💬 **Study Tutor** — Explain topics, quiz students, help them understand any subject

For a first message: briefly welcome the user (2-3 sentences) and invite them to try a capability.
For follow-up messages: help them navigate to the right mode or answer their question directly.

Examples to guide the user:
- "ders planı hazırla" / "make a lesson plan about X for grade Y" → lesson plan mode
- "bu yazıyı değerlendir" / "grade this essay" (then paste text) → essay grader mode
- "fotosentezi açıkla" / "explain photosynthesis" → study tutor mode

Respond in Turkish if the user writes Turkish, English if they write English. Be warm, concise, helpful.`,
};

// ── Intent detection ───────────────────────────────────────────────────────────

function detectIntent(message: string, lastIntent: Intent | null): Intent {
  const m = message.toLowerCase();

  // Lesson plan
  if (
    /ders\s*plan[ıi]|lesson\s*plan|plan\s*(yap|oluştur|hazırla)|konu\s*(hazırla|işle)|ders\s*(hazırla|oluştur)|öğretim\s*plan|haftalık\s*plan|unit\s*plan|müfredat|learning\s*obj/.test(m) ||
    /\b(create|make|generate|write|prepare)\b.{0,25}\b(lesson|plan|class|activity|unit|curriculum)\b/.test(m)
  ) return "lesson_plan";

  // Essay grade
  if (
    /kompo[sz]isyon|yazı(yı)?\s*(değerlendir|puan|not)|ödev\s*(puan|değerlendir|not|grade)|grade\s*(this|my|the|an)\b|ödev\s*puanla|değerlendir\b|puanla\b|rubric/.test(m) ||
    /\b(grade|evaluate|assess|score)\b.{0,20}\b(essay|writing|text|composition|paragraph)\b/.test(m)
  ) return "essay_grade";

  // Student chat / tutoring
  if (
    /açıkla(r\s*mısın)?|anlamıyorum|anlat(ır\s*mısın)?|quiz\s*(me|yap)|soru\s*sor|öğret(ir\s*misin)?|nedir\b|nasıl\s*(çalışır|yapılır)|neden\b/.test(m) ||
    /\b(explain|what\s+is|what\s+are|how\s+does|how\s+do|teach\s+me|help\s+me\s+(understand|learn)|i\s+don.t\s+understand|practice|quiz\s+me)\b/.test(m)
  ) return "student_chat";

  // Context carry-over: keep last non-general intent on continuation signals
  if (lastIntent && lastIntent !== "general") {
    if (/\b(bunu|bunun|this|it|same|aynı|şimdi|now|also|ayrıca|devam|continue|more|daha|extend|modify|değiştir|change|add|ekle|başka|another)\b/.test(m)) {
      return lastIntent;
    }
  }

  return "general";
}

// ── Route handler ──────────────────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 20;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not set on the server." }, { status: 500 });
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const { messages, newMessage, lastIntent } = await req.json();

    if (!newMessage?.trim()) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    if (newMessage.trim().length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }

    const intent = detectIntent(newMessage.trim(), lastIntent ?? null);
    const systemPrompt = SYSTEM_PROMPTS[intent];

    const history: Message[] = (Array.isArray(messages) ? messages : [])
      .filter(
        (m): m is Message =>
          m &&
          typeof m === "object" &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-MAX_HISTORY_MESSAGES);

    const allMessages: Message[] = [
      ...history,
      { role: "user", content: newMessage.trim() },
    ];

    const maxTokens = intent === "lesson_plan" ? 2048 : intent === "essay_grade" ? 1500 : 1024;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: allMessages,
    });

    if (!response.content.length || response.content[0].type !== "text") {
      return Response.json({ error: "No response from AI. Please try again." }, { status: 500 });
    }

    return Response.json({ reply: response.content[0].text, intent });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("chat API error:", message);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
