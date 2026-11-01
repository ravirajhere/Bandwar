import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/contributors.json";

  try {
    const { id, newUsername, bio, photo } = await req.json();

    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const res = await fetch(getFileUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Could not fetch contributors data.");
    
    const fileData = await res.json();
    let content = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));
    let contributorIndex = content.contributors.findIndex((c: any) => c.id === id);

    if (contributorIndex === -1) throw new Error("Contributor not found.");

    let contributor = content.contributors[contributorIndex];

    // Update Bio & Photo
    if (bio !== undefined) contributor.bio = bio;
    if (photo !== undefined) contributor.photo = photo;

    // Update Username (Only if changed and allowed)
    if (newUsername && newUsername !== contributor.username) {
      if (contributor.hasChangedUsername) {
        return NextResponse.json({ error: "You can only change your username once." }, { status: 400 });
      }

      const formattedUsername = newUsername.startsWith("@") ? newUsername : `@${newUsername}`;
      
      // Check if taken
      if (content.contributors.some((c: any) => c.username.toLowerCase() === formattedUsername.toLowerCase())) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
      }

      contributor.username = formattedUsername;
      contributor.id = formattedUsername.replace("@", "");
      contributor.hasChangedUsername = true;
    }

    content.contributors[contributorIndex] = contributor;

    await fetch(getFileUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `Update Profile: ${contributor.username}`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        sha: fileData.sha,
      }),
    });

    return NextResponse.json({ success: true, contributor });
  } catch (error) {
    return NextResponse.json({ error: "Profile update failed." }, { status: 500 });
  }
}