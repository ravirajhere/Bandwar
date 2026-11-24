import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ghReadJson, ghWriteJson, ghAudit } from "@/lib/github";
export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const PATH = "data/master.json";
export async function GET(request: NextRequest) {
  const s = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(s))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const { data } = await ghReadJson<any>(PATH);
  return NextResponse.json({ data }, { headers: NO_STORE });
}
export async function POST(request: NextRequest) {
  const s = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(s))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const body = await request.json();
  const { sha } = await ghReadJson<any>(PATH);
  await ghWriteJson(PATH, body.data, "Admin: update settings", sha);
  await ghAudit({ action: "SETTINGS_UPDATED", target: "master.json", detail: "Site / Home / SEO" });
  return NextResponse.json({ success: true }, { headers: NO_STORE });
}