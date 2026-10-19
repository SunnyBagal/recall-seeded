import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface AISummaryResult {
  summary: string;
  tags: string[];
}

// Returns null when the model's reply can't be parsed as the expected JSON.
// Callers should leave summary/tags empty in that case rather than store
// whatever free text came back.
export async function generateSummaryAndTags(
  text: string,
  title: string | null,
  contentType: string
): Promise<AISummaryResult | null> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Analyze this ${contentType} content and return a JSON object with exactly two fields:
1. "summary": A concise 2-3 sentence summary of the key points. Be specific.
2. "tags": An array of EXACTLY 2-3 lowercase category tags. Pick the MOST relevant from this list: tech, programming, web-dev, mobile, ai, ml, database, devops, cloud, security, api, frontend, backend, system-design, finance, investing, crypto, business, startup, career, design, ui-ux, productivity, science, news, tutorial, opinion, video, social, health, education, entertainment, gaming, open-source, tools

IMPORTANT: Return ONLY 2-3 tags maximum. Do NOT return more than 3 tags.

Title: ${title ?? "Untitled"}
Content type: ${contentType}

Content:
${text.slice(0, 4000)}

Respond with ONLY the JSON object, no markdown backticks, no explanation.`,
      },
    ],
  });

  const firstBlock = response.content[0];
  const responseText =
    firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

  try {
    const cleaned = responseText.replace(/```json\s*|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
      console.error("[aiProcessor] Response had no summary:", responseText);
      return null;
    }

    return {
      summary: parsed.summary.trim(),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.filter((t: unknown) => typeof t === "string").slice(0, 3)
        : [],
    };
  } catch {
    console.error("[aiProcessor] Failed to parse Claude response:", responseText);
    return null;
  }
}
