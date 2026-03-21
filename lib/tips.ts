import type { TendencyType } from "./types";

interface TendencyInfo {
  tips: string[];
  checkInApproach: string;
}

export const TENDENCY_TIPS: Record<TendencyType, TendencyInfo> = {
  Obliger: {
    tips: [
      "Obligers respond best to external accountability. Set up regular check-in reminders.",
      "Create specific commitments they make to you, not just to themselves.",
      "Pair them with an accountability buddy if possible.",
      "They may overcommit to others and neglect their own goals — check on that.",
    ],
    checkInApproach:
      "Be their accountability partner. They need someone counting on them.",
  },
  Upholder: {
    tips: [
      "Upholders thrive with clear rules and structure. Give them a detailed plan.",
      "They follow through on their own but may struggle when rules conflict.",
      "Respect their self-discipline — they don't need external pressure.",
      "They may get frustrated when others don't follow the plan.",
    ],
    checkInApproach:
      "Keep it structured. They appreciate clear expectations and data.",
  },
  Questioner: {
    tips: [
      "Questioners need to understand WHY before they commit. Explain the reasoning.",
      "Back up recommendations with data and research.",
      "Be ready for questions — they're not resisting, they're processing.",
      "Once they buy in, they're fully committed.",
    ],
    checkInApproach:
      "Lead with data and evidence. Show them the why behind every change.",
  },
  Rebel: {
    tips: [
      "Rebels resist being told what to do. Frame choices as their decision.",
      "Use identity language: 'You're the kind of person who...'",
      "Avoid rigid rules. Offer options and let them choose.",
      "Connect actions to their identity and values, not external expectations.",
    ],
    checkInApproach:
      "Give them freedom. Frame progress as their choice, not your instruction.",
  },
};

export function getRandomTip(tendency: TendencyType): string {
  const info = TENDENCY_TIPS[tendency];
  return info.tips[Math.floor(Math.random() * info.tips.length)];
}

export function getCoachInsight(tendency: TendencyType): string {
  return TENDENCY_TIPS[tendency].checkInApproach;
}

export function needsWeighIn(lastWeighInDate: string, daysThreshold = 7): boolean {
  if (!lastWeighInDate) return true;
  const last = new Date(lastWeighInDate + "T00:00:00");
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= daysThreshold;
}

export function formatWeighInDate(dateStr: string): string {
  if (!dateStr) return "No weigh-ins yet";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
