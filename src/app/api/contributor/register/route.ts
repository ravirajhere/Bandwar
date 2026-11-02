import { NextResponse } from "next/server";

// 🚀 Reserved usernames jo koi nahi le sakta
const RESERVED_USERNAMES = ["admin", "administrator", "root", "system", "api", "support", "help", "bandwar"];

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/contributors.json";

  try {
    const { displayName, email, customUsername } = await req.json();

    // 1. Basic Validation
    if (!displayName || displayName.trim().length < 2) {
      return NextResponse.json({ error: "Display name must be at least 2 characters." }, { status: 400 });
    }

    if (!customUsername || customUsername.trim().length < 2) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    // 2. Username Format Validation
    const cleanUsername = customUsername.trim().replace(/^@/, ""); // Remove @ if present
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json({ 
        error: "Username can only contain letters, numbers, and underscores (no spaces)." 
      }, { status: 400 });
    }

    // 3. Reserved Names Check
    if (RESERVED_USERNAMES.includes(cleanUsername.toLowerCase())) {
      return NextResponse.json({ error: "This username is reserved. Please choose another." }, { status: 400 });
    }

    const finalUsername = `@${cleanUsername}`;

    // 4. Fetch current contributors from GitHub
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const res = await fetch(getFileUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      cache: "no-store",
    });

    let fileData = null;
    let content: { contributors: any[] } = { contributors: [] };

    if (res.ok) {
      fileData = await res.json();
      content = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));
      if (!content.contributors) content.contributors = [];
    }

    // 5. Check if username already exists (case-insensitive)
    const existingIndex = content.contributors.findIndex(
      (c: any) => c.username.toLowerCase() === finalUsername.toLowerCase()
    );

    if (existingIndex !== -1) {
      return NextResponse.json({ 
        error: "Username is already taken. Please choose another." 
      }, { status: 400 });
    }

    // 6. Create new contributor (No password, simple auth)
    const newContributor = {
      id: cleanUsername.toLowerCase(),
      username: finalUsername,
      displayName: displayName.trim(),
      email: email?.trim() || "",
      bio: "",
      photo: "",
      joinedAt: new Date().toISOString().split("T")[0],
      hasChangedUsername: false,
    };

    content.contributors.push(newContributor);

    // 7. Commit to GitHub
    const putRes = await fetch(getFileUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `New Contributor: ${finalUsername}`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        ...(fileData && { sha: fileData.sha }),
      }),
    });

    if (!putRes.ok) {
      throw new Error("Failed to save contributor to GitHub.");
    }

    return NextResponse.json({ success: true, contributor: newContributor });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}