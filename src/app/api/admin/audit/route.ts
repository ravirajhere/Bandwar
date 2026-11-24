import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!(await isValidSession(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  if (!token || !owner || !repo) {
    return NextResponse.json({ audit: [] });
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/data/audit.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return NextResponse.json({ audit: [] });
    const d = await res.json();
    const audit = JSON.parse(Buffer.from(d.content, "base64").toString("utf-8"));
    return NextResponse.json(
      { audit: Array.isArray(audit) ? audit : [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ audit: [] });
  }
}