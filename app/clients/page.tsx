"use client";

import { useState, useEffect } from "react";

interface Client {
  [key: string]: string;
}

const STATUS_FILTERS = ["All", "Active", "Paused", "Completed"];

export default function ClientDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => console.error("Failed to fetch clients"))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    statusFilter === "All"
      ? clients
      : clients.filter(
          (c) =>
            (c["Status"] || "Active").toLowerCase() ===
            statusFilter.toLowerCase()
        );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Client Dashboard</h2>
          <p className="text-riven-muted text-sm mt-1">
            {clients.length} total clients
          </p>
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                statusFilter === s
                  ? "bg-riven-gold text-black font-semibold"
                  : "bg-riven-card border border-riven-border text-riven-muted hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-riven-muted">
          Loading clients...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-riven-muted">
          No clients found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((client, idx) => {
            const name = client["Name"] || "Unknown";
            const phase = client["Phase"] || "—";
            const startWeight = parseFloat(client["Starting Weight"] || "0");
            const currentWeight = parseFloat(
              client["Current Weight"] || "0"
            );
            const poundsLost = startWeight - currentWeight;
            const goal = 20;
            const progress = Math.min(
              Math.max((poundsLost / goal) * 100, 0),
              100
            );
            const lastCheckIn = client["Last Check-In Date"] || "—";
            const nextAdjustment = client["Next Adjustment Date"] || "—";
            const status = client["Status"] || "Active";

            const statusColor =
              status.toLowerCase() === "active"
                ? "text-green-400"
                : status.toLowerCase() === "paused"
                ? "text-yellow-400"
                : "text-riven-muted";

            return (
              <div
                key={idx}
                className="bg-riven-card border border-riven-border rounded-xl p-6 hover:border-riven-gold/30 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <p className="text-sm text-riven-muted">Phase: {phase}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${statusColor} bg-white/5`}
                  >
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-riven-muted">Start</p>
                    <p className="text-lg font-bold">
                      {startWeight > 0 ? `${startWeight}` : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-riven-muted">Current</p>
                    <p className="text-lg font-bold">
                      {currentWeight > 0 ? `${currentWeight}` : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-riven-muted">Lost</p>
                    <p className="text-lg font-bold text-riven-gold">
                      {poundsLost > 0 ? `${poundsLost.toFixed(1)}` : "0"}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-riven-muted mb-1">
                    <span>Progress toward 20 lb goal</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-riven-border rounded-full h-2.5">
                    <div
                      className="bg-riven-gold h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-riven-muted border-t border-riven-border pt-3">
                  <span>Last check-in: {lastCheckIn}</span>
                  <span>Next adj: {nextAdjustment}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
