import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert K-12 curriculum designer helping teachers create practical, engaging lesson plans.

Given a topic, grade level, class duration, and optional notes, generate a comprehensive lesson plan.

Return your response as a valid JSON object with EXACTLY this structure — no markdown, no extra text, just the JSON:

{
  "objectives": ["string", "string"],
  "vocabulary": [
    { "term": "string", "definition": "string" }
  ],
  "outline": [
    { "phase": "Introduction", "duration": "X min", "activity": "string" },
    { "phase": "Main Activity", "duration": "X min", "activity": "string" },
    { "phase": "Closing", "duration": "X min", "activity": "string" }
  ],
  "discussionQuestions": ["string", "string"],
  "assessment": "string",
  "differentiation": {
    "struggling": "string",
    "advanced": "string"
  }
}

Rules:
- objectives: 2–3 clear, measurable learning objectives (start each with an action verb)
- vocabulary: 4–6 key terms appropriate for the grade level
- outline: 3 phases with realistic timings that sum to the requested duration; activities should be specific and actionable
- discussionQuestions: 2–3 open-ended questions that promote critical thinking
- assessment: 2–3 sentences describing how the teacher can assess student understanding
- differentiation.struggling: 2–3 sentences with concrete support strategies
- differentiation.advanced: 2–3 sentences with enrichment or extension activities
- Keep language appropriate for the specified grade level
- Be specific and practical — avoid vague generalities`;

const MAX_TOPIC_LENGTH = 500;
const MAX_NOTES_LENGTH = 500;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not set on the server." }, { status: 500 });
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const { topic, gradeLevel, duration, notes } = await req.json();

    if (!topic?.trim() || !gradeLevel) {
      return Response.json(
        { error: "Topic and grade level are required." },
        { status: 400 }
      );
    }

    if (topic.trim().length > MAX_TOPIC_LENGTH) {
      return Response.json(
        { error: `Topic must be ${MAX_TOPIC_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }

    if (notes?.trim() && notes.trim().length > MAX_NOTES_LENGTH) {
      return Response.json(
        { error: `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }

    const durationLine = duration
      ? `Class duration: ${duration} minutes`
      : "Class duration: 45 minutes (default)";

    const notesLine = notes?.trim()
      ? `Additional notes from the teacher: ${notes.trim()}`
      : "";

    const userPrompt = [
      `Topic: ${topic.trim()}`,
      `Grade level: ${gradeLevel}`,
      durationLine,
      notesLine,
    ]
      .filter(Boolean)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    if (!message.content.length || message.content[0].type !== "text") {
      return Response.json({ error: "No response from AI. Please try again." }, { status: 500 });
    }

    const raw = message.content[0].text;
    const cleaned = raw
      .replace(/^```(?:json)?\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return Response.json({ error: "Failed to parse AI response. Please try again." }, { status: 500 });
    }

    return Response.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("lesson-prep API error:", message);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
