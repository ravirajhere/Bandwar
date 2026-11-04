import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (!(await isValidSession(sessionCookie))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  if (!githubToken || !repoOwner || !repoName) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500, headers: NO_STORE });
  }

  try {
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/data/queue.json`;
    const res = await fetch(getFileUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json", "X-GitHub-Api-Version": "2022-11-28" },
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json({ pending: [], approved: [] }, { headers: NO_STORE });
    }
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const fileData = await res.json();
    const content = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));

    // Sanitize response to only send necessary data
    const sanitized = {
      pending: (content.pending || []).map((item: any) => ({
        id: item.id, type: item.type, contextId: item.contextId, intent: item.intent, field: item.field,
        oldValue: item.oldValue, newValue: item.newValue, userName: item.userName, userUsername: item.userUsername,
        timestamp: item.timestamp, sourceReason: item.sourceReason, pendingImageUrl: item.pendingImageUrl, targetType: item.targetType
      })),
      approved: (content.approved || []).map((item: any) => ({
        id: item.id, type: item.type, contextId: item.contextId, intent: item.intent, field: item.field,
        oldValue: item.oldValue, newValue: item.newValue, userName: item.userName, userUsername: item.userUsername,
        timestamp: item.timestamp, sourceReason: item.sourceReason, pendingImageUrl: item.pendingImageUrl, targetType: item.targetType
      })),
    };

    return NextResponse.json(sanitized, { headers: NO_STORE });
  } catch (error) {
    console.error("[admin/pending] Fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500, headers: NO_STORE });
  }
}