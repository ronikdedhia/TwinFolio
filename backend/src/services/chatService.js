import { eq } from "drizzle-orm";
import { db } from "../db/turso.js";
import { profiles } from "../db/schema.js";
import { connectMongo } from "../db/mongo.js";
import { ConversationLog } from "../db/models/ConversationLog.js";
import { ensureCollectionExists, searchRelevantContext, upsertConversationEmbedding } from "../db/qdrant.js";
import { runFinancialTwinAgent } from "../agent/financialTwinAgent.js";

export class NoProfileError extends Error {}

/**
 * One full turn of the chat flow: fetch the customer's stored profile,
 * retrieve relevant past-conversation context via Qdrant (RAG), run the
 * agent, then persist both the conversation log (Mongo) and the new
 * embedding (Qdrant) for future turns to retrieve.
 */
export async function handleChatTurn({ userId, message }) {
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId));
  if (rows.length === 0) {
    throw new NoProfileError("No profile set up yet — create one with PUT /api/profile before chatting");
  }
  const profile = rows[0];

  await ensureCollectionExists();
  const relevantContext = await searchRelevantContext({ userId, queryText: message, limit: 3 });

  const reply = await runFinancialTwinAgent({ message, profile, relevantContext });

  await connectMongo();
  await ConversationLog.create({ userId, message, reply });
  await upsertConversationEmbedding({ userId, text: message, metadata: { reply } });

  return reply;
}
