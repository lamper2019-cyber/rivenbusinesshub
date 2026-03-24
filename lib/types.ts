export type TendencyType = "Obliger" | "Upholder" | "Questioner" | "Rebel";

export interface WeighIn {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface PhaseChecklist {
  // Phase 1 — The Foundation
  p1_protein40g: boolean;
  p1_steps7000: boolean;
  p1_eatWhatYouWant: boolean;
  // Phase 2 — The Tightening
  p2_steps9000: boolean;
  p2_first3Nos: boolean;
  p2_glucomannan: boolean;
  // Phase 3 — The Lock In
  p3_steps11000: boolean;
  p3_all6Nos: boolean;
}

export const PHASE_CHECKLIST_DATA: {
  phase: number;
  title: string;
  subtitle: string;
  items: { key: keyof PhaseChecklist; label: string }[];
}[] = [
  {
    phase: 1,
    title: "Phase 1",
    subtitle: "The Foundation",
    items: [
      { key: "p1_protein40g", label: "40g protein before noon, under 400 cal" },
      { key: "p1_steps7000", label: "7,000 steps daily" },
      { key: "p1_eatWhatYouWant", label: "Eat whatever you want for lunch and dinner" },
    ],
  },
  {
    phase: 2,
    title: "Phase 2",
    subtitle: "The Tightening",
    items: [
      { key: "p2_steps9000", label: "Steps up to 9,000" },
      { key: "p2_first3Nos", label: "First 3 NOs (no sugary drinks, no fried foods more than 1x/week, no ultra-processed snacks) limited to max 2x/week" },
      { key: "p2_glucomannan", label: "Glucomannan before dinner" },
    ],
  },
  {
    phase: 3,
    title: "Phase 3",
    subtitle: "The Lock In",
    items: [
      { key: "p3_steps11000", label: "Steps up to 11,000" },
      { key: "p3_all6Nos", label: "All 6 NOs locked in to once per week max (no sugary drinks, no fried foods, no fast food, no ultra-processed carbs, no candy/sweets between meals, no alcohol Mon\u2013Thu)" },
    ],
  },
];

export const DEFAULT_PHASE_CHECKLIST: PhaseChecklist = {
  p1_protein40g: false,
  p1_steps7000: false,
  p1_eatWhatYouWant: false,
  p2_steps9000: false,
  p2_first3Nos: false,
  p2_glucomannan: false,
  p3_steps11000: false,
  p3_all6Nos: false,
};

export interface Client {
  id: string;
  name: string;
  phase: 1 | 2 | 3;
  startDate: string;
  startingWeight: number;
  currentWeight: number;
  targetWeight: number;
  totalLost: number;
  tendencyType: TendencyType | "";
  lastWeighInDate: string; // YYYY-MM-DD
  weighIns: WeighIn[];
  phaseChecklist: PhaseChecklist;
  status: "active" | "paused" | "completed";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: "referral" | "instagram" | "facebook" | "website" | "other" | "";
  status: "new" | "contacted" | "interested" | "follow-up" | "closed" | "lost";
  notes: string;
  followUpDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatAction {
  type: "update_client" | "add_client" | "update_lead" | "add_lead";
  name?: string;
  fields: Record<string, string | number>;
}
