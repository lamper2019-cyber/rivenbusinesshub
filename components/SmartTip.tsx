"use client";

import { useState, useEffect } from "react";
import type { TendencyType } from "@/lib/types";
import { TENDENCY_TIPS, getRandomTip, needsCheckIn } from "@/lib/tips";

interface SmartTipProps {
  tendencyType: TendencyType | "";
  lastCheckInDate: string;
  clientName: string;
}

export default function SmartTip({
  tendencyType,
  lastCheckInDate,
  clientName,
}: SmartTipProps) {
  const [tip, setTip] = useState("");
  const overdue = needsCheckIn(lastCheckInDate);

  useEffect(() => {
    if (tendencyType && tendencyType in TENDENCY_TIPS) {
      setTip(getRandomTip(tendencyType as TendencyType));
    }
  }, [tendencyType]);

  if (!tendencyType && !overdue) return null;

  const info = tendencyType
    ? TENDENCY_TIPS[tendencyType as TendencyType]
    : null;

  return (
    <div className="space-y-2">
      {overdue && (
        <div className="bg-riven-gold/10 border border-riven-gold/30 rounded-lg p-3 flex items-start gap-2">
          <span className="text-lg">⏰</span>
          <div>
            <p className="text-sm font-medium text-riven-gold">
              Weigh-in overdue
            </p>
            <p className="text-xs text-riven-muted">
              {clientName} hasn&apos;t weighed in for over 7 days.{" "}
              {info ? info.checkInApproach : "Schedule a follow-up."}
            </p>
          </div>
        </div>
      )}
      {info && tip && (
        <div className="bg-white/5 border border-riven-border rounded-lg p-3 flex items-start gap-2">
          <span className="text-lg">{info.emoji}</span>
          <div>
            <p className="text-xs text-riven-muted mb-0.5">
              {tendencyType} Coaching Tip
            </p>
            <p className="text-sm text-white">{tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
