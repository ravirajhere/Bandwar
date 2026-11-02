import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/contributors.json";

  try {
    const { username } = await req.json();

    // 1. Input Validation
    if (!username || typeof username !== "string" || username.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a valid username." }, { status: 400 });
    }

    const cleanUsername = username.trim().replace(/^@/, "");

    // 2. Format Validation (letters/numbers/underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json({ error: "Invalid username format." }, { status: 400 });
    }

    const formatted = `@${cleanUsername}`;

    // 3. Fetch Contributors from GitHub
    const res = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Could not fetch data." }, { status: 500 });
    }

    const fileData = await res.json();
    const content = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));

    if (!content.contributors || !Array.isArray(content.contributors)) {
      return NextResponse.json({ error: "No contributors found." }, { status: 404 });
    }

    // 4. Find Contributor (case-insensitive)
    const contributor = content.contributors.find(
      (c: any) => c.username.toLowerCase() === formatted.toLowerCase()
    );

    if (!contributor) {
      return NextResponse.json({ error: "No account found with this username." }, { status: 404 });
    }

    // 5. 🚀 SAFE RESPONSE: Only return public fields (no email)
    const safeContributor = {
      id: contributor.id,
      username: contributor.username,
      displayName: contributor.displayName,
      bio: contributor.bio || "",
      photo: contributor.photo || "",
      joinedAt: contributor.joinedAt,
      hasChangedUsername: contributor.hasChangedUsername || false,
    };

    return NextResponse.json({ success: true, contributor: safeContributor });
  } catch (error) {
    console.error("Lookup failed:", error);
    return NextResponse.json({ error: "Lookup failed. Please try again." }, { status: 500 });
  }
}