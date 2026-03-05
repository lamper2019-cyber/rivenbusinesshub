"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CheckInPage() {
  const [clients, setClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/checkin")
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-riven-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-riven-gold">RIVEN</span> Check-In
          </h1>
          <p className="text-riven-muted mt-2">
            Select your name to start your weekly check-in
          </p>
        </div>

        {loading ? (
          <div className="text-center text-riven-muted py-10">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="text-center text-riven-muted py-10">
            No active clients found
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((name) => (
              <Link
                key={name}
                href={`/checkin/${encodeURIComponent(name)}`}
                className="block w-full bg-riven-card border border-riven-border rounded-xl px-6 py-4 text-center text-lg hover:border-riven-gold hover:bg-riven-gold/5 transition"
              >
                {name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
