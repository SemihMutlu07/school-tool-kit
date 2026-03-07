# CLAUDE.md — Madlen AI Toolkit

## Project Overview
This is a case study submission for Madlen (madlen.io), an AI-powered EdTech platform for K-12 teachers and students based in Turkey, expanding internationally. The project builds **three AI-powered mini tools** under a single platform called "Madlen AI Toolkit" to demonstrate product thinking, technical execution, and prompt engineering skills.

## Context
- **Role applied for:** Product Intern at Madlen
- **Case study Step 3:** Build functional AI mini-products, deploy to public URL
- **Evaluation criteria:** End-to-end working product, clean UI for non-technical users, deployed on public URL, process log + prompt engineering log
- **Target users:** Teachers (Lesson Prep, Essay Grader) and Students (Student Chatbot)

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **AI API:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Deploy:** Netlify
- **Language:** TypeScript

## Architecture

```
school-tool-kit/
├── app/
│   ├── page.tsx                    # Landing page with 3 tool cards
│   ├── layout.tsx                  # Shared layout, fonts, metadata
│   ├── globals.css                 # Tailwind + custom styles
│   ├── lesson-prep/
│   │   └── page.tsx                # Lesson Prep Assistant page
│   ├── essay-grader/
│   │   └── page.tsx                # Essay Grader page
│   ├── student-chat/
│   │   └── page.tsx                # Student Chatbot page
│   └── api/
│       ├── lesson-prep/route.ts    # API route for lesson generation
│       ├── essay-grader/route.ts   # API route for essay grading
│       └── student-chat/route.ts   # API route for chat messages
├── components/
│   ├── ui/                         # Shared UI components (Button, Card, Input, etc.)
│   ├── LessonPrepForm.tsx
│   ├── EssayGraderForm.tsx
│   ├── ChatInterface.tsx
│   └── LoadingAnimation.tsx        # Tool-specific loading animations
├── prompts/
│   ├── lesson-prep.md              # System prompt for Lesson Prep
│   ├── essay-grader.md             # System prompt for Essay Grader
│   └── student-chat.md             # System prompt for Student Chatbot
├── lib/
│   ├── anthropic.ts                # Shared Claude API client
│   └── types.ts                    # TypeScript types
├── public/
│   └── ...                         # Static assets
├── .env.local                      # ANTHROPIC_API_KEY=sk-ant-...
├── CLAUDE.md                       # This file
└── README.md
```

## Three Tools — Specifications

### 1. Lesson Prep Assistant (`/lesson-prep`)
**User:** Teacher
**Flow:** Form input → AI generates structured lesson plan → Display formatted output

**Inputs:**
- Topic (required, text input) — e.g., "Photosynthesis", "World War II causes"
- Grade Level (required, dropdown) — Elementary (3-5) / Middle (6-8) / High (9-12)
- Duration (optional, dropdown) — 30 / 45 / 60 / 90 minutes
- Additional Notes (optional, textarea) — e.g., "include hands-on activity", "focus on visual learners"

**Output (structured sections):**
- Learning Objectives (2-3 items)
- Key Concepts & Vocabulary
- Lesson Outline (with timing: intro → main activity → closing)
- Discussion Questions (2-3)
- Assessment Suggestion
- Differentiation Tips (struggling + advanced learners)

**UI notes:**
- Clean form on left or top, output renders below/right
- Output sections visually separated with clear headings
- Copy-to-clipboard or print option for the full plan
- Tool-specific loading animation (book/notebook icon)

### 2. Essay Grader (`/essay-grader`)
**User:** Teacher
**Flow:** Paste essay text OR upload PDF → AI analyzes and grades → Display rubric scores + feedback

**Inputs:**
- Essay content (required) — textarea for pasting OR PDF file upload
- Grade Level (required, dropdown) — same as above

**AI auto-detects:** Essay type (argumentative, narrative, informative, etc.) — no dropdown needed

**Output:**
- Essay type detected (shown as badge)
- 4-criteria rubric, each scored 1-5:
  1. **Thesis & Focus** — clarity of main argument/purpose
  2. **Evidence & Support** — quality of supporting details
  3. **Organization & Structure** — logical flow, transitions
  4. **Language & Clarity** — grammar, vocabulary, grade-appropriate style
- Per-criterion feedback: 2-3 sentences (what's strong + what to improve)
- Overall Score (sum out of 20, displayed prominently)
- Shareable Summary (2-3 sentences the teacher can copy and share with the student)

**UI notes:**
- Large textarea with "or upload PDF" option
- Results displayed as score cards/rubric grid
- Visual score indicator (progress bars or colored scale)
- Tool-specific loading animation (pencil/grading icon)

### 3. Student Chatbot (`/student-chat`)
**User:** Student
**Flow:** Select grade + optional topic → Conversational chat with AI tutor

**Setup inputs (shown before chat):**
- Grade Level (required) — Elementary (3-5) / Middle (6-8) / High (9-12)
- Subject/Topic (optional, text) — narrows conversation scope

**Chat behavior:**
- Answers calibrated to selected grade level (vocabulary, complexity, examples)
- Normal questions: clear, age-appropriate explanations with examples
- Practice/quiz triggers ("quiz me", "test my knowledge", "practice"): switches to Socratic mode — asks guiding questions, gives hints, never gives direct answers
- Visual indicator on each message: "Explanation" badge vs "Hint" badge
- Safety: no inappropriate content, stays on educational topics, doesn't ask for personal info

**UI notes:**
- Grade/topic selection screen first, then chat opens
- Chat UI: clean message bubbles, auto-scroll, input at bottom
- Mobile-responsive (students use phones)
- Tool-specific loading animation (chat bubble icon)

## Design System
- **Aesthetic:** Clean, modern, professional but warm — suitable for education context
- **Color palette:** Align loosely with Madlen's orange/warm tones but keep it distinct as a toolkit demo
- **Typography:** Use a distinctive, readable font pair (e.g., a clean display font + readable body)
- **Shared components:** All three tools share the same header/nav, card style, button style, loading pattern
- **Loading animations:** Each tool gets a unique, subtle animation during AI processing (NOT a generic spinner)
- **Responsiveness:** All pages must work well on mobile, especially Student Chatbot

## API Route Pattern
Each API route follows the same pattern:

```typescript
// app/api/[tool]/route.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();
  
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT, // from prompts/ folder
    messages: [{ role: 'user', content: userPrompt }],
  });

  return Response.json({ result: message.content[0].text });
}
```

For Student Chatbot, maintain conversation history in the request:
```typescript
messages: [...conversationHistory, { role: 'user', content: newMessage }]
```

## Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Lint
```

## Important Notes
- This is a DEMO/CASE STUDY product — no database needed, no auth needed
- All state is in-memory (React state), nothing persists
- PDF upload for Essay Grader: extract text client-side using pdf.js, send text to API
- Keep the codebase simple and clean — this will be reviewed by evaluators
- Every UI decision should be defensible in the process log
- Prompt iterations should be documented for the prompt engineering log

## Quality Checklist
- [ ] All three tools work end-to-end without errors
- [ ] Landing page clearly presents the three tools
- [ ] Each tool has appropriate loading state
- [ ] UI is clean enough for a non-technical teacher/student
- [ ] Mobile responsive, especially Student Chatbot
- [ ] Deployed and accessible via public URL
- [ ] No API key exposed in frontend code