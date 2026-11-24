import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";
import { ghReadJson, ghWriteJson, ghAudit } from "@/lib/github";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const PATH = "data/people.json";

// GET — saare people list
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const { data } = await ghReadJson<any>(PATH);
  return NextResponse.json({ people: data?.people || [] }, { headers: NO_STORE });
}

// POST — Add / Edit / Delete — ek hi API, action se
export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });

  const body = await request.json();
  const { action } = body;
  const { data, sha } = await ghReadJson<any>(PATH);
  if (!data) return NextResponse.json({ error: "people.json not found" }, { status: 500, headers: NO_STORE });
  if (!Array.isArray(data.people)) data.people = [];

  if (action === "add") {
    const id = (body.id || body.name || "").toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400, headers: NO_STORE });
    if (data.people.some((p: any) => p.id === id)) return NextResponse.json({ error: "Already exists" }, { status: 400, headers: NO_STORE });
    data.people.push({
      id,
      name: body.name || "Unknown",
      role: body.role || "",
      bio: body.bio || "",
      dob: body.dob || "",
      deathDate: body.deathDate || "",
      photo: body.photo || "",
      lastUpdated: new Date().toISOString().split("T")[0],
      lastEditedBy: "Admin",
    });
    await ghWriteJson(PATH, data, `Admin: add person ${id}`, sha);
    await ghAudit({ action: "PERSON_ADDED", target: id, detail: body.name || id });
    return NextResponse.json({ success: true, id }, { headers: NO_STORE });
  }

  if (action === "edit") {
    const idx = data.people.findIndex((p: any) => p.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
    data.people[idx] = {
      ...data.people[idx],
      name: body.name ?? data.people[idx].name,
      role: body.role ?? data.people[idx].role,
      bio: body.bio ?? data.people[idx].bio,
      dob: body.dob ?? data.people[idx].dob,
      deathDate: body.deathDate ?? data.people[idx].deathDate,
      photo: body.photo ?? data.people[idx].photo,
      lastUpdated: new Date().toISOString().split("T")[0],
      lastEditedBy: "Admin",
    };
    await ghWriteJson(PATH, data, `Admin: edit person ${body.id}`, sha);
    await ghAudit({ action: "PERSON_EDITED", target: body.id, detail: body.name || body.id });
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  }

  if (action === "delete") {
    // PERMANENT DELETE — Warning + ID confirm UI me hoga, yaha seedha delete
    const idx = data.people.findIndex((p: any) => p.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
    const name = data.people[idx].name;
    data.people.splice(idx, 1);
    await ghWriteJson(PATH, data, `Admin: delete person ${body.id}`, sha);
    await ghAudit({ action: "PERSON_DELETED", target: body.id, detail: name });
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: NO_STORE });
}