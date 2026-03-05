import { NextRequest, NextResponse } from "next/server";
import { appendRow, getRows } from "@/lib/sheets";

export const dynamic = "force-dynamic";

const HEADERS = [
  "Client Name",
  "Date",
  "Current Weight",
  "Feeling",
  "Biggest Win",
  "Biggest Struggle",
  "Hit Protein Daily",
  "Step Days",
  "Photo URL",
];

export async function GET() {
  try {
    const rows = await getRows("Clients");
    if (rows.length <= 1) {
      return NextResponse.json({ clients: [] });
    }
    const headers = rows[0];
    const nameIdx = headers.indexOf("Name");
    const statusIdx = headers.indexOf("Status");
    const clients = rows
      .slice(1)
      .filter((row) => {
        const status = statusIdx >= 0 ? row[statusIdx]?.toLowerCase() : "active";
        return status === "active" || status === "";
      })
      .map((row) => row[nameIdx] || "");
    return NextResponse.json({ clients: clients.filter(Boolean) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const today = new Date().toLocaleDateString("en-US");
    const values = [
      body["Client Name"] || "",
      today,
      body["Current Weight"] || "",
      body["Feeling"] || "",
      body["Biggest Win"] || "",
      body["Biggest Struggle"] || "",
      body["Hit Protein Daily"] || "",
      body["Step Days"] || "",
      body["Photo URL"] || "",
    ];
    await appendRow("Check-Ins", values);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
