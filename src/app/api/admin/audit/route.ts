import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ghReadJson } from "@/lib/github";
export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
export async function GET(request: NextRequest) {
  const s = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(s))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const { data } = await ghReadJson<any[]>("data/audit.json");
  return NextResponse.json({ logs: Array.isArray(data) ? data : [] }, { headers: NO_STORE });
}