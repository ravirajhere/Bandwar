import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/contributors.json";

  try {
    // 🚀 FormData receive kar rahe hain (JSON ki jagah)
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const newUsername = formData.get("newUsername") as string;
    const bio = formData.get("bio") as string;
    const photoFile = formData.get("photoFile") as File | null;

    if (!id) throw new Error("ID is required");

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

    // 🚀 PHOTO UPLOAD LOGIC
    if (photoFile && photoFile.size > 0) {
      const arrayBuffer = await photoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");
      
      // Image path inside public folder
      const imagePath = `public/images/contributors/${id}.jpg`;
      const getImageUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}`;
      
      // Check if image already exists (to get SHA for overwrite)
      let imageSha = undefined;
      const imgRes = await fetch(getImageUrl, {
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
      });
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        imageSha = imgData.sha;
      }

      // Commit image to GitHub
      const uploadRes = await fetch(getImageUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
        body: JSON.stringify({
          message: `Update profile photo for ${id}`,
          content: base64Image,
          ...(imageSha && { sha: imageSha }) // Only pass sha if overwriting
        })
      });

      if (uploadRes.ok) {
        // Add ?t=timestamp to bust browser/Vercel cache
        contributor.photo = `/images/contributors/${id}.jpg?t=${Date.now()}`;
      } else {
        console.error("Failed to upload image to GitHub");
      }
    }

    // Update Bio & Username
    if (bio !== undefined) contributor.bio = bio;

    if (newUsername && newUsername !== contributor.username) {
      if (contributor.hasChangedUsername) {
        return NextResponse.json({ error: "You can only change your username once." }, { status: 400 });
      }

      const formattedUsername = newUsername.startsWith("@") ? newUsername : `@${newUsername}`;
      
      if (content.contributors.some((c: any) => c.username.toLowerCase() === formattedUsername.toLowerCase())) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
      }

      contributor.username = formattedUsername;
      // Note: id remains the same for DB, so image path doesn't break if username changes
      contributor.hasChangedUsername = true;
    }

    content.contributors[contributorIndex] = contributor;

    // Save updated contributors.json
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
  } catch (error: any) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: error.message || "Profile update failed." }, { status: 500 });
  }
}