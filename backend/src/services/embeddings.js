import { pipeline } from "@xenova/transformers";

// Runs locally, in-process — no API key, no external embeddings service.
export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_DIMENSIONS = 384;

let embedderPromise = null;

function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", EMBEDDING_MODEL);
  }
  return embedderPromise;
}

export async function embedText(text) {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
