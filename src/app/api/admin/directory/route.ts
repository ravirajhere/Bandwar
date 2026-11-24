import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ghReadJson, ghWriteJson, ghAudit } from "@/lib/github";
export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const PATH = "data/directory.json";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `item-${Date.now()}`;
}

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
  const { data, sha } = await ghReadJson<any>(PATH);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!Array.isArray(data.categories)) data.categories = [];
  if (!Array.isArray(data.items)) data.items = [];

  const { action } = body;

  // --- CATEGORIES ---
  if (action === "add_category") {
    const id = slugify(body.title);
    if (data.categories.find((c: any) => c.id === id)) return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    data.categories.push({ id, title: body.title, icon: body.icon || "📌" });
    await ghWriteJson(PATH, data, `Admin: add directory category ${id}`, sha);
    await ghAudit({ action: "DIRECTORY_CATEGORY_ADDED", target: id, detail: body.title });
    return NextResponse.json({ success: true, id });
  }
  if (action === "edit_category") {
    const c = data.categories.find((x: any) => x.id === body.id);
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
    c.title = body.title; c.icon = body.icon;
    await ghWriteJson(PATH, data, `Admin: edit directory category ${body.id}`, sha);
    await ghAudit({ action: "DIRECTORY_CATEGORY_EDITED", target: body.id, detail: body.title });
    return NextResponse.json({ success: true });
  }
  if (action === "delete_category") {
    const used = data.items.filter((i: any) => i.categoryId === body.id).length;
    if (used > 0) return NextResponse.json({ error: `Is category me ${used} items hai. Pehle unhe move/delete karo.` }, { status: 400 });
    data.categories = data.categories.filter((c: any) => c.id !== body.id);
    await ghWriteJson(PATH, data, `Admin: delete directory category ${body.id}`, sha);
    await ghAudit({ action: "DIRECTORY_CATEGORY_DELETED", target: body.id, detail: "Permanent delete" });
    return NextResponse.json({ success: true });
  }

  // --- ITEMS ---
  if (action === "add_item") {
    const id = slugify(body.name);
    if (data.items.find((i: any) => i.id === id)) return NextResponse.json({ error: "Item already exists" }, { status: 400 });
    data.items.push({ id, name: body.name, categoryId: body.categoryId, description: body.description || "", phone: body.phone || "", address: body.address || "", timing: body.timing || "", isEmergency: !!body.isEmergency });
    await ghWriteJson(PATH, data, `Admin: add directory item ${id}`, sha);
    await ghAudit({ action: "DIRECTORY_ITEM_ADDED", target: id, detail: body.name });
    return NextResponse.json({ success: true, id });
  }
  if (action === "edit_item") {
    const it = data.items.find((x: any) => x.id === body.id);
    if (!it) return NextResponse.json({ error: "Not found" }, { status: 404 });
    it.name = body.name; it.categoryId = body.categoryId; it.description = body.description || "";
    it.phone = body.phone || ""; it.address = body.address || ""; it.timing = body.timing || ""; it.isEmergency = !!body.isEmergency;
    await ghWriteJson(PATH, data, `Admin: edit directory item ${body.id}`, sha);
    await ghAudit({ action: "DIRECTORY_ITEM_EDITED", target: body.id, detail: body.name });
    return NextResponse.json({ success: true });
  }
  if (action === "delete_item") {
    data.items = data.items.filter((i: any) => i.id !== body.id);
    await ghWriteJson(PATH, data, `Admin: delete directory item ${body.id}`, sha);
    await ghAudit({ action: "DIRECTORY_ITEM_DELETED", target: body.id, detail: "Permanent delete" });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}