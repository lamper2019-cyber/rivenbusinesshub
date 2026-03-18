"use client";

import { useState, useCallback, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { isVoiceSupported, startListening, stopListening } from "@/lib/voice";
import { getAllClients, getAllLeads, putClient, putLead, putCheckIn } from "@/lib/db";
import type { Client, Lead, CheckIn } from "@/lib/types";
import VoiceOverlay from "./VoiceOverlay";

type VoiceState = "idle" | "listening" | "processing" | "response";

export default function VoiceButton() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [actionData, setActionData] = useState<{
    intent: string;
    entities: Record<string, string>;
  } | null>(null);
  const [supported, setSupported] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSupported(isVoiceSupported());
  }, []);

  const handleListen = useCallback(() => {
    setTranscript("");
    setResponse("");
    setActionData(null);
    setState("listening");

    startListening(
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          setState("processing");
          processTranscript(text);
        }
      },
      (error) => {
        setResponse(error);
        setState("response");
      }
    );
  }, []);

  async function processTranscript(text: string) {
    try {
      const [clients, leads] = await Promise.all([
        getAllClients(),
        getAllLeads(),
      ]);

      const context = {
        clients: clients.map((c) => ({
          name: c.name,
          tendencyType: c.tendencyType,
          lastCheckInDate: c.lastCheckInDate,
          status: c.status,
        })),
        leads: leads.map((l) => ({
          name: l.name,
          status: l.status,
          followUpDate: l.followUpDate,
        })),
      };

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, context }),
      });

      const data = await res.json();

      if (data.error) {
        setResponse(`Error: ${data.error}`);
        setState("response");
        return;
      }

      setResponse(data.response);

      if (
        data.intent === "add_client" ||
        data.intent === "add_lead" ||
        data.intent === "log_checkin"
      ) {
        setActionData({ intent: data.intent, entities: data.entities });
      }

      setState("response");
    } catch (err) {
      setResponse("Failed to process. Check your connection.");
      setState("response");
      console.error(err);
    }
  }

  async function handleConfirmAction() {
    if (!actionData) return;

    try {
      if (actionData.intent === "add_client") {
        const client: Client = {
          id: uuid(),
          name: actionData.entities.name || "New Client",
          phase: (parseInt(actionData.entities.phase) || 1) as 1 | 2 | 3,
          startDate: new Date().toISOString().split("T")[0],
          startingWeight: parseFloat(actionData.entities.startingWeight) || 0,
          currentWeight: parseFloat(actionData.entities.startingWeight) || 0,
          totalLost: 0,
          tendencyType: (actionData.entities.tendencyType as Client["tendencyType"]) || "",
          lastCheckInDate: "",
          status: "active",
          notes: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncedAt: "",
        };
        await putClient(client);
        setResponse(`Added client: ${client.name}`);
      } else if (actionData.intent === "add_lead") {
        const lead: Lead = {
          id: uuid(),
          name: actionData.entities.name || "New Lead",
          status: "new",
          followUpDate: "",
          notes: actionData.entities.notes || "",
          source: (actionData.entities.source as Lead["source"]) || "",
          email: "",
          phone: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncedAt: "",
        };
        await putLead(lead);
        setResponse(`Added lead: ${lead.name}`);
      } else if (actionData.intent === "log_checkin") {
        const clients = await getAllClients();
        const clientName = (actionData.entities.clientName || "").toLowerCase();
        const match = clients.find((c) =>
          c.name.toLowerCase().includes(clientName)
        );
        if (match) {
          const checkin: CheckIn = {
            id: uuid(),
            clientId: match.id,
            clientName: match.name,
            date: new Date().toISOString().split("T")[0],
            currentWeight: parseFloat(actionData.entities.currentWeight) || match.currentWeight,
            feeling: parseInt(actionData.entities.feeling) || 5,
            biggestWin: actionData.entities.notes || "",
            biggestStruggle: "",
            hitProteinDaily: true,
            stepDays: 0,
            notes: actionData.entities.notes || "",
            createdAt: new Date().toISOString(),
            syncedAt: "",
          };
          await putCheckIn(checkin);
          setResponse(`Logged check-in for ${match.name}`);
        } else {
          setResponse(`Couldn't find a client matching "${actionData.entities.clientName}"`);
        }
      }

      setActionData(null);
      setRefreshKey((k) => k + 1);
      // Trigger a page refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent("riven-data-changed"));
    } catch (err) {
      setResponse("Failed to save. Try again.");
      console.error(err);
    }
  }

  function handleClose() {
    stopListening();
    setState("idle");
    setTranscript("");
    setResponse("");
    setActionData(null);
  }

  if (!supported) return null;

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={handleListen}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 bg-riven-gold rounded-full flex items-center justify-center shadow-lg hover:bg-riven-gold-light transition-all active:scale-95 animate-pulse-gold"
        title="Voice command"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-black"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </button>

      {/* Voice overlay */}
      {state !== "idle" && (
        <VoiceOverlay
          key={refreshKey}
          state={state}
          transcript={transcript}
          response={response}
          hasAction={!!actionData}
          onConfirm={handleConfirmAction}
          onClose={handleClose}
        />
      )}
    </>
  );
}
