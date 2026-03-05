import { NextRequest, NextResponse } from "next/server";
import { getRows, appendRow, updateCell } from "@/lib/sheets";

const HEADERS = [
  "Name",
  "Email",
  "Phone",
  "Date",
  "Source",
  "Lead Score",
  "Call Scheduled",
  "Call Date",
  "Call Outcome",
  "Follow-up Date",
  "Notes",
];

export async function GET() {
  try {
    const rows = await getRows("Leads");
    if (rows.length === 0) {
      return NextResponse.json({ headers: HEADERS, leads: [] });
    }
    const headers = rows[0];
    const leads = rows.slice(1).map((row, idx) => {
      const obj: Record<string, string> = { _row: String(idx + 2) };
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });
    return NextResponse.json({ headers, leads });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "update") {
      const { row, col, value } = body;
      await updateCell("Leads", row, col, value);
      return NextResponse.json({ success: true });
    }

    const values = HEADERS.map((h) => body[h] || "");
    await appendRow("Leads", values);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
