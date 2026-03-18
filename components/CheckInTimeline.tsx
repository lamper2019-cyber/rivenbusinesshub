"use client";

import type { CheckIn } from "@/lib/types";
import Link from "next/link";

export default function CheckInTimeline({ checkin }: { checkin: CheckIn }) {
  const feelingEmoji =
    checkin.feeling >= 8
      ? "😄"
      : checkin.feeling >= 5
        ? "😊"
        : checkin.feeling >= 3
          ? "😐"
          : "😔";

  return (
    <div className="relative pl-6 pb-6 border-l border-riven-border last:border-0 last:pb-0">
      <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-riven-gold" />

      <div className="bg-riven-card border border-riven-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <Link
            href={`/clients/${checkin.clientId}`}
            className="font-semibold text-white hover:text-riven-gold transition-colors"
          >
            {checkin.clientName}
          </Link>
          <span className="text-xs text-riven-muted">
            {new Date(checkin.date).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs mb-2">
          <span className="text-riven-muted">
            Weight:{" "}
            <span className="text-white">{checkin.currentWeight} lbs</span>
          </span>
          <span className="text-riven-muted">
            Feeling:{" "}
            <span className="text-white">
              {checkin.feeling}/10 {feelingEmoji}
            </span>
          </span>
          <span className="text-riven-muted">
            Protein:{" "}
            <span className={checkin.hitProteinDaily ? "text-green-400" : "text-red-400"}>
              {checkin.hitProteinDaily ? "Yes" : "No"}
            </span>
          </span>
          <span className="text-riven-muted">
            Steps:{" "}
            <span className="text-white">{checkin.stepDays}/7 days</span>
          </span>
        </div>

        {checkin.biggestWin && (
          <p className="text-xs text-green-400/80 mb-1">
            Win: {checkin.biggestWin}
          </p>
        )}
        {checkin.biggestStruggle && (
          <p className="text-xs text-red-400/80">
            Struggle: {checkin.biggestStruggle}
          </p>
        )}
      </div>
    </div>
  );
}
