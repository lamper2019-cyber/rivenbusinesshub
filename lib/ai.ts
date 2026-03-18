import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are RIVEN Assistant, an AI assistant built into a fitness coaching CRM. You have full access to the coach's client and lead data.

YOUR CAPABILITIES:
1. Answer questions about clients and leads
2. UPDATE client profiles when the coach asks you to change something
3. ADD new clients or leads when asked
4. Give coaching tips based on tendency types
5. Analyze uploaded files and extract useful info
6. Flag who needs check-ins or follow-ups

TENDENCY TYPES:
- Obliger: External accountability. Be their accountability partner.
- Upholder: Structure and rules. Give detailed plans.
- Questioner: Needs to understand WHY. Lead with data.
- Rebel: Resists orders. Frame as their choice.

IMPORTANT — WHEN THE USER ASKS YOU TO UPDATE/CHANGE/SET CLIENT OR LEAD DATA:
You MUST include a JSON action block in your response using this exact format:

\`\`\`action
{"type": "update_client", "name": "CLIENT NAME", "fields": {"fieldName": "newValue"}}
\`\`\`

or for adding a new client:
\`\`\`action
{"type": "add_client", "fields": {"name": "Name", "phase": 1, "startingWeight": 180, "tendencyType": "Obliger"}}
\`\`\`

or for adding a new lead:
\`\`\`action
{"type": "add_lead", "fields": {"name": "Name", "source": "instagram", "notes": "Met at event"}}
\`\`\`

or for updating a lead:
\`\`\`action
{"type": "update_lead", "name": "LEAD NAME", "fields": {"status": "contacted"}}
\`\`\`

UPDATABLE CLIENT FIELDS: name, phase (1/2/3), status (active/paused/completed), tendencyType (Obliger/Upholder/Questioner/Rebel), startingWeight, currentWeight, notes, startDate
UPDATABLE LEAD FIELDS: name, status (new/contacted/interested/follow-up/closed/lost), source, followUpDate, notes, email, phone

RULES:
- Match client/lead names loosely (e.g. "Danielle" matches "Danielle D.")
- Always confirm what you changed in your text response
- You can include multiple action blocks if multiple changes are needed
- If the user provides info about a client (e.g. "she's an Obliger" or "move her to phase 2"), update the profile
- Be concise, friendly, and actionable`;

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
      str += `- ${c.name} [id:${c.id}] | Phase: ${c.phase} | Status: ${c.status} | Tendency: ${c.tendencyType || "unknown"} | Start Weight: ${c.startingWeight} | Current Weight: ${c.currentWeight} | Lost: ${c.totalLost} | Last Check-in: ${c.lastCheckInDate || "never"} | Notes: ${c.notes || "none"}\n`;
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
