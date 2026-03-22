import { openDB as idbOpen, IDBPDatabase } from "idb";
import type { Client, Lead, FinalSixNos } from "./types";

const DB_NAME = "riven-crm";
const DB_VERSION = 3;

const DEFAULT_NOS: FinalSixNos = {
  noSugaryDrinks: false,
  noFriedFoods: false,
  noFastFood: false,
  noProcessedCarbs: false,
  noCandyBetweenMeals: false,
  noAlcoholMonThu: false,
};

function getDB(): Promise<IDBPDatabase> {
  return idbOpen(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Delete old stores on upgrade from v1 or v2
      if (oldVersion < 3) {
        const storeNames = Array.from(db.objectStoreNames);
        for (const name of storeNames) {
          db.deleteObjectStore(name);
        }
      }

      if (!db.objectStoreNames.contains("clients")) {
        const clients = db.createObjectStore("clients", { keyPath: "id" });
        clients.createIndex("name", "name");
        clients.createIndex("status", "status");
      }
      if (!db.objectStoreNames.contains("leads")) {
        const leads = db.createObjectStore("leads", { keyPath: "id" });
        leads.createIndex("name", "name");
        leads.createIndex("status", "status");
      }
    },
  });
}

// --- Seed Data ---
const SEED_CLIENTS: Client[] = [
  {
    id: "seed-tracey",
    name: "Tracey",
    phase: 1,
    startDate: "2025-02-25",
    startingWeight: 167,
    currentWeight: 167,
    targetWeight: Math.round(167 * 0.9 * 10) / 10,
    totalLost: 0,
    tendencyType: "Obliger",
    lastWeighInDate: "2025-02-25",
    weighIns: [{ date: "2025-02-25", weight: 167 }],
    steps: 0,
    finalSixNos: { ...DEFAULT_NOS },
    status: "active",
    notes: "",
    createdAt: "2025-02-25T00:00:00.000Z",
    updatedAt: "2025-02-25T00:00:00.000Z",
  },
  {
    id: "seed-danielle-d",
    name: "Danielle D.",
    phase: 2,
    startDate: "2025-02-01",
    startingWeight: 208,
    currentWeight: 202.4,
    targetWeight: Math.round(208 * 0.9 * 10) / 10,
    totalLost: 5.6,
    tendencyType: "Obliger",
    lastWeighInDate: "2025-03-05",
    weighIns: [
      { date: "2025-02-01", weight: 208 },
      { date: "2025-03-05", weight: 202.4 },
    ],
    steps: 0,
    finalSixNos: { ...DEFAULT_NOS },
    status: "active",
    notes: "",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-03-05T00:00:00.000Z",
  },
  {
    id: "seed-denise",
    name: "Denise Rhodes Batten",
    phase: 1,
    startDate: "2025-03-01",
    startingWeight: 211,
    currentWeight: 211,
    targetWeight: Math.round(211 * 0.9 * 10) / 10,
    totalLost: 0,
    tendencyType: "",
    lastWeighInDate: "2025-03-05",
    weighIns: [{ date: "2025-03-05", weight: 211 }],
    steps: 0,
    finalSixNos: { ...DEFAULT_NOS },
    status: "active",
    notes: "",
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-05T00:00:00.000Z",
  },
  {
    id: "seed-jazmine",
    name: "Jazmine Curry",
    phase: 2,
    startDate: "2025-02-01",
    startingWeight: 234.4,
    currentWeight: 230,
    targetWeight: Math.round(234.4 * 0.9 * 10) / 10,
    totalLost: 4.4,
    tendencyType: "",
    lastWeighInDate: "2025-03-05",
    weighIns: [
      { date: "2025-02-01", weight: 234.4 },
      { date: "2025-03-05", weight: 230 },
    ],
    steps: 0,
    finalSixNos: { ...DEFAULT_NOS },
    status: "active",
    notes: "",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-03-05T00:00:00.000Z",
  },
  {
    id: "seed-jessica",
    name: "Jessica Jones",
    phase: 1,
    startDate: "2025-02-15",
    startingWeight: 308,
    currentWeight: 308,
    targetWeight: Math.round(308 * 0.9 * 10) / 10,
    totalLost: 0,
    tendencyType: "Obliger",
    lastWeighInDate: "2025-03-02",
    weighIns: [{ date: "2025-03-02", weight: 308 }],
    steps: 0,
    finalSixNos: { ...DEFAULT_NOS },
    status: "active",
    notes: "",
    createdAt: "2025-02-15T00:00:00.000Z",
    updatedAt: "2025-03-02T00:00:00.000Z",
  },
  {
    id: "seed-rora",
    name: "Rora Jackson",
    phase: 1,
    startDate: "2025-02-01",
    startingWeight: 211,
    currentWeight: 202,
    targetWeight: Math.round(211 * 0.9 * 10) / 10,
    totalLost: 9,
    tendencyType: "",
    lastWeighInDate: "2025-03-05",
    weighIns: [
      { date: "2025-02-01", weight: 211 },
      { date: "2025-03-05", weight: 202 },
    ],
    steps: 0,
    finalSixNos: { ...DEFAULT_NOS },
    status: "active",
    notes: "",
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-03-05T00:00:00.000Z",
  },
];

export async function seedIfEmpty(): Promise<void> {
  const db = await getDB();
  const count = await db.count("clients");
  if (count === 0) {
    const tx = db.transaction("clients", "readwrite");
    for (const client of SEED_CLIENTS) {
      await tx.store.put(client);
    }
    await tx.done;
  }
}

// --- Clients ---
export async function getAllClients(): Promise<Client[]> {
  const db = await getDB();
  const all = await db.getAll("clients");
  return (all as Client[]).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getClient(id: string): Promise<Client | undefined> {
  const db = await getDB();
  return db.get("clients", id) as Promise<Client | undefined>;
}

export async function putClient(client: Client): Promise<void> {
  const db = await getDB();
  client.updatedAt = new Date().toISOString();
  client.totalLost = Math.round((client.startingWeight - client.currentWeight) * 10) / 10;
  if (!client.targetWeight) {
    client.targetWeight = Math.round(client.startingWeight * 0.9 * 10) / 10;
  }
  if (!client.weighIns) {
    client.weighIns = [];
  }
  if (client.steps === undefined) {
    client.steps = 0;
  }
  if (!client.finalSixNos) {
    client.finalSixNos = { ...DEFAULT_NOS };
  }
  await db.put("clients", client);
}

export async function deleteClient(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("clients", id);
}

// --- Leads ---
export async function getAllLeads(): Promise<Lead[]> {
  const db = await getDB();
  const all = await db.getAll("leads");
  return (all as Lead[]).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getLead(id: string): Promise<Lead | undefined> {
  const db = await getDB();
  return db.get("leads", id) as Promise<Lead | undefined>;
}

export async function putLead(lead: Lead): Promise<void> {
  const db = await getDB();
  lead.updatedAt = new Date().toISOString();
  await db.put("leads", lead);
}

export async function deleteLead(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("leads", id);
}
