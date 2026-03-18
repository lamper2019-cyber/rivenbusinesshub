import type { Client, Lead } from "./types";

export async function syncToSheets(): Promise<{ synced: number; errors: string[] }> {
  let synced = 0;
  const errors: string[] = [];

  // Dynamic import to avoid SSR issues with IndexedDB
  const { getUnsyncedClients, getUnsyncedLeads, markSynced } = await import("./db");

  const clients = await getUnsyncedClients();
  for (const client of clients) {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "client", data: clientToRow(client) }),
      });
      if (res.ok) {
        await markSynced("clients", client.id);
        synced++;
      } else {
        errors.push(`Client ${client.name}: sync failed`);
      }
    } catch {
      errors.push(`Client ${client.name}: network error`);
    }
  }

  const leads = await getUnsyncedLeads();
  for (const lead of leads) {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "lead", data: leadToRow(lead) }),
      });
      if (res.ok) {
        await markSynced("leads", lead.id);
        synced++;
      } else {
        errors.push(`Lead ${lead.name}: sync failed`);
      }
    } catch {
      errors.push(`Lead ${lead.name}: network error`);
    }
  }

  return { synced, errors };
}

function clientToRow(c: Client): Record<string, string> {
  return {
    Name: c.name,
    Phase: String(c.phase),
    "Start Date": c.startDate,
    "Starting Weight": String(c.startingWeight),
    "Current Weight": String(c.currentWeight),
    "Total Lost": String(c.totalLost),
    "Tendency Type": c.tendencyType,
    "Last Check-In": c.lastCheckInDate,
    Status: c.status,
    Notes: c.notes,
  };
}

function leadToRow(l: Lead): Record<string, string> {
  return {
    Name: l.name,
    Status: l.status,
    "Follow-up Date": l.followUpDate,
    Notes: l.notes,
    Source: l.source,
    Email: l.email,
    Phone: l.phone,
  };
}

export async function importFromSheets(): Promise<{ imported: number }> {
  const { getAllClients, getAllLeads, putClient, putLead } = await import("./db");
  const { v4: uuid } = await import("uuid");

  let imported = 0;
  const existingClients = await getAllClients();
  const existingLeads = await getAllLeads();

  // Import clients if IndexedDB is empty
  if (existingClients.length === 0) {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (data.clients && data.clients.length > 0) {
        for (const row of data.clients) {
          const client: Client = {
            id: uuid(),
            name: row["Name"] || "",
            phase: (parseInt(row["Phase"] || row["Phase (1/2/3)"] || "1") as 1 | 2 | 3),
            startDate: row["Start Date"] || "",
            startingWeight: parseFloat(row["Starting Weight"] || "0"),
            currentWeight: parseFloat(row["Current Weight"] || "0"),
            totalLost: parseFloat(row["Pounds Lost"] || row["Total Lost"] || "0"),
            tendencyType: (row["Tendency Type"] || "") as Client["tendencyType"],
            lastCheckInDate: row["Last Check-In"] || row["Last Check-In Date"] || "",
            status: (row["Status"] || "active").toLowerCase() as Client["status"],
            notes: row["Notes"] || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
          };
          if (client.name) {
            await putClient(client);
            imported++;
          }
        }
      }
    } catch (e) {
      console.error("Failed to import clients from Sheets:", e);
    }
  }

  // Import leads if IndexedDB is empty
  if (existingLeads.length === 0) {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.leads && data.leads.length > 0) {
        for (const row of data.leads) {
          const lead: Lead = {
            id: uuid(),
            name: row["Name"] || "",
            status: (row["Status"] || row["Call Outcome"] || "new").toLowerCase() as Lead["status"],
            followUpDate: row["Follow-up Date"] || row["Follow-Up Date"] || "",
            notes: row["Notes"] || "",
            source: (row["Source"] || "").toLowerCase() as Lead["source"],
            email: row["Email"] || "",
            phone: row["Phone"] || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
          };
          if (lead.name) {
            await putLead(lead);
            imported++;
          }
        }
      }
    } catch (e) {
      console.error("Failed to import leads from Sheets:", e);
    }
  }

  return { imported };
}
