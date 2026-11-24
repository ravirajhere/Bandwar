import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ghReadJson, ghWriteJson, ghAudit } from "@/lib/github";
export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `article-${Date.now()}`; }
const fileFor = (cat: string) => `data/articles/${cat}.json`;

export async function GET(request: NextRequest) {
  const s = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(s))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const cat = request.nextUrl.searchParams.get("category") || "culture";
  const { data } = await ghReadJson<any>(fileFor(cat));
  const { data: cats } = await ghReadJson<any>("data/categories.json");
  return NextResponse.json({ articles: data?.articles || [], categories: cats?.categories || [] }, { headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  const s = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(s))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const body = await request.json();
  const primary = body.categories?.[0] || body.category || "culture";
  const path = fileFor(primary);
  const { data, sha } = await ghReadJson<any>(path);
  if (!data) return NextResponse.json({ error: `File nahi mili: ${path}. Pehle category banao.` }, { status: 404 });
  if (!Array.isArray(data.articles)) data.articles = [];
  const today = new Date().toISOString().slice(0, 10);

  if (body.action === "add") {
    const id = slugify(body.title);
    if (data.articles.find((a: any) => a.id === id)) return NextResponse.json({ error: "Is title se article already hai" }, { status: 400 });
    const art = {
      id, title: body.title, subtitle: body.subtitle || "", categories: body.categories || [primary],
      summary: body.summary || "", hero: body.hero || "/fallback.jpg",
      photos: body.hero ? [{ src: body.hero.replace(/^\//, ""), caption: body.title, imageAlt: body.title }] : [],
      infobox: body.infobox || {}, datePublished: today, lastUpdated: today,
      content: body.content?.filter((c: any) => c.heading || c.text) || [{ heading: "Overview", text: "" }],
      faqs: body.faqs?.filter((f: any) => f.q || f.a) || [],
      related: body.related || [], location: { lat: 25.5008, lng: 86.1608 },
      tags: body.tags || [], lastEditedBy: "Bandwar Editor", status: body.status || "published",
    };
    data.articles.push(art);
    await ghWriteJson(path, data, `Admin: add article ${id}`, sha);
    await ghAudit({ action: "ARTICLE_ADDED", target: id, detail: body.title });
    return NextResponse.json({ success: true, id });
  }

  if (body.action === "delete") {
    data.articles = data.articles.filter((a: any) => a.id !== body.id);
    await ghWriteJson(path, data, `Admin: delete article ${body.id}`, sha);
    await ghAudit({ action: "ARTICLE_DELETED", target: body.id, detail: "Permanent delete" });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}