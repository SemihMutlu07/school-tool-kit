import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert K-12 writing teacher who grades student essays with precision, fairness, and constructive feedback.

Given an essay and grade level, you will:
1. Identify the essay type automatically (Argumentative, Narrative, Informative/Expository, Descriptive, or Persuasive)
2. Score the essay on 4 criteria, each from 1 to 5
3. Provide specific, actionable feedback for each criterion
4. Compute the total score (sum of 4 criteria, max 20)
5. Write a short shareable summary the teacher can share with the student

Scoring rubric (apply consistently for the given grade level):
- 5 = Excellent / exceeds expectations
- 4 = Proficient / meets expectations well
- 3 = Developing / meets basic expectations
- 2 = Approaching / partially meets expectations
- 1 = Beginning / does not yet meet expectations

The 4 criteria:
1. Thesis & Focus — clarity and consistency of the main argument or purpose
2. Evidence & Support — quality and relevance of supporting details, examples, or reasoning
3. Organization & Structure — logical flow, effective transitions, clear intro/body/conclusion
4. Language & Clarity — grammar, vocabulary, sentence variety, grade-appropriate style

Return ONLY a valid JSON object — no markdown, no explanation, just JSON:

{
  "essayType": "string",
  "criteria": [
    { "name": "Thesis & Focus",         "score": 1-5, "feedback": "2-3 sentences: what works + what to improve" },
    { "name": "Evidence & Support",      "score": 1-5, "feedback": "2-3 sentences: what works + what to improve" },
    { "name": "Organization & Structure","score": 1-5, "feedback": "2-3 sentences: what works + what to improve" },
    { "name": "Language & Clarity",      "score": 1-5, "feedback": "2-3 sentences: what works + what to improve" }
  ],
  "totalScore": number,
  "shareableSummary": "2-3 sentences suitable to share directly with the student — encouraging tone, specific strengths and one key area to work on"
}

Rules:
- totalScore must equal the sum of the 4 criterion scores
- Be calibrated to the specified grade level — a perfect score for 4th grade is different from 12th grade
- Feedback must be specific to THIS essay, not generic
- shareableSummary should be warm, honest, and student-facing`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not set on the server." }, { status: 500 });
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const { essayText, gradeLevel } = await req.json();

    if (!essayText?.trim() || !gradeLevel) {
      return Response.json(
        { error: "Essay text and grade level are required." },
        { status: 400 }
      );
    }

    if (essayText.trim().length < 50) {
      return Response.json(
        { error: "Please provide a longer essay (at least a few sentences)." },
        { status: 400 }
      );
    }

    const userPrompt = `Grade level: ${gradeLevel}\n\nEssay to grade:\n\n${essayText.trim()}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    const cleaned = raw
      .replace(/^```(?:json)?\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    const result = JSON.parse(cleaned);

    // Ensure totalScore is correct
    if (result.criteria?.length === 4) {
      result.totalScore = result.criteria.reduce(
        (sum: number, c: { score: number }) => sum + c.score,
        0
      );
    }

    return Response.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("essay-grader API error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
