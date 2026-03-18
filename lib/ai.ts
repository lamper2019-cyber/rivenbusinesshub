import Anthropic from "@anthropic-ai/sdk";
import type { AIInterpretation } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a voice assistant for RIVEN, a fitness coaching CRM. You interpret spoken commands and answer questions about client and lead data.

Available actions (respond with the matching intent):

1. "add_client" — Create a new client. Extract fields: name (required), phase (1/2/3, default 1), startingWeight, tendencyType (Obliger/Upholder/Questioner/Rebel).
   Example: "Add a client named Sarah, she's 180 pounds, she's an Obliger"

2. "add_lead" — Create a new lead. Extract fields: name (required), source (referral/instagram/facebook/website/other), notes.
   Example: "Add a lead named Mike from Instagram"

3. "log_checkin" — Log a check-in for an existing client. Extract fields: clientName (required), currentWeight, feeling (1-10), notes.
   Example: "Log a check-in for Sarah, she's at 175 pounds, feeling great"

4. "query_data" — Answer a question about the data. Use the provided context to answer.
   Example: "Who hasn't checked in this week?" or "What tendency type is Sarah?"

5. "unknown" — If you can't determine the intent.

IMPORTANT: Respond with valid JSON only, no markdown. Format:
{"intent":"...","entities":{...},"response":"..."}

- "entities" should contain extracted field names and values as strings
- "response" should be a natural, friendly confirmation or answer (1-2 sentences)
- For query_data, put the answer in "response"
- Match client names loosely (e.g., "Sarah" matches "Sarah Johnson")`;

export async function interpretVoice(
  transcript: string,
  context: { clients: Array<{ name: string; tendencyType: string; lastCheckInDate: string; status: string }>; leads: Array<{ name: string; status: string; followUpDate: string }> }
): Promise<AIInterpretation> {
  const contextStr = `
Current Clients (${context.clients.length}):
${context.clients.map((c) => `- ${c.name} | Tendency: ${c.tendencyType || "unknown"} | Last check-in: ${c.lastCheckInDate || "never"} | Status: ${c.status}`).join("\n")}

Current Leads (${context.leads.length}):
${context.leads.map((l) => `- ${l.name} | Status: ${l.status} | Follow-up: ${l.followUpDate || "none"}`).join("\n")}

Today's date: ${new Date().toISOString().split("T")[0]}
`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `DATA CONTEXT:\n${contextStr}\n\nUSER SAID: "${transcript}"`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const parsed = JSON.parse(text);
    return {
      intent: parsed.intent || "unknown",
      entities: parsed.entities || {},
      response: parsed.response || "I didn't understand that.",
    };
  } catch {
    return {
      intent: "unknown",
      entities: {},
      response: text || "Sorry, I had trouble processing that.",
    };
  }
}
