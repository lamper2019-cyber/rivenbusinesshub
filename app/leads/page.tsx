"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import type { Lead } from "@/lib/types";
import { getAllLeads, putLead, deleteLead } from "@/lib/db";
import LeadCard from "@/components/LeadCard";

const emptyLead = (): Lead => ({
  id: uuid(),
  name: "",
  status: "new",
  followUpDate: "",
  notes: "",
  source: "",
  email: "",
  phone: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<Lead>(emptyLead());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getAllLeads();
    setLeads(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = leads.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    return true;
  });

  function openEdit(lead: Lead) {
    setEditingLead(lead);
    setForm({ ...lead });
    setShowAdd(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await putLead(form);
    setForm(emptyLead());
    setShowAdd(false);
    setEditingLead(null);
    await load();
  }

  async function handleDeleteLead() {
    if (!editingLead) return;
    if (!confirm("Delete this lead?")) return;
    await deleteLead(editingLead.id);
    setEditingLead(null);
    setShowAdd(false);
    setForm(emptyLead());
    await load();
  }

  function handleCancel() {
    setShowAdd(false);
    setEditingLead(null);
    setForm(emptyLead());
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-riven-muted">Loading leads...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-headline font-bold">
          <span className="text-riven-gold">Leads</span>{" "}
          <span className="text-riven-muted text-base font-normal">
            ({filtered.length})
          </span>
        </h1>
        <button
          onClick={() => {
            if (showAdd) {
              handleCancel();
            } else {
              setForm(emptyLead());
              setEditingLead(null);
              setShowAdd(true);
            }
          }}
          className="px-4 py-2 bg-riven-gold text-black text-sm font-semibold rounded-xl hover:bg-riven-gold-light transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">
            {showAdd ? "close" : "add"}
          </span>
          {showAdd ? "Cancel" : "Add Lead"}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleSave}
          className="bg-riven-card rounded-2xl p-5 mb-6 animate-slide-up"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-semibold text-white">
              {editingLead ? "Edit Lead" : "New Lead"}
            </h3>
            {editingLead && (
              <button
                type="button"
                onClick={handleDeleteLead}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white placeholder-riven-muted focus:ring-1 focus:ring-riven-gold outline-none"
              required
            />
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as Lead["status"] })
              }
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="follow-up">Follow-up</option>
              <option value="closed">Closed</option>
              <option value="lost">Lost</option>
            </select>
            <select
              value={form.source}
              onChange={(e) =>
                setForm({ ...form, source: e.target.value as Lead["source"] })
              }
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
            >
              <option value="">Source</option>
              <option value="referral">Referral</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white placeholder-riven-muted focus:ring-1 focus:ring-riven-gold outline-none"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white placeholder-riven-muted focus:ring-1 focus:ring-riven-gold outline-none"
            />
            <input
              type="date"
              placeholder="Follow-up Date"
              value={form.followUpDate}
              onChange={(e) =>
                setForm({ ...form, followUpDate: e.target.value })
              }
              className="bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-riven-gold outline-none"
            />
            <div className="sm:col-span-2 lg:col-span-3">
              <textarea
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full bg-riven-bg rounded-xl px-3 py-2.5 text-sm text-white placeholder-riven-muted focus:ring-1 focus:ring-riven-gold outline-none resize-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2.5 bg-riven-gold text-black text-sm font-semibold rounded-xl hover:bg-riven-gold-light transition-colors"
          >
            {editingLead ? "Update Lead" : "Save Lead"}
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-1 mb-6">
        {["all", "new", "contacted", "interested", "follow-up", "closed", "lost"].map(
          (s) => (
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
          )
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-riven-muted">
          <span className="material-symbols-outlined text-5xl mb-3 block">target</span>
          <p className="text-lg mb-2 font-headline">No leads yet</p>
          <p className="text-sm">Add your first lead to start tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onEdit={openEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
