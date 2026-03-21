"use client";

import type { Lead } from "@/lib/types";

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-purple-500/20 text-purple-400",
  interested: "bg-green-500/20 text-green-400",
  "follow-up": "bg-yellow-500/20 text-yellow-400",
  closed: "bg-riven-gold/20 text-riven-gold",
  lost: "bg-red-500/20 text-red-400",
};

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
}

export default function LeadCard({ lead, onEdit }: LeadCardProps) {
  const isOverdue =
    lead.followUpDate &&
    new Date(lead.followUpDate + "T00:00:00").getTime() < Date.now() &&
    lead.status !== "closed" &&
    lead.status !== "lost";

  return (
    <div
      className="bg-riven-card rounded-2xl p-5 hover:bg-riven-surface transition-all cursor-pointer animate-fade-in"
      onClick={() => onEdit(lead)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-headline font-bold text-white">{lead.name}</h3>
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${
            statusColors[lead.status] || "bg-white/10 text-white"
          }`}
        >
          {lead.status}
        </span>
      </div>

      {lead.source && (
        <p className="text-xs text-riven-muted mb-1 capitalize flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">link</span>
          {lead.source}
        </p>
      )}

      {lead.followUpDate && (
        <p
          className={`text-xs mb-1 flex items-center gap-1 ${isOverdue ? "text-riven-gold font-medium" : "text-riven-muted"}`}
        >
          <span className="material-symbols-outlined text-xs">event</span>
          {isOverdue ? "Overdue: " : "Follow-up: "}
          {new Date(lead.followUpDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}

      {lead.notes && (
        <p className="text-xs text-riven-muted line-clamp-2 mt-2">
          {lead.notes}
        </p>
      )}

      <div className="flex gap-3 mt-3 text-xs text-riven-muted">
        {lead.email && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">mail</span>
            {lead.email}
          </span>
        )}
        {lead.phone && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">phone</span>
            {lead.phone}
          </span>
        )}
      </div>
    </div>
  );
}
