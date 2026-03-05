import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/sheets";

const HEADERS = [
  "Full Name",
  "Email",
  "Phone",
  "Age",
  "Current Weight",
  "Goal Weight",
  "Height",
  "Medical Conditions",
  "Foods You Love",
  "Foods You Hate",
  "Restaurants",
  "Cook or Eat Out",
  "Work Schedule",
  "Wake Time",
  "Bed Time",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const values = HEADERS.map((h) => body[h] || "");
    await appendRow("Onboarding", values);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
