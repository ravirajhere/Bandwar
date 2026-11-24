import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ArticleSchema } from "@/lib/schema";
import { getAllArticles, clearCache } from "@/lib/data";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Schema se validate — galat data kabhi file me nahi jayega
    const parsed = ArticleSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(" | ") }, { status: 400 });
    }

    // 2. Sahi file dhoondo — data/articles/*.json me
    const dir = path.join(process.cwd(), "data", "articles");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

    let targetFile: string | null = null;
    for (const f of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      if (raw.articles?.some((a: any) => a.id === id)) { targetFile = f; break; }
    }
    if (!targetFile) return NextResponse.json({ error: "Article file not found" }, { status: 404 });

    // 3. Us file ke andar sirf isi article ko update karo, baaki ko haath mat lagao
    const fullPath = path.join(dir, targetFile);
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    data.articles = data.articles.map((a: any) => a.id === id ? parsed.data : a);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + "\n");

    clearCache(); // taaki public page turant naya dikhe

    return NextResponse.json({ ok: true, status: parsed.data.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}