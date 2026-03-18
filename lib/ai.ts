import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are RIVEN Assistant, an AI assistant built into a fitness coaching CRM. You have full access to the coach's client data, lead data, and any uploaded files/documents.

Your job:
- Answer questions about clients (weight progress, tendency types, check-in history, status, etc.)
- Answer questions about leads (status, follow-up dates, sources, etc.)
- Help analyze uploaded documents (CSVs, meeting transcripts, typeform exports, notes)
- Give coaching suggestions based on client tendency types (Obliger, Upholder, Questioner, Rebel)
- Flag who needs check-ins, follow-ups, or attention
- Help update client/lead information when asked (provide the specific changes to make)
- Summarize data, spot trends, and give actionable insights

Tendency Types & Coaching Approaches:
- Obliger: Responds to external accountability. Be their accountability partner.
- Upholder: Thrives with structure and clear rules. Give detailed plans.
- Questioner: Needs to understand WHY. Lead with data and reasoning.
- Rebel: Resists being told what to do. Frame choices as their decision.

Be concise, friendly, and actionable. Use the data provided to give specific, personalized answers. If you don't have enough data to answer, say so clearly.`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  context: {
    clients: Array<Record<string, string | number>>;
    leads: Array<Record<string, string | number>>;
    uploadedText?: string;
  }
): Promise<string> {
  const contextStr = buildContext(context);

  // Prepend context to the first user message
  const apiMessages = messages.map((msg, i) => {
    if (i === 0 && msg.role === "user") {
      return {
        role: msg.role as "user",
        content: `[CRM DATA CONTEXT]\n${contextStr}\n\n[USER MESSAGE]\n${msg.content}`,
      };
    }
    return { role: msg.role as "user" | "assistant", content: msg.content };
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return text || "I wasn't able to generate a response. Please try again.";
}

function buildContext(context: {
  clients: Array<Record<string, string | number>>;
  leads: Array<Record<string, string | number>>;
  uploadedText?: string;
}): string {
  const today = new Date().toISOString().split("T")[0];

  let str = `Today: ${today}\n\n`;

  str += `=== CLIENTS (${context.clients.length}) ===\n`;
  if (context.clients.length === 0) {
    str += "No clients yet.\n";
  } else {
    context.clients.forEach((c) => {
      str += `- ${c.name} | Phase: ${c.phase} | Status: ${c.status} | Tendency: ${c.tendencyType || "unknown"} | Start Weight: ${c.startingWeight} | Current Weight: ${c.currentWeight} | Lost: ${c.totalLost} | Last Check-in: ${c.lastCheckInDate || "never"}\n`;
    });
  }

  str += `\n=== LEADS (${context.leads.length}) ===\n`;
  if (context.leads.length === 0) {
    str += "No leads yet.\n";
  } else {
    context.leads.forEach((l) => {
      str += `- ${l.name} | Status: ${l.status} | Source: ${l.source || "unknown"} | Follow-up: ${l.followUpDate || "none"} | Notes: ${l.notes || "none"}\n`;
    });
  }

  if (context.uploadedText) {
    str += `\n=== UPLOADED DOCUMENT ===\n${context.uploadedText}\n`;
  }

  return str;
}
