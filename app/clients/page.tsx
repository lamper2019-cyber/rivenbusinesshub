"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { Client, TendencyType } from "@/lib/types";
import { getAllClients, putClient } from "@/lib/db";
import ClientCard from "@/components/ClientCard";

const emptyClient = (): Client => ({
  id: uuid(),
  name: "",
  phase: 1,
  startDate: new Date().toISOString().split("T")[0],
  startingWeight: 0,
  currentWeight: 0,
  totalLost: 0,
  tendencyType: "",
  lastCheckInDate: "",
  status: "active",
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  syncedAt: "",
});

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Client>(emptyClient());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getAllClients();
    setClients(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = clients.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    form.currentWeight = form.currentWeight || form.startingWeight;
    form.totalLost = form.startingWeight - form.currentWeight;
    await putClient(form);
    setForm(emptyClient());
    setShowAdd(false);
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-riven-muted">Loading clients...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">
          <span className="text-riven-gold">Clients</span>{" "}
          <span className="text-riven-muted text-base font-normal">
            ({filtered.length})
          </span>
        </h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-riven-gold text-black text-sm font-semibold rounded-lg hover:bg-riven-gold-light transition-colors"
        >
          {showAdd ? "Cancel" : "+ Add Client"}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="bg-riven-card border border-riven-border rounded-xl p-4 mb-6 animate-slide-up"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white placeholder-riven-muted focus:border-riven-gold outline-none"
              required
            />
            <select
              value={form.phase}
              onChange={(e) =>
                setForm({ ...form, phase: Number(e.target.value) as 1 | 2 | 3 })
              }
              className="bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none"
            >
              <option value={1}>Phase 1</option>
              <option value={2}>Phase 2</option>
              <option value={3}>Phase 3</option>
            </select>
            <input
              type="number"
              placeholder="Starting Weight"
              value={form.startingWeight || ""}
              onChange={(e) =>
                setForm({ ...form, startingWeight: Number(e.target.value) })
              }
              className="bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white placeholder-riven-muted focus:border-riven-gold outline-none"
            />
            <input
              type="number"
              placeholder="Current Weight"
              value={form.currentWeight || ""}
              onChange={(e) =>
                setForm({ ...form, currentWeight: Number(e.target.value) })
              }
              className="bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white placeholder-riven-muted focus:border-riven-gold outline-none"
            />
            <select
              value={form.tendencyType}
              onChange={(e) =>
                setForm({
                  ...form,
                  tendencyType: e.target.value as TendencyType | "",
                })
              }
              className="bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none"
            >
              <option value="">Tendency Type</option>
              <option value="Obliger">Obliger</option>
              <option value="Upholder">Upholder</option>
              <option value="Questioner">Questioner</option>
              <option value="Rebel">Rebel</option>
            </select>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="bg-riven-bg border border-riven-border rounded-lg px-3 py-2 text-sm text-white focus:border-riven-gold outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-3 px-6 py-2 bg-riven-gold text-black text-sm font-semibold rounded-lg hover:bg-riven-gold-light transition-colors"
          >
            Save Client
          </button>
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-riven-card border border-riven-border rounded-lg px-3 py-2 text-sm text-white placeholder-riven-muted focus:border-riven-gold outline-none"
        />
        <div className="flex gap-1">
          {["all", "active", "paused", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-colors ${
                filter === s
                  ? "bg-riven-gold text-black font-semibold"
                  : "bg-riven-card text-riven-muted border border-riven-border hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-riven-muted">
          <p className="text-lg mb-2">No clients yet</p>
          <p className="text-sm">
            Add your first client or use the mic button to say &quot;Add a
            client named...&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
