const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("[Embedding] OPENAI_API_KEY not set — embeddings will be skipped");
}

export class EmbeddingError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "EmbeddingError";
  }
}

/**
 * Embeds `text` with text-embedding-3-small.
 *
 * Returns null only when embeddings are disabled (no OPENAI_API_KEY).
 * Network and API failures throw an EmbeddingError carrying the HTTP status,
 * so an outage or exhausted quota is reported rather than looking the same
 * as "embeddings turned off".
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null;

  const truncated = text.slice(0, 30_000);

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: truncated,
      }),
    });
  } catch (err) {
    throw new EmbeddingError(`request failed: ${(err as Error).message}`);
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new EmbeddingError(`OpenAI API error: ${response.status} ${errText}`, response.status);
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}
