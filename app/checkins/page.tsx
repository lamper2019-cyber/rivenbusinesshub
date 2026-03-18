"use client";

import { useState, useEffect } from "react";
import type { CheckIn } from "@/lib/types";
import { getAllCheckIns } from "@/lib/db";
import CheckInTimeline from "@/components/CheckInTimeline";

export default function CheckInsPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllCheckIns(50);
      setCheckins(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-riven-muted">Loading check-ins...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        <span className="text-riven-gold">Check-ins</span>{" "}
        <span className="text-riven-muted text-base font-normal">
          ({checkins.length})
        </span>
      </h1>

      {checkins.length === 0 ? (
        <div className="text-center py-16 text-riven-muted">
          <p className="text-lg mb-2">No check-ins yet</p>
          <p className="text-sm">
            Check-ins will appear here as clients submit them, or you can log
            one via voice.
          </p>
        </div>
      ) : (
        <div className="ml-2">
          {checkins.map((ci) => (
            <CheckInTimeline key={ci.id} checkin={ci} />
          ))}
        </div>
      )}
    </div>
  );
}
