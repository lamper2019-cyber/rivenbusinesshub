"use client";

import Link from "next/link";
import type { Client } from "@/lib/types";
import { formatWeighInDate } from "@/lib/tips";

const statusDot: Record<string, string> = {
  active: "bg-green-500",
  paused: "bg-yellow-500",
  completed: "bg-gray-500",
};

export default function ClientCard({ client }: { client: Client }) {
  const target = client.targetWeight || client.startingWeight * 0.9;
  const weightToLose = client.startingWeight - target;
  const lostSoFar = client.startingWeight - client.currentWeight;
  const lbsToGo = Math.max(0, Math.round((client.currentWeight - target) * 10) / 10);
  const journeyPct =
    weightToLose > 0
      ? Math.max(0, Math.min(100, Math.round((lostSoFar / weightToLose) * 100)))
      : 0;

  return (
    <div className="bg-riven-card rounded-2xl p-5 hover:bg-riven-surface transition-all animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-headline font-bold text-white text-lg leading-tight">
            {client.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-wider text-riven-muted/70 uppercase bg-white/5 px-2 py-1 rounded">
            Phase {client.phase}
          </span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${statusDot[client.status] || "bg-gray-500"}`}
          />
        </div>
      </div>

      {/* Weight Boxes */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-riven-bg rounded-xl p-3 text-center">
          <p className="text-[10px] text-riven-muted uppercase tracking-wider mb-1">Current</p>
          <p className="text-xl font-headline font-bold text-white">
            {client.currentWeight}
            <span className="text-xs font-normal text-riven-muted ml-1">lbs</span>
          </p>
        </div>
        <div className="bg-riven-bg rounded-xl p-3 text-center">
          <p className="text-[10px] text-riven-muted uppercase tracking-wider mb-1">Target</p>
          <p className="text-xl font-headline font-bold text-white">
            {Math.round(target * 10) / 10}
            <span className="text-xs font-normal text-riven-muted ml-1">lbs</span>
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-riven-muted">
            {lbsToGo > 0 ? `${lbsToGo} lbs to go` : "Goal reached!"}
          </span>
          <span className="text-xs font-semibold text-riven-gold">{journeyPct}% Journey</span>
        </div>
        <div className="w-full h-3 bg-riven-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full gold-gradient transition-all duration-500"
            style={{ width: `${journeyPct}%` }}
          />
        </div>
      </div>

      {/* Last Weigh-in */}
      <p className="text-xs text-riven-muted mb-4">
        Last weigh-in:{" "}
        <span className="text-white/70">{formatWeighInDate(client.lastWeighInDate)}</span>
      </p>

      {/* Quick View Button */}
      <Link
        href={`/clients/${client.id}`}
        className="block w-full text-center text-sm font-medium text-riven-gold hover:text-riven-gold-light py-2 rounded-xl bg-riven-gold/5 hover:bg-riven-gold/10 transition-all"
      >
        Quick View &rarr;
      </Link>
    </div>
  );
}
