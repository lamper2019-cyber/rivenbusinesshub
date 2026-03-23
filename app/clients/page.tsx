"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { Client } from "@/lib/types";
import { getAllClients, putClient, seedIfEmpty } from "@/lib/db";
import ClientCard from "@/components/ClientCard";
import Link from "next/link";

const emptyClient = (): Client => ({
  id: uuid(),
  name: "",
  phase: 1,
  startDate: new Date().toISOString().split("T")[0],
  startingWeight: 0,
  currentWeight: 0,
  targetWeight: 0,
  totalLost: 0,
  tendencyType: "",
  lastWeighInDate: "",
  weighIns: [],
  steps: 0,
  finalSixNos: { noSugaryDrinks: false, noFriedFoods: false, noFastFood: false, noProcessedCarbs: false, noCandyBetweenMeals: false, noAlcoholMonThu: false },
  phaseChecklist: { p1_protein40g: false, p1_steps7000: false, p1_eatWhatYouWant: false, p2_steps9000: false, p2_first3Nos: false, p2_glucomannan: false, p3_steps11000: false, p3_all6Nos: false },
  status: "active",
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Client>(emptyClient());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    await seedIfEmpty();
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
    form.targetWeight = form.targetWeight || Math.round(form.startingWeight * 0.9 * 10) / 10;
    form.totalLost = form.startingWeight - form.currentWeight;
    if (form.startingWeight && !form.lastWeighInDate) {
      form.lastWeighInDate = new Date().toISOString().split("T")[0];
      form.weighIns = [{ date: form.lastWeighInDate, weight: form.currentWeight }];
    }
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
        <h1 className="text-2xl font-headline font-bold">
          <span className="text-riven-gold">Client Roster</span>{" "}
          <span className="text-riven-muted text-base font-normal">
            ({filtered.length})
          </span>
        </h1>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-riven-muted text-lg">
            search
          </span>
          <input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-riven-card rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-riven-muted focus:ring-1 focus:ring-riven-gold outline-none"
          />
        </div>
        <div className="flex gap-1">
          {["all", "active", "paused", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs rounded-xl capitalize transition-colors ${
                filter === s
                  ? "bg-riven-gold text-black font-semibold"
                  : "bg-riven-card text-riven-muted hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Add Client Form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="bg-riven-card rounded-2xl p-5 mb-6 animate-slide-up"
        >
          <h3 className="font-headline font-semibold text-white mb-4">Enroll New Client</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white placeholder-riven-muted focus:ring-1 focus:ring-riven-gold outline-none"
              required
            />
            <select
              value={form.phase}
              onChange={(e) =>
                setForm({ ...form, phase: Number(e.target.value) as 1 | 2 | 3 })
              }
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
            >
              <option value={1}>Phase 1</option>
              <option value={2}>Phase 2</option>
              <option value={3}>Phase 3</option>
            </select>
            <input
              type="number"
              step="0.1"
              placeholder="Starting Weight (lbs)"
              value={form.startingWeight || ""}
              onChange={(e) =>
                setForm({ ...form, startingWeight: Number(e.target.value) })
              }
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white placeholder-riven-muted focus:ring-1 focus:ring-riven-gold outline-none"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Current Weight (lbs)"
              value={form.currentWeight || ""}
              onChange={(e) =>
                setForm({ ...form, currentWeight: Number(e.target.value) })
              }
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white placeholder-riven-muted focus:ring-1 focus:ring-riven-gold outline-none"
            />
            <select
              value={form.tendencyType}
              onChange={(e) =>
                setForm({
                  ...form,
                  tendencyType: e.target.value as Client["tendencyType"],
                })
              }
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
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
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-riven-gold text-black text-sm font-semibold rounded-xl hover:bg-riven-gold-light transition-colors"
            >
              Save Client
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setForm(emptyClient()); }}
              className="px-6 py-2.5 bg-white/5 text-riven-muted text-sm rounded-xl hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}

        {/* Enroll New Client Card */}
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-2xl border-2 border-dashed border-riven-border-light p-5 flex flex-col items-center justify-center gap-3 min-h-[280px] hover:border-riven-gold/40 hover:bg-riven-gold/5 transition-all group cursor-pointer"
        >
          <span className="material-symbols-outlined text-4xl text-riven-muted group-hover:text-riven-gold transition-colors">
            person_add
          </span>
          <span className="text-sm font-medium text-riven-muted group-hover:text-riven-gold transition-colors">
            Enroll New Client
          </span>
        </button>
      </div>

      {filtered.length === 0 && !showAdd && (
        <div className="text-center py-16 text-riven-muted">
          <span className="material-symbols-outlined text-5xl mb-3 block">group</span>
          <p className="text-lg mb-2 font-headline">No clients found</p>
          <p className="text-sm">Try a different search or add your first client.</p>
        </div>
      )}
    </div>
  );
}
