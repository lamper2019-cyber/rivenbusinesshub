import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getAuth() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });
  return auth;
}

function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export type TabName =
  | "Leads"
  | "Clients"
  | "Check-Ins"
  | "Onboarding"
  | "Content"
  | "Subscribers";

export async function getRows(tab: TabName): Promise<string[][]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A:Z`,
  });
  return res.data.values || [];
}

export async function appendRow(tab: TabName, values: string[]) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function updateCell(
  tab: TabName,
  row: number,
  col: number,
  value: string
) {
  const sheets = getSheets();
  const colLetter = String.fromCharCode(65 + col);
  const range = `${tab}!${colLetter}${row}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[value]] },
  });
}

export async function updateRow(
  tab: TabName,
  row: number,
  values: string[]
) {
  const sheets = getSheets();
  const endCol = String.fromCharCode(65 + values.length - 1);
  const range = `${tab}!A${row}:${endCol}${row}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}
