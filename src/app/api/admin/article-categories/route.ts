import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ghReadJson, ghWriteJson, ghAudit } from "@/lib/github";
export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `cat-${Date.now()}`; }

export async function GET(request: NextRequest) {
  const s = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(s))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const { data } = await ghReadJson<any>("data/categories.json");
  return NextResponse.json({ data }, { headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  const s = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(s))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const body = await request.json();
  const { data, sha } = await ghReadJson<any>("data/categories.json");
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!Array.isArray(data.categories)) data.categories = [];

  if (body.action === "add") {
    const id = slugify(body.title);
    if (data.categories.find((c: any) => c.id === id)) return NextResponse.json({ error: "Category already hai" }, { status: 400 });
    data.categories.push({ id, title: body.title, icon: body.icon || "📌", description: body.description || "" });
    await ghWriteJson("data/categories.json", data, `Admin: add article category ${id}`, sha);
    await ghWriteJson(`data/articles/${id}.json`, { articles: [] }, `Admin: create articles file for ${id}`, null);
    await ghAudit({ action: "ARTICLE_CATEGORY_ADDED", target: id, detail: body.title });
    return NextResponse.json({ success: true, id });
  }
  if (body.action === "edit") {
    const c = data.categories.find((x: any) => x.id === body.id);
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
    c.title = body.title; c.icon = body.icon; c.description = body.description || "";
    await ghWriteJson("data/categories.json", data, `Admin: edit article category ${body.id}`, sha);
    await ghAudit({ action: "ARTICLE_CATEGORY_EDITED", target: body.id, detail: body.title });
    return NextResponse.json({ success: true });
  }
  if (body.action === "delete") {
    for (const c of data.categories) {
      const { data: f } = await ghReadJson<any>(`data/articles/${c.id}.json`);
      const used = (f?.articles || []).some((a: any) => (a.categories || []).includes(body.id));
      if (used) return NextResponse.json({ error: `Ye category ${c.id}.json ke kisi article me use ho rahi hai. Pehle us article se category hatao.` }, { status: 400 });
    }
    data.categories = data.categories.filter((c: any) => c.id !== body.id);
    await ghWriteJson("data/categories.json", data, `Admin: delete article category ${body.id}`, sha);
    await ghAudit({ action: "ARTICLE_CATEGORY_DELETED", target: body.id, detail: "Permanent delete" });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}