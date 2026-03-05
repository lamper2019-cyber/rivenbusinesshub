"use client";

import { useState, useEffect, useCallback } from "react";

interface Lead {
  _row: string;
  [key: string]: string;
}

const COLUMNS = [
  "Name",
  "Email",
  "Phone",
  "Date",
  "Source",
  "Lead Score",
  "Call Scheduled",
  "Call Date",
  "Call Outcome",
  "Follow-up Date",
  "Notes",
];

const OUTCOME_OPTIONS = [
  "All",
  "No Answer",
  "Booked",
  "Not Interested",
  "Follow Up",
  "Closed",
];

export default function LeadTracker() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);
  const [outcomeFilter, setOutcomeFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLead, setNewLead] = useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = useState<{
    row: string;
    col: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleAddLead = async () => {
    if (!newLead.Name) return;
    setSaving(true);
    const payload = { ...newLead };
    if (!payload.Date) {
      payload.Date = new Date().toLocaleDateString("en-US");
    }
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNewLead({});
    setShowAddForm(false);
    setSaving(false);
    fetchLeads();
  };

  const handleInlineEdit = async (
    rowNum: string,
    colName: string,
    value: string
  ) => {
    const colIdx = COLUMNS.indexOf(colName);
    if (colIdx === -1) return;
    setSaving(true);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        row: parseInt(rowNum),
        col: colIdx,
        value,
      }),
    });
    setEditingCell(null);
    setSaving(false);
    fetchLeads();
  };

  let filtered = [...leads];
  if (outcomeFilter !== "All") {
    filtered = filtered.filter(
      (l) => l["Call Outcome"] === outcomeFilter
    );
  }

  filtered.sort((a, b) => {
    const scoreA = parseInt(a["Lead Score"] || "0");
    const scoreB = parseInt(b["Lead Score"] || "0");
    return sortAsc ? scoreA - scoreB : scoreB - scoreA;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Lead Tracker</h2>
          <p className="text-riven-muted text-sm mt-1">
            {leads.length} total leads
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-riven-gold text-black font-semibold rounded-lg hover:bg-riven-gold-light transition"
        >
          + Add Lead
        </button>
      </div>

      {showAddForm && (
        <div className="bg-riven-card border border-riven-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-riven-gold">
            New Lead
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <div key={col}>
                <label className="block text-xs text-riven-muted mb-1">
                  {col}
                </label>
                <input
                  type={col === "Lead Score" ? "number" : "text"}
                  value={newLead[col] || ""}
                  onChange={(e) =>
                    setNewLead({ ...newLead, [col]: e.target.value })
                  }
                  className="w-full bg-riven-bg border border-riven-border rounded px-3 py-2 text-sm text-white focus:border-riven-gold focus:outline-none"
                  placeholder={col}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddLead}
              disabled={saving || !newLead.Name}
              className="px-4 py-2 bg-riven-gold text-black font-semibold rounded-lg hover:bg-riven-gold-light transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Lead"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewLead({});
              }}
              className="px-4 py-2 border border-riven-border rounded-lg text-riven-muted hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-riven-muted">Filter by Outcome:</label>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-riven-card border border-riven-border rounded px-3 py-1.5 text-sm text-white focus:border-riven-gold focus:outline-none"
          >
            {OUTCOME_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="text-sm text-riven-muted hover:text-riven-gold transition flex items-center gap-1"
        >
          Lead Score {sortAsc ? "↑" : "↓"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-riven-muted">
          Loading leads...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-riven-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-riven-card border-b border-riven-border">
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-riven-muted font-medium whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const score = parseInt(lead["Lead Score"] || "0");
                const isHot = score >= 3;
                return (
                  <tr
                    key={lead._row}
                    className={`border-b border-riven-border hover:bg-white/5 transition ${
                      isHot ? "bg-riven-gold/5" : ""
                    }`}
                  >
                    {COLUMNS.map((col, colIdx) => {
                      const isEditing =
                        editingCell?.row === lead._row &&
                        editingCell?.col === col;
                      return (
                        <td
                          key={col}
                          className={`px-4 py-3 whitespace-nowrap cursor-pointer ${
                            col === "Lead Score" && isHot
                              ? "text-riven-gold font-bold"
                              : ""
                          }`}
                          onDoubleClick={() => {
                            setEditingCell({ row: lead._row, col });
                            setEditValue(lead[col] || "");
                          }}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() =>
                                handleInlineEdit(
                                  lead._row,
                                  col,
                                  editValue
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleInlineEdit(
                                    lead._row,
                                    col,
                                    editValue
                                  );
                                }
                                if (e.key === "Escape") {
                                  setEditingCell(null);
                                }
                              }}
                              className="bg-riven-bg border border-riven-gold rounded px-2 py-1 text-sm text-white focus:outline-none w-full min-w-[80px]"
                            />
                          ) : (
                            <span
                              className={
                                col === "Name" && isHot
                                  ? "text-riven-gold"
                                  : ""
                              }
                            >
                              {lead[col] || "—"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="text-center py-10 text-riven-muted"
                  >
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-riven-muted mt-4">
        Double-click any cell to edit inline. Leads with score 3+ are highlighted
        gold.
      </p>
    </div>
  );
}
