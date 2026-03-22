export type TendencyType = "Obliger" | "Upholder" | "Questioner" | "Rebel";

export interface WeighIn {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface FinalSixNos {
  noSugaryDrinks: boolean;
  noFriedFoods: boolean;
  noFastFood: boolean;
  noProcessedCarbs: boolean;
  noCandyBetweenMeals: boolean;
  noAlcoholMonThu: boolean;
}

export const FINAL_SIX_NOS_LABELS: Record<keyof FinalSixNos, string> = {
  noSugaryDrinks: "No sugary drinks",
  noFriedFoods: "No fried foods more than 1x/week",
  noFastFood: "No fast food more than 1x/week",
  noProcessedCarbs: "No ultra-processed carbs (white bread, pasta, chips, crackers, cookies) more than 1x/week",
  noCandyBetweenMeals: "No candy/sweets between meals",
  noAlcoholMonThu: "No alcohol Mon\u2013Thu",
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
  steps: number; // daily step count
  finalSixNos: FinalSixNos;
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
