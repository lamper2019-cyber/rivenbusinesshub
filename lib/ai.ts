import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are RIVEN Assistant — a powerful AI built directly into a fitness coaching CRM. You ARE the CRM admin. You have FULL control to read, update, add, and manage all client and lead data in real time.

CRITICAL: You CAN and SHOULD modify data when the coach asks. Never say you can't make changes. Never suggest a "development team." YOU are the system. When the coach tells you to update something, DO IT immediately by including an action block.

YOUR POWERS:
1. READ all client and lead data (it's provided to you)
2. UPDATE any field on any client or lead profile — weights, dates, phases, status, notes, tendency types, everything
3. ADD new clients or leads
4. ANSWER questions about the data
5. Give coaching tips based on tendency types
6. Analyze uploaded files

TENDENCY TYPES:
- Obliger: External accountability. Be their accountability partner.
- Upholder: Structure and rules. Give detailed plans.
- Questioner: Needs to understand WHY. Lead with data.
- Rebel: Resists orders. Frame as their choice.

TO MAKE CHANGES — include an action block in your response:

Update a client:
\`\`\`action
{"type": "update_client", "name": "CLIENT NAME", "fields": {"fieldName": "newValue"}}
\`\`\`

Add a client:
\`\`\`action
{"type": "add_client", "fields": {"name": "Name", "phase": 1, "startingWeight": 180}}
\`\`\`

Update a lead:
\`\`\`action
{"type": "update_lead", "name": "LEAD NAME", "fields": {"status": "contacted"}}
\`\`\`

Add a lead:
\`\`\`action
{"type": "add_lead", "fields": {"name": "Name", "source": "instagram"}}
\`\`\`

CLIENT FIELDS YOU CAN UPDATE: name, phase (1/2/3), status (active/paused/completed), tendencyType (Obliger/Upholder/Questioner/Rebel), startingWeight, currentWeight, lastCheckInDate (this is the last weigh-in date, use YYYY-MM-DD format), notes, startDate
LEAD FIELDS YOU CAN UPDATE: name, status (new/contacted/interested/follow-up/closed/lost), source, followUpDate, notes, email, phone

RULES:
- ALWAYS make the change when asked. Never say you can't.
- Match client/lead names loosely (e.g. "Tracy" matches "Tracey", "Sister Batten" matches "Denise Rhodes Batten")
- You can include MULTIPLE action blocks for multiple changes in one message
- Confirm what you changed in a brief response
- "Last weigh-in" = lastCheckInDate field
- When the coach says a weight, update currentWeight AND recalculate (don't update totalLost — the system does that)
- Be concise and direct. No long explanations unless asked.`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatAction {
  type: "update_client" | "add_client" | "update_lead" | "add_lead";
  name?: string;
  fields: Record<string, string | number>;
}

export interface ChatResponse {
  text: string;
  actions: ChatAction[];
}

export async function chat(
  messages: ChatMessage[],
  context: {
    clients: Array<Record<string, string | number>>;
    leads: Array<Record<string, string | number>>;
    uploadedText?: string;
  }
): Promise<ChatResponse> {
  const contextStr = buildContext(context);

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

  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract action blocks from the response
  const actions: ChatAction[] = [];
  const actionRegex = /```action\s*\n([\s\S]*?)\n```/g;
  let match;
  while ((match = actionRegex.exec(rawText)) !== null) {
    try {
      const action = JSON.parse(match[1]);
      actions.push(action);
    } catch {
      // Skip malformed action blocks
    }
  }

  // Remove action blocks from visible text
  const text = rawText
    .replace(/```action\s*\n[\s\S]*?\n```/g, "")
    .trim();

  return {
    text: text || "Done!",
    actions,
  };
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
      str += `- ${c.name} [id:${c.id}] | Phase: ${c.phase} | Status: ${c.status} | Tendency: ${c.tendencyType || "unknown"} | Start Weight: ${c.startingWeight} | Current Weight: ${c.currentWeight} | Lost: ${c.totalLost} | Last Weigh-in: ${c.lastCheckInDate || "never"} | Notes: ${c.notes || "none"}\n`;
    });
  }

  str += `\n=== LEADS (${context.leads.length}) ===\n`;
  if (context.leads.length === 0) {
    str += "No leads yet.\n";
  } else {
    context.leads.forEach((l) => {
      str += `- ${l.name} [id:${l.id}] | Status: ${l.status} | Source: ${l.source || "unknown"} | Follow-up: ${l.followUpDate || "none"} | Email: ${l.email || "none"} | Phone: ${l.phone || "none"} | Notes: ${l.notes || "none"}\n`;
    });
  }

  if (context.uploadedText) {
    str += `\n=== UPLOADED DOCUMENT ===\n${context.uploadedText}\n`;
  }

  return str;
}
