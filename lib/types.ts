export type TendencyType = "Obliger" | "Upholder" | "Questioner" | "Rebel";

export interface Client {
  id: string;
  name: string;
  phase: 1 | 2 | 3;
  startDate: string;
  startingWeight: number;
  currentWeight: number;
  totalLost: number;
  tendencyType: TendencyType | "";
  lastCheckInDate: string;
  status: "active" | "paused" | "completed";
  notes: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  status: "new" | "contacted" | "interested" | "follow-up" | "closed" | "lost";
  followUpDate: string;
  notes: string;
  source: "referral" | "instagram" | "facebook" | "website" | "other" | "";
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string;
}

export interface CheckIn {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  currentWeight: number;
  feeling: number;
  biggestWin: string;
  biggestStruggle: string;
  hitProteinDaily: boolean;
  stepDays: number;
  notes: string;
  createdAt: string;
  syncedAt: string;
}

export interface FileAttachment {
  id: string;
  clientId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string;
  textContent: string;
  createdAt: string;
}

export interface AIInterpretation {
  intent: "add_client" | "add_lead" | "log_checkin" | "query_data" | "unknown";
  entities: Record<string, string>;
  response: string;
  action?: {
    type: string;
    data: Record<string, unknown>;
  };
}
