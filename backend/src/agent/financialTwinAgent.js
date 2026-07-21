import { ChatGroq } from "@langchain/groq";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { buildTools } from "./tools.js";

const SYSTEM_PROMPT = `You are the customer's financial digital twin inside a wealth-advisory app.
You are not a generic chatbot — you have tools that run a real simulation of the customer's
own financial future. Whenever the customer asks a "what if" question about saving, investing,
or reaching a goal, call the appropriate tool rather than guessing or estimating yourself.
After a tool returns, explain the result in plain, encouraging language, and always say *why*
the number is what it is. Keep responses short — a few sentences, not an essay.`;

const MAX_TOOL_ITERATIONS = 4;

/**
 * Runs one turn of the financial twin agent.
 * @param {object} params
 * @param {string} params.message - the customer's message
 * @param {object} params.profile - { currentSavings, monthlyContribution, years, goalAmount }
 * @param {Array<{text: string, reply?: string}>} [params.relevantContext] - past conversation
 *   turns retrieved via RAG (Qdrant semantic search), most relevant to this message
 * @returns {Promise<string>} the twin's reply
 */
export async function runFinancialTwinAgent({ message, profile, relevantContext = [] }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set — add it to .env before using the agent");
  }

  const tools = buildTools(profile);
  const toolsByName = Object.fromEntries(tools.map((t) => [t.name, t]));

  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
  }).bindTools(tools);

  const profileSummary =
    `Customer's current plan: saving ₹${profile.currentSavings} so far, ` +
    `contributing ₹${profile.monthlyContribution}/month, over ${profile.years} years, ` +
    `targeting a goal of ₹${profile.goalAmount}.`;

  const messages = [new SystemMessage(SYSTEM_PROMPT), new SystemMessage(profileSummary)];

  if (relevantContext.length > 0) {
    const contextText = relevantContext
      .map((c, i) => `${i + 1}. Customer previously said: "${c.text}"${c.reply ? ` — you replied: "${c.reply}"` : ""}`)
      .join("\n");
    messages.push(
      new SystemMessage(
        `Relevant past conversation with this customer (most similar to their current message):\n${contextText}`
      )
    );
  }

  messages.push(new HumanMessage(message));

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await model.invoke(messages);
    messages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      return response.content;
    }

    for (const call of response.tool_calls) {
      const selectedTool = toolsByName[call.name];
      const result = selectedTool
        ? await selectedTool.invoke(call.args)
        : JSON.stringify({ error: `Unknown tool: ${call.name}` });

      messages.push(new ToolMessage({ content: result, tool_call_id: call.id }));
    }
  }

  return "I looked into a few things but couldn't quite settle on an answer — could you rephrase your question?";
}
