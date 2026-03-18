"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import {
  getAllClients,
  getAllLeads,
  putClient,
  putLead,
  getClient,
  getLead,
} from "@/lib/db";
import type { Client, Lead } from "@/lib/types";

interface ChatAction {
  type: "update_client" | "add_client" | "update_lead" | "add_lead";
  name?: string;
  fields: Record<string, string | number>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  file?: { name: string; text: string };
  actions?: ChatAction[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm your RIVEN assistant. I can see all your clients and leads. Ask me anything, tell me to update a client's info, add new people, or upload a file and I'll help you make sense of it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    text: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  // Execute actions returned by the AI (update/add clients and leads)
  async function executeActions(actions: ChatAction[]): Promise<string[]> {
    const results: string[] = [];

    for (const action of actions) {
      try {
        if (action.type === "update_client" && action.name) {
          const clients = await getAllClients();
          const match = clients.find((c) =>
            c.name.toLowerCase().includes(action.name!.toLowerCase())
          );
          if (match) {
            const updated = { ...match };
            for (const [key, value] of Object.entries(action.fields)) {
              if (key === "phase") {
                updated.phase = Number(value) as 1 | 2 | 3;
              } else if (key === "startingWeight") {
                updated.startingWeight = Number(value);
                updated.totalLost = updated.startingWeight - updated.currentWeight;
              } else if (key === "currentWeight") {
                updated.currentWeight = Number(value);
                updated.totalLost = updated.startingWeight - updated.currentWeight;
              } else if (key in updated) {
                (updated as Record<string, unknown>)[key] = value;
              }
            }
            await putClient(updated);
            results.push(`Updated ${match.name}`);
          } else {
            results.push(`Could not find client "${action.name}"`);
          }
        } else if (action.type === "add_client") {
          const newClient: Client = {
            id: uuid(),
            name: String(action.fields.name || "New Client"),
            phase: (Number(action.fields.phase) || 1) as 1 | 2 | 3,
            startDate:
              String(action.fields.startDate || new Date().toISOString().split("T")[0]),
            startingWeight: Number(action.fields.startingWeight) || 0,
            currentWeight:
              Number(action.fields.currentWeight) ||
              Number(action.fields.startingWeight) ||
              0,
            totalLost: 0,
            tendencyType:
              (String(action.fields.tendencyType || "") as Client["tendencyType"]) || "",
            lastCheckInDate: "",
            status: (String(action.fields.status || "active")) as Client["status"],
            notes: String(action.fields.notes || ""),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedAt: "",
          };
          await putClient(newClient);
          results.push(`Added client: ${newClient.name}`);
        } else if (action.type === "update_lead" && action.name) {
          const leads = await getAllLeads();
          const match = leads.find((l) =>
            l.name.toLowerCase().includes(action.name!.toLowerCase())
          );
          if (match) {
            const updated = { ...match };
            for (const [key, value] of Object.entries(action.fields)) {
              if (key in updated) {
                (updated as Record<string, unknown>)[key] = value;
              }
            }
            await putLead(updated);
            results.push(`Updated lead: ${match.name}`);
          } else {
            results.push(`Could not find lead "${action.name}"`);
          }
        } else if (action.type === "add_lead") {
          const newLead: Lead = {
            id: uuid(),
            name: String(action.fields.name || "New Lead"),
            status: (String(action.fields.status || "new")) as Lead["status"],
            followUpDate: String(action.fields.followUpDate || ""),
            notes: String(action.fields.notes || ""),
            source: (String(action.fields.source || "")) as Lead["source"],
            email: String(action.fields.email || ""),
            phone: String(action.fields.phone || ""),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedAt: "",
          };
          await putLead(newLead);
          results.push(`Added lead: ${newLead.name}`);
        }
      } catch (err) {
        console.error("Action failed:", err);
        results.push(`Failed to execute: ${action.type}`);
      }
    }

    return results;
  }

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;
    if (loading) return;

    const userMsg: Message = {
      role: "user",
      content: text || `[Uploaded file: ${uploadedFile?.name}]`,
      file: uploadedFile || undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setUploadedFile(null);
    setLoading(true);

    try {
      const [clients, leads] = await Promise.all([
        getAllClients(),
        getAllLeads(),
      ]);

      const apiMessages = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => {
          let content = m.content;
          if (m.file) {
            content += `\n\n[UPLOADED FILE: ${m.file.name}]\n${m.file.text}`;
          }
          return { role: m.role, content };
        });

      const chatMessages = apiMessages.slice(1);

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          context: {
            clients: clients.map((c) => ({
              id: c.id,
              name: c.name,
              phase: c.phase,
              status: c.status,
              tendencyType: c.tendencyType,
              startingWeight: c.startingWeight,
              currentWeight: c.currentWeight,
              totalLost: c.totalLost,
              lastCheckInDate: c.lastCheckInDate,
              startDate: c.startDate,
              notes: c.notes,
            })),
            leads: leads.map((l) => ({
              id: l.id,
              name: l.name,
              status: l.status,
              source: l.source,
              followUpDate: l.followUpDate,
              notes: l.notes,
              email: l.email,
              phone: l.phone,
            })),
          },
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
      } else {
        let responseText = data.response;

        // Execute any actions the AI returned
        if (data.actions && data.actions.length > 0) {
          const results = await executeActions(data.actions);
          if (results.length > 0) {
            responseText += "\n\n✅ " + results.join("\n✅ ");
          }
        }

        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: responseText,
            actions: data.actions,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Check your connection and try again.",
        },
      ]);
    }

    setLoading(false);
  }, [input, uploadedFile, messages, loading]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file);
    });

    setUploadedFile({ name: file.name, text: text.slice(0, 50000) });
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">
          <span className="text-riven-gold">Chat</span>
        </h1>
        <span className="text-xs text-riven-muted bg-white/5 px-2 py-0.5 rounded">
          AI Assistant
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-riven-gold text-black rounded-br-md"
                  : "bg-riven-card border border-riven-border text-white rounded-bl-md"
              }`}
            >
              {msg.file && (
                <div
                  className={`text-xs mb-1 flex items-center gap-1 ${
                    msg.role === "user" ? "text-black/60" : "text-riven-muted"
                  }`}
                >
                  📎 {msg.file.name}
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-riven-card border border-riven-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-riven-gold rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-riven-gold rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-2 h-2 bg-riven-gold rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {uploadedFile && (
        <div className="flex items-center gap-2 mb-2 bg-riven-card border border-riven-border rounded-lg px-3 py-2 text-sm animate-fade-in">
          <span>📎</span>
          <span className="text-white flex-1 truncate">
            {uploadedFile.name}
          </span>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-riven-muted hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-riven-card border border-riven-border rounded-xl p-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,.pdf,.json,.md"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2 text-riven-muted hover:text-riven-gold transition-colors flex-shrink-0"
          title="Upload file"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your clients, leads, or upload a file..."
          rows={1}
          className="flex-1 bg-transparent text-white text-sm placeholder-riven-muted outline-none resize-none max-h-[150px]"
        />

        <button
          onClick={sendMessage}
          disabled={loading || (!input.trim() && !uploadedFile)}
          className="p-2 rounded-lg bg-riven-gold text-black flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-riven-gold-light transition-colors"
          title="Send"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
