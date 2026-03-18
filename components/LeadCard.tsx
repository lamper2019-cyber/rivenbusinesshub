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
    new Date(lead.followUpDate).getTime() < Date.now() &&
    lead.status !== "closed" &&
    lead.status !== "lost";

  return (
    <div
      className={`bg-riven-card border rounded-xl p-4 hover:border-riven-gold/50 transition-all cursor-pointer ${
        isOverdue ? "border-riven-gold/60" : "border-riven-border"
      }`}
      onClick={() => onEdit(lead)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white">{lead.name}</h3>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
            statusColors[lead.status] || "bg-white/10 text-white"
          }`}
        >
          {lead.status}
        </span>
      </div>

      {lead.source && (
        <p className="text-xs text-riven-muted mb-1 capitalize">
          Source: {lead.source}
        </p>
      )}

      {lead.followUpDate && (
        <p
          className={`text-xs mb-1 ${isOverdue ? "text-riven-gold font-medium" : "text-riven-muted"}`}
        >
          {isOverdue ? "Overdue: " : "Follow-up: "}
          {new Date(lead.followUpDate).toLocaleDateString()}
        </p>
      )}

      {lead.notes && (
        <p className="text-xs text-riven-muted line-clamp-2 mt-2">
          {lead.notes}
        </p>
      )}

      <div className="flex gap-2 mt-2 text-xs text-riven-muted">
        {lead.email && <span>{lead.email}</span>}
        {lead.phone && <span>{lead.phone}</span>}
      </div>
    </div>
  );
}
