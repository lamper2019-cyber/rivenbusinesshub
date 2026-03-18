"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getAllClients, getAllLeads } from "@/lib/db";

interface Message {
  role: "user" | "assistant";
  content: string;
  file?: { name: string; text: string };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm your RIVEN assistant. I can see all your clients and leads. Ask me anything — who needs a check-in, coaching tips, lead follow-ups, or upload a file and I'll help you make sense of it.",
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

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
      // Gather CRM data context
      const [clients, leads] = await Promise.all([
        getAllClients(),
        getAllLeads(),
      ]);

      // Build chat history for API (exclude file metadata, include file text inline)
      const apiMessages = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => {
          let content = m.content;
          if (m.file) {
            content += `\n\n[UPLOADED FILE: ${m.file.name}]\n${m.file.text}`;
          }
          return { role: m.role, content };
        });

      // Remove the initial greeting from API messages
      const chatMessages = apiMessages.slice(1);

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          context: {
            clients: clients.map((c) => ({
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
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Check your connection and try again.",
        },
      ]);
    }

    setLoading(false);
  }, [input, uploadedFile, messages, loading]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as text
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file);
    });

    setUploadedFile({ name: file.name, text: text.slice(0, 50000) }); // Cap at 50k chars
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
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">
          <span className="text-riven-gold">Chat</span>
        </h1>
        <span className="text-xs text-riven-muted bg-white/5 px-2 py-0.5 rounded">
          AI Assistant
        </span>
      </div>

      {/* Messages */}
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
                    msg.role === "user"
                      ? "text-black/60"
                      : "text-riven-muted"
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

      {/* File preview */}
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

      {/* Input area */}
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
