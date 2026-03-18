"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Client, CheckIn, TendencyType } from "@/lib/types";
import { getClient, putClient, deleteClient, getCheckInsForClient } from "@/lib/db";
import SmartTip from "@/components/SmartTip";
import CheckInTimeline from "@/components/CheckInTimeline";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Client | null>(null);
  const [tab, setTab] = useState<"history" | "files">("history");

  const load = useCallback(async () => {
    const c = await getClient(id);
    if (c) {
      setClient(c);
      setForm(c);
      const ci = await getCheckInsForClient(id);
      setCheckins(ci);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!form) return;
    form.totalLost = form.startingWeight - form.currentWeight;
    await putClient(form);
    setClient(form);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    await deleteClient(id);
    router.push("/clients");
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-riven-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/clients")}
        className="text-riven-muted hover:text-white text-sm mb-4 flex items-center gap-1"
      >
        ← Back to Clients
      </button>

      <SmartTip
        tendencyType={client.tendencyType}
        lastCheckInDate={client.lastCheckInDate}
        clientName={client.name}
      />

      <div className="bg-riven-card border border-riven-border rounded-xl p-6 mt-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <p className="text-sm text-riven-muted capitalize">
              {client.status} · Phase {client.phase}
              {client.tendencyType && ` · ${client.tendencyType}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 text-xs bg-white/5 border border-riven-border rounded-lg text-riven-muted hover:text-white transition-colors"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {editing && form ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-riven-muted block mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">Phase</label>
              <select
                value={form.phase}
                onChange={(e) =>
                  setForm({ ...form, phase: Number(e.target.value) as 1 | 2 | 3 })
                }
                className="w-full bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none"
              >
                <option value={1}>Phase 1</option>
                <option value={2}>Phase 2</option>
                <option value={3}>Phase 3</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">
                Starting Weight
              </label>
              <input
                type="number"
                value={form.startingWeight || ""}
                onChange={(e) =>
                  setForm({ ...form, startingWeight: Number(e.target.value) })
                }
                className="w-full bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">
                Current Weight
              </label>
              <input
                type="number"
                value={form.currentWeight || ""}
                onChange={(e) =>
                  setForm({ ...form, currentWeight: Number(e.target.value) })
                }
                className="w-full bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">
                Tendency Type
              </label>
              <select
                value={form.tendencyType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tendencyType: e.target.value as TendencyType | "",
                  })
                }
                className="w-full bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none"
              >
                <option value="">None</option>
                <option value="Obliger">Obliger</option>
                <option value="Upholder">Upholder</option>
                <option value="Questioner">Questioner</option>
                <option value="Rebel">Rebel</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as Client["status"],
                  })
                }
                className="w-full bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-riven-muted block mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none resize-none"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-riven-gold text-black text-sm font-semibold rounded-lg hover:bg-riven-gold-light transition-colors"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-riven-muted">Start Date</p>
              <p className="text-sm text-white">
                {client.startDate
                  ? new Date(client.startDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Starting Weight</p>
              <p className="text-sm text-white">
                {client.startingWeight ? `${client.startingWeight} lbs` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Current Weight</p>
              <p className="text-sm text-white">
                {client.currentWeight ? `${client.currentWeight} lbs` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Total Lost</p>
              <p className="text-sm text-riven-gold font-semibold">
                {client.totalLost > 0
                  ? `${client.totalLost.toFixed(1)} lbs`
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs for history and files */}
      <div className="flex gap-1 mt-6 mb-4">
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === "history"
              ? "bg-riven-gold text-black font-semibold"
              : "bg-riven-card text-riven-muted border border-riven-border hover:text-white"
          }`}
        >
          Check-in History ({checkins.length})
        </button>
        <button
          onClick={() => setTab("files")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === "files"
              ? "bg-riven-gold text-black font-semibold"
              : "bg-riven-card text-riven-muted border border-riven-border hover:text-white"
          }`}
        >
          Files
        </button>
      </div>

      {tab === "history" && (
        <div>
          {checkins.length === 0 ? (
            <p className="text-center py-8 text-riven-muted text-sm">
              No check-ins yet for {client.name}
            </p>
          ) : (
            <div className="ml-2">
              {checkins.map((ci) => (
                <CheckInTimeline key={ci.id} checkin={ci} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "files" && (
        <div>
          <FileUpload clientId={id} onUpload={load} />
          <FileList clientId={id} />
        </div>
      )}
    </div>
  );
}
