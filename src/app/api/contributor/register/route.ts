import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/contributors.json";

  try {
    const { displayName, email, customUsername } = await req.json();

    if (!displayName || displayName.trim().length < 2) {
      return NextResponse.json({ error: "Name is too short." }, { status: 400 });
    }

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

    const finalUsername = customUsername.startsWith("@") ? customUsername : `@${customUsername}`;
    
    // Check if username already exists
    const existingIndex = content.contributors.findIndex(
      (c: any) => c.username.toLowerCase() === finalUsername.toLowerCase()
    );

    if (existingIndex !== -1) {
      return NextResponse.json({ error: "Username is already taken. Please choose another." }, { status: 400 });
    }

    // Create new contributor (No password, simple data)
    const newContributor = {
      id: finalUsername.replace("@", ""),
      username: finalUsername,
      displayName: displayName.trim(),
      email: email?.trim() || "",
      bio: "",
      photo: "",
      joinedAt: new Date().toISOString().split("T")[0],
      hasChangedUsername: false,
    };

    content.contributors.push(newContributor);

    await fetch(getFileUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `New Contributor: ${finalUsername}`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        ...(fileData && { sha: fileData.sha }),
      }),
    });

    return NextResponse.json({ success: true, contributor: newContributor });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}