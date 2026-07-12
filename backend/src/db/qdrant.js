import "../env.js";
import crypto from "node:crypto";
import { QdrantClient } from "@qdrant/js-client-rest";
import { embedText, EMBEDDING_DIMENSIONS } from "../services/embeddings.js";

if (!process.env.QDRANT_URL) {
  throw new Error("QDRANT_URL must be set in .env");
}

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY || undefined,
});

export const CONVERSATION_COLLECTION = "twinfolio_conversations";

export async function ensureCollectionExists() {
  const { collections } = await qdrantClient.getCollections();
  const exists = collections.some((c) => c.name === CONVERSATION_COLLECTION);
  if (!exists) {
    await qdrantClient.createCollection(CONVERSATION_COLLECTION, {
      vectors: { size: EMBEDDING_DIMENSIONS, distance: "Cosine" },
    });
    // Qdrant Cloud requires an explicit payload index before a field can be
    // used in a search filter — without this, filtering by userId 400s.
    await qdrantClient.createPayloadIndex(CONVERSATION_COLLECTION, {
      field_name: "userId",
      field_schema: "keyword",
    });
  }
}

/** Embeds and stores a conversation turn, tagged with the owning user's id. */
export async function upsertConversationEmbedding({ userId, text, metadata = {} }) {
  const vector = await embedText(text);
  const id = crypto.randomUUID();
  await qdrantClient.upsert(CONVERSATION_COLLECTION, {
    points: [{ id, vector, payload: { userId, text, ...metadata } }],
  });
  return id;
}

/** Finds this user's past conversation turns most relevant to queryText — the RAG retrieval step. */
export async function searchRelevantContext({ userId, queryText, limit = 3 }) {
  const vector = await embedText(queryText);
  const results = await qdrantClient.search(CONVERSATION_COLLECTION, {
    vector,
    limit,
    filter: { must: [{ key: "userId", match: { value: userId } }] },
  });
  return results.map((r) => r.payload);
}
