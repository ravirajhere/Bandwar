import { NextRequest, NextResponse } from "next/server";
import { isValidSession } from "@/lib/adminAuth";

export const runtime = "nodejs"; // Buffer ke liye Node.js runtime chahiye

export async function GET(request: NextRequest) {
  // 🔐 STEP 1: Verify admin session
  const sessionCookie = request.cookies.get("admin_session")?.value;
  
  if (!(await isValidSession(sessionCookie))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { 
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  // 🔐 STEP 2: Only after auth, proceed
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  if (!githubToken || !repoOwner || !repoName) {
    console.error("[admin/pending] Missing GitHub env vars");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const filePath = "data/queue.json";

  try {
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const res = await fetch(getFileUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",  // ✅ pin API version
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { pending: [], approved: [] },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const fileData = await res.json();
    const content = JSON.parse(
      Buffer.from(fileData.content, "base64").toString("utf-8")
    );

    // 🔐 STEP 3: Sanitize response — don't leak what frontend doesn't need
    // (Optional but recommended: strip unnecessary fields)
    const sanitized = {
      pending: (content.pending || []).map((item: any) => ({
        id: item.id,
        type: item.type,
        contextId: item.contextId,
        intent: item.intent,
        field: item.field,
        oldValue: item.oldValue,
        newValue: item.newValue,
        userName: item.userName,
        userUsername: item.userUsername,
        timestamp: item.timestamp,
        sourceReason: item.sourceReason,
        pendingImageUrl: item.pendingImageUrl,
        targetType: item.targetType,
        // Don't include internal fields unless frontend needs them
      })),
      approved: (content.approved || []).map((item: any) => ({
        id: item.id,
        type: item.type,
        contextId: item.contextId,
        intent: item.intent,
        field: item.field,
        oldValue: item.oldValue,
        newValue: item.newValue,
        userName: item.userName,
        userUsername: item.userUsername,
        timestamp: item.timestamp,
        sourceReason: item.sourceReason,
        pendingImageUrl: item.pendingImageUrl,
        targetType: item.targetType,
      })),
    };

    return NextResponse.json(sanitized, {
      headers: { "Cache-Control": "no-store" },  // ✅ prevent browser/CDN cache
    });
  } catch (error) {
    console.error("[admin/pending] Fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}