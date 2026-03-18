import { NextResponse } from "next/server";
import { appendRow } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: "Missing type or data" },
        { status: 400 }
      );
    }

    let tab: "Clients" | "Leads" | "Check-Ins";
    let headers: string[];

    if (type === "client") {
      tab = "Clients";
      headers = [
        "Name", "Phase", "Start Date", "Starting Weight",
        "Current Weight", "Total Lost", "Tendency Type",
        "Last Check-In", "Status", "Notes",
      ];
    } else if (type === "lead") {
      tab = "Leads";
      headers = [
        "Name", "Status", "Follow-up Date", "Notes",
        "Source", "Email", "Phone",
      ];
    } else if (type === "checkin") {
      tab = "Check-Ins";
      headers = [
        "Client Name", "Date", "Current Weight", "Feeling",
        "Biggest Win", "Biggest Struggle", "Hit Protein Daily",
        "Step Days", "Notes",
      ];
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const values = headers.map((h) => data[h] || "");
    await appendRow(tab, values);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sync error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
