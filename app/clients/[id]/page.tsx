"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Client, FinalSixNos, FINAL_SIX_NOS_LABELS } from "@/lib/types";
import { FINAL_SIX_NOS_LABELS as NOS_LABELS } from "@/lib/types";
import { getClient, putClient, deleteClient } from "@/lib/db";
import { getCoachInsight, formatWeighInDate } from "@/lib/tips";

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Client | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  const load = useCallback(async () => {
    const c = await getClient(id);
    if (c) {
      setClient(c);
      setForm(c);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const target = client ? (client.targetWeight || client.startingWeight * 0.9) : 0;
  const weightToLose = client ? client.startingWeight - target : 0;
  const lostSoFar = client ? client.startingWeight - client.currentWeight : 0;
  const remaining = client ? Math.max(0, Math.round((client.currentWeight - target) * 10) / 10) : 0;
  const journeyPct =
    weightToLose > 0
      ? Math.max(0, Math.min(100, Math.round((lostSoFar / weightToLose) * 100)))
      : 0;

  // Status badge
  function getStatusBadge() {
    if (!client) return { label: "", color: "" };
    if (client.status === "paused") return { label: "PAUSED", color: "bg-yellow-500/20 text-yellow-400" };
    if (client.status === "completed") return { label: "COMPLETED", color: "bg-gray-500/20 text-gray-400" };
    if (journeyPct >= 50) return { label: "ON TRACK", color: "bg-green-500/20 text-green-400" };
    return { label: "NEEDS ATTENTION", color: "bg-orange-500/20 text-orange-400" };
  }
  const badge = getStatusBadge();

  async function handleSave() {
    if (!form) return;
    form.totalLost = Math.round((form.startingWeight - form.currentWeight) * 10) / 10;
    if (!form.targetWeight) {
      form.targetWeight = Math.round(form.startingWeight * 0.9 * 10) / 10;
    }
    await putClient(form);
    setClient(form);
    setEditing(false);
  }

  async function handleUpdateWeight() {
    if (!client || !newWeight) return;
    const weight = Number(newWeight);
    if (isNaN(weight) || weight <= 0) return;

    const today = new Date().toISOString().split("T")[0];
    const updated: Client = {
      ...client,
      currentWeight: weight,
      lastWeighInDate: today,
      totalLost: Math.round((client.startingWeight - weight) * 10) / 10,
      weighIns: [...(client.weighIns || []), { date: today, weight }],
    };
    await putClient(updated);
    setClient(updated);
    setForm(updated);
    setNewWeight("");
    setShowWeightModal(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    await deleteClient(id);
    router.push("/clients");
  }

  // Recent weigh-in history (last 3)
  const recentWeighIns = client?.weighIns
    ? [...client.weighIns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
    : [];

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-riven-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push("/clients")}
        className="text-riven-muted hover:text-white text-sm mb-6 flex items-center gap-1 group"
      >
        <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">
          arrow_back
        </span>
        Back to Roster
      </button>

      {/* Client Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white mb-1">
            {client.name}
          </h1>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-xs text-riven-muted">
              Phase {client.phase}
              {client.tendencyType && ` \u00b7 ${client.tendencyType}`}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="px-3 py-1.5 text-xs bg-white/5 rounded-lg text-riven-muted hover:text-white transition-colors"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-xs bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Core Weight Goal Hero Card */}
      <div className="bg-riven-card rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-riven-gold/5 rounded-full blur-3xl -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-riven-muted uppercase tracking-wider mb-1">Core Weight Goal</p>
              <p className="text-xl font-headline font-bold text-white">
                Lose{" "}
                <span className="text-riven-gold">
                  {Math.round((client.startingWeight - target) * 10) / 10} lbs
                </span>
              </p>
              <p className="text-sm text-riven-muted mt-1">
                {remaining > 0
                  ? `${remaining} lbs remaining to target`
                  : "Goal reached!"}
              </p>
            </div>
            <button
              onClick={() => setShowWeightModal(true)}
              className="px-4 py-2 bg-riven-gold text-black text-sm font-semibold rounded-xl hover:bg-riven-gold-light transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">scale</span>
              Update Weight
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-riven-muted">{client.startingWeight} lbs start</span>
            <span className="text-riven-gold font-semibold">{journeyPct}%</span>
            <span className="text-riven-muted">{Math.round(target * 10) / 10} lbs target</span>
          </div>
          <div className="w-full h-3 bg-riven-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gold-gradient transition-all duration-500"
              style={{ width: `${journeyPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weight Update Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-riven-card rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-headline font-bold text-white text-lg mb-4">Update Weight</h3>
            <input
              type="number"
              step="0.1"
              placeholder="New weight (lbs)"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-full bg-riven-bg rounded-xl px-4 py-3 text-white text-lg text-center placeholder-riven-muted focus:ring-1 focus:ring-riven-gold outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleUpdateWeight}
                className="flex-1 py-2.5 bg-riven-gold text-black font-semibold rounded-xl hover:bg-riven-gold-light transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setShowWeightModal(false); setNewWeight(""); }}
                className="flex-1 py-2.5 bg-white/5 text-riven-muted rounded-xl hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent History */}
      {recentWeighIns.length > 0 && (
        <div className="bg-riven-card rounded-2xl p-5 mb-6">
          <h3 className="font-headline font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-riven-gold text-lg">history</span>
            Recent History
          </h3>
          <div className="space-y-3">
            {recentWeighIns.map((wi, i) => {
              const prev = recentWeighIns[i + 1];
              const change = prev ? Math.round((wi.weight - prev.weight) * 10) / 10 : 0;
              return (
                <div
                  key={wi.date + wi.weight}
                  className="flex items-center justify-between bg-riven-bg rounded-xl px-4 py-3"
                >
                  <span className="text-sm text-riven-muted">
                    {formatWeighInDate(wi.date)}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {wi.weight} lbs
                  </span>
                  {change !== 0 && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        change < 0
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {change > 0 ? "+" : ""}
                      {change} lbs
                    </span>
                  )}
                  {change === 0 && i < recentWeighIns.length - 1 && (
                    <span className="text-xs text-riven-muted px-2 py-0.5 rounded-full bg-white/5">
                      no change
                    </span>
                  )}
                  {i === recentWeighIns.length - 1 && (
                    <span className="text-xs text-riven-muted px-2 py-0.5 rounded-full bg-white/5">
                      start
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Steps Tracker */}
      <div className="bg-riven-card rounded-2xl p-5 mb-6">
        <h3 className="font-headline font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-riven-gold text-lg">directions_walk</span>
          Daily Steps
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={client.steps || ""}
            onChange={async (e) => {
              const steps = Number(e.target.value) || 0;
              const updated = { ...client, steps };
              await putClient(updated);
              setClient(updated);
              setForm(updated);
            }}
            placeholder="0"
            className="w-32 bg-riven-bg rounded-xl px-4 py-3 text-2xl font-headline font-bold text-white text-center placeholder-riven-muted/40 focus:ring-1 focus:ring-riven-gold outline-none"
          />
          <span className="text-sm text-riven-muted">steps today</span>
        </div>
        {client.steps > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-riven-muted mb-1">
              <span>Progress to 10,000</span>
              <span className="text-riven-gold font-semibold">
                {Math.min(100, Math.round((client.steps / 10000) * 100))}%
              </span>
            </div>
            <div className="w-full h-2 bg-riven-bg rounded-full overflow-hidden">
              <div
                className="h-full rounded-full gold-gradient transition-all duration-500"
                style={{ width: `${Math.min(100, (client.steps / 10000) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* The Final 6 NOs */}
      <div className="bg-riven-card rounded-2xl p-5 mb-6">
        <h3 className="font-headline font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-riven-gold text-lg">block</span>
          The Final 6 NOs
        </h3>
        <div className="space-y-2">
          {(Object.keys(NOS_LABELS) as Array<keyof FinalSixNos>).map((key) => {
            const checked = client.finalSixNos?.[key] ?? false;
            return (
              <label
                key={key}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  checked
                    ? "bg-green-500/10"
                    : "bg-riven-bg hover:bg-riven-surface"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={async () => {
                    const updatedNos = {
                      ...(client.finalSixNos || {
                        noSugaryDrinks: false,
                        noFriedFoods: false,
                        noFastFood: false,
                        noProcessedCarbs: false,
                        noCandyBetweenMeals: false,
                        noAlcoholMonThu: false,
                      }),
                      [key]: !checked,
                    };
                    const updated = { ...client, finalSixNos: updatedNos };
                    await putClient(updated);
                    setClient(updated);
                    setForm(updated);
                  }}
                  className="mt-0.5 w-5 h-5 rounded border-2 border-riven-border bg-transparent checked:bg-riven-gold checked:border-riven-gold text-black focus:ring-riven-gold focus:ring-offset-0 cursor-pointer flex-shrink-0"
                />
                <span
                  className={`text-sm leading-snug ${
                    checked ? "text-green-400 line-through" : "text-white"
                  }`}
                >
                  {NOS_LABELS[key]}
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-riven-muted">
            {Object.values(client.finalSixNos || {}).filter(Boolean).length}/6 completed
          </span>
          <div className="flex-1 h-1.5 bg-riven-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gold-gradient transition-all duration-300"
              style={{
                width: `${(Object.values(client.finalSixNos || {}).filter(Boolean).length / 6) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Coach Insight */}
      {client.tendencyType && (
        <div className="bg-riven-card rounded-2xl p-5 mb-6">
          <h3 className="font-headline font-semibold text-white text-sm mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-riven-gold text-lg">psychology</span>
            Coach Insight
          </h3>
          <p className="text-sm text-riven-muted leading-relaxed">
            <span className="text-riven-gold font-medium">{client.tendencyType}:</span>{" "}
            {getCoachInsight(client.tendencyType as "Obliger" | "Upholder" | "Questioner" | "Rebel")}
          </p>
        </div>
      )}

      {/* Edit Form / Details */}
      <div className="bg-riven-card rounded-2xl p-5">
        <h3 className="font-headline font-semibold text-white text-sm mb-4">
          {editing ? "Edit Client Details" : "Client Details"}
        </h3>
        {editing && form ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-riven-muted block mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">Phase</label>
              <select
                value={form.phase}
                onChange={(e) =>
                  setForm({ ...form, phase: Number(e.target.value) as 1 | 2 | 3 })
                }
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
              >
                <option value={1}>Phase 1</option>
                <option value={2}>Phase 2</option>
                <option value={3}>Phase 3</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">Starting Weight</label>
              <input
                type="number"
                step="0.1"
                value={form.startingWeight || ""}
                onChange={(e) =>
                  setForm({ ...form, startingWeight: Number(e.target.value) })
                }
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">Current Weight</label>
              <input
                type="number"
                step="0.1"
                value={form.currentWeight || ""}
                onChange={(e) =>
                  setForm({ ...form, currentWeight: Number(e.target.value) })
                }
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">Target Weight</label>
              <input
                type="number"
                step="0.1"
                value={form.targetWeight || ""}
                onChange={(e) =>
                  setForm({ ...form, targetWeight: Number(e.target.value) })
                }
                placeholder={`Default: ${Math.round(form.startingWeight * 0.9 * 10) / 10}`}
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white placeholder-riven-muted/50 focus:ring-1 focus:ring-riven-gold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">Tendency Type</label>
              <select
                value={form.tendencyType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tendencyType: e.target.value as Client["tendencyType"],
                  })
                }
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
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
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-riven-muted block mb-1">Last Weigh-in Date</label>
              <input
                type="date"
                value={form.lastWeighInDate}
                onChange={(e) =>
                  setForm({ ...form, lastWeighInDate: e.target.value })
                }
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-riven-muted block mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none resize-none"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-riven-gold text-black text-sm font-semibold rounded-xl hover:bg-riven-gold-light transition-colors"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-riven-muted">Start Date</p>
              <p className="text-sm text-white">
                {client.startDate
                  ? new Date(client.startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "\u2014"}
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Starting Weight</p>
              <p className="text-sm text-white">
                {client.startingWeight ? `${client.startingWeight} lbs` : "\u2014"}
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Current Weight</p>
              <p className="text-sm text-white">
                {client.currentWeight ? `${client.currentWeight} lbs` : "\u2014"}
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Target Weight</p>
              <p className="text-sm text-white">
                {Math.round(target * 10) / 10} lbs
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Total Lost</p>
              <p className="text-sm text-riven-gold font-semibold">
                {client.totalLost > 0
                  ? `${client.totalLost} lbs`
                  : "\u2014"}
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Last Weigh-in</p>
              <p className="text-sm text-white">
                {formatWeighInDate(client.lastWeighInDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Tendency Type</p>
              <p className="text-sm text-white">
                {client.tendencyType || "\u2014"}
              </p>
            </div>
            <div>
              <p className="text-xs text-riven-muted">Status</p>
              <p className="text-sm text-white capitalize">{client.status}</p>
            </div>
            {client.notes && (
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs text-riven-muted">Notes</p>
                <p className="text-sm text-white whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
