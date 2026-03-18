"use client";

import Link from "next/link";
import type { Client } from "@/lib/types";
import { needsCheckIn } from "@/lib/tips";

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  paused: "bg-yellow-500",
  completed: "bg-riven-muted",
};

const tendencyEmoji: Record<string, string> = {
  Obliger: "🤝",
  Upholder: "📋",
  Questioner: "🔍",
  Rebel: "⚡",
};

export default function ClientCard({ client }: { client: Client }) {
  const overdue = needsCheckIn(client.lastCheckInDate);
  const progress =
    client.startingWeight > 0
      ? Math.min(
          100,
          ((client.startingWeight - client.currentWeight) /
            Math.max(client.startingWeight * 0.1, 1)) *
            100
        )
      : 0;

  return (
    <Link href={`/clients/${client.id}`}>
      <div
        className={`bg-riven-card border rounded-xl p-4 hover:border-riven-gold/50 transition-all cursor-pointer ${
          overdue ? "border-riven-gold/60" : "border-riven-border"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{client.name}</h3>
            {client.tendencyType && (
              <span className="text-sm" title={client.tendencyType}>
                {tendencyEmoji[client.tendencyType] || ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-riven-muted px-2 py-0.5 bg-white/5 rounded">
              Phase {client.phase}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${statusColors[client.status] || "bg-riven-muted"}`}
            />
          </div>
        </div>

        {client.startingWeight > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-riven-muted mb-1">
              <span>
                {client.currentWeight > 0
                  ? `${client.currentWeight} lbs`
                  : "—"}
              </span>
              <span>
                {client.totalLost > 0
                  ? `${client.totalLost.toFixed(1)} lbs lost`
                  : "—"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-riven-border rounded-full overflow-hidden">
              <div
                className="h-full bg-riven-gold rounded-full transition-all"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-riven-muted">
          <span>
            {client.lastCheckInDate
              ? `Last weigh-in: ${new Date(client.lastCheckInDate).toLocaleDateString()}`
              : "No weigh-ins yet"}
          </span>
          {overdue && (
            <span className="text-riven-gold font-medium">Needs weigh-in</span>
          )}
        </div>
      </div>
    </Link>
  );
}
