import { NextResponse } from "next/server";
import { getRows } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getRows("Clients");
    if (rows.length === 0) {
      return NextResponse.json({ clients: [], debug: { rowCount: 0, message: "No rows found in Clients tab" } });
    }
    const headers = rows[0];
    const clients = rows.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });
    return NextResponse.json({ clients, debug: { rowCount: rows.length, headers } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, debug: { hint: "Check if Clients tab exists with exact name" } }, { status: 500 });
  }
}
