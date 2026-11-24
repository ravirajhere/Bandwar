import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ghReadJson, ghWriteJson, ghAudit, ghDeleteFile } from "@/lib/github";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const PATH = "data/media.json";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const { data } = await ghReadJson<any>(PATH);
  return NextResponse.json({ photos: data?.gallery?.photos || [] }, { headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const body = await request.json();
  const { data, sha } = await ghReadJson<any>(PATH);
  if (!data?.gallery) return NextResponse.json({ error: "media.json not found" }, { status: 500, headers: NO_STORE });
  if (!Array.isArray(data.gallery.photos)) data.gallery.photos = [];

  if (body.action === "edit") {
    const idx = data.gallery.photos.findIndex((p: any) => p.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
    data.gallery.photos[idx] = { ...data.gallery.photos[idx], caption: body.caption ?? data.gallery.photos[idx].caption, category: body.category ?? data.gallery.photos[idx].category, year: body.year ?? data.gallery.photos[idx].year };
    await ghWriteJson(PATH, data, `Admin: edit photo ${body.id}`, sha);
    await ghAudit({ action: "PHOTO_EDITED", target: body.id, detail: body.caption || body.id });
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  }

  if (body.action === "delete") {
    // PERMANENT DELETE — photo file bhi delete hogi, koi Trash nahi
    const idx = data.gallery.photos.findIndex((p: any) => p.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
    const src = data.gallery.photos[idx].src;
    data.gallery.photos.splice(idx, 1);
    await ghWriteJson(PATH, data, `Admin: delete photo ${body.id}`, sha);
    if (src) await ghDeleteFile(`public${src}`);
    await ghAudit({ action: "PHOTO_DELETED", target: body.id, detail: src });
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: NO_STORE });
}