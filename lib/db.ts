import { openDB as idbOpen, IDBPDatabase } from "idb";
import type { Client, Lead, CheckIn, FileAttachment } from "./types";

const DB_NAME = "riven-crm";
const DB_VERSION = 1;

function getDB(): Promise<IDBPDatabase> {
  return idbOpen(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("clients")) {
        const clients = db.createObjectStore("clients", { keyPath: "id" });
        clients.createIndex("name", "name");
        clients.createIndex("status", "status");
        clients.createIndex("lastCheckInDate", "lastCheckInDate");
      }
      if (!db.objectStoreNames.contains("leads")) {
        const leads = db.createObjectStore("leads", { keyPath: "id" });
        leads.createIndex("name", "name");
        leads.createIndex("status", "status");
        leads.createIndex("followUpDate", "followUpDate");
      }
      if (!db.objectStoreNames.contains("checkins")) {
        const checkins = db.createObjectStore("checkins", { keyPath: "id" });
        checkins.createIndex("clientId", "clientId");
        checkins.createIndex("date", "date");
      }
      if (!db.objectStoreNames.contains("files")) {
        const files = db.createObjectStore("files", { keyPath: "id" });
        files.createIndex("clientId", "clientId");
      }
    },
  });
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

// --- Check-ins ---
export async function getAllCheckIns(limit = 50): Promise<CheckIn[]> {
  const db = await getDB();
  const all = await db.getAll("checkins");
  return (all as CheckIn[])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export async function getCheckInsForClient(clientId: string): Promise<CheckIn[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("checkins", "clientId", clientId);
  return (all as CheckIn[]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function putCheckIn(checkin: CheckIn): Promise<void> {
  const db = await getDB();
  await db.put("checkins", checkin);

  // Update parent client's lastCheckInDate and currentWeight
  const client = await db.get("clients", checkin.clientId) as Client | undefined;
  if (client) {
    client.lastCheckInDate = checkin.date;
    client.currentWeight = checkin.currentWeight;
    client.totalLost = client.startingWeight - checkin.currentWeight;
    client.updatedAt = new Date().toISOString();
    await db.put("clients", client);
  }
}

// --- Files ---
export async function getFilesForClient(clientId: string): Promise<FileAttachment[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("files", "clientId", clientId);
  return (all as FileAttachment[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function putFile(file: FileAttachment): Promise<void> {
  const db = await getDB();
  await db.put("files", file);
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("files", id);
}

// --- Utility ---
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear("clients");
  await db.clear("leads");
  await db.clear("checkins");
  await db.clear("files");
}

export async function getUnsyncedClients(): Promise<Client[]> {
  const all = await getAllClients();
  return all.filter((c) => !c.syncedAt || c.updatedAt > c.syncedAt);
}

export async function getUnsyncedLeads(): Promise<Lead[]> {
  const all = await getAllLeads();
  return all.filter((l) => !l.syncedAt || l.updatedAt > l.syncedAt);
}

export async function markSynced(
  store: "clients" | "leads" | "checkins",
  id: string
): Promise<void> {
  const db = await getDB();
  const record = await db.get(store, id);
  if (record) {
    record.syncedAt = new Date().toISOString();
    await db.put(store, record);
  }
}
