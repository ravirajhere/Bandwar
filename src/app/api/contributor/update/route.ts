import { NextResponse } from "next/server";

// 🚀 Reserved usernames
const RESERVED_USERNAMES = ["admin", "administrator", "root", "system", "api", "support", "help", "bandwar"];

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/contributors.json";

  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const newUsername = formData.get("newUsername") as string;
    const bio = formData.get("bio") as string;
    const photoFile = formData.get("photoFile") as File | null;

    // 1. Basic Validation
    if (!id) {
      return NextResponse.json({ error: "Contributor ID is required." }, { status: 400 });
    }

    // 2. Photo Size Validation (5MB max)
    if (photoFile && photoFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Photo is too large. Maximum 5MB allowed." }, { status: 400 });
    }

    // 3. Photo Type Validation
    if (photoFile && photoFile.size > 0 && !photoFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    // 4. Fetch Contributors from GitHub
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const res = await fetch(getFileUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Could not fetch contributors data.");
    
    const fileData = await res.json();
    const content = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));
    const contributorIndex = content.contributors.findIndex((c: any) => c.id === id);

    if (contributorIndex === -1) throw new Error("Contributor not found.");

    const contributor = content.contributors[contributorIndex];

    // 5. Photo Upload Logic
    if (photoFile && photoFile.size > 0) {
      const arrayBuffer = await photoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");
      
      const imagePath = `public/images/contributors/${id}.jpg`;
      const getImageUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}`;
      
      // Check if image exists (for SHA overwrite)
      let imageSha = undefined;
      const imgRes = await fetch(getImageUrl, {
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
      });
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        imageSha = imgData.sha;
      }

      const uploadRes = await fetch(getImageUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
        body: JSON.stringify({
          message: `Update profile photo for ${id}`,
          content: base64Image,
          ...(imageSha && { sha: imageSha })
        })
      });

      if (uploadRes.ok) {
        // Cache-busting query string
        contributor.photo = `/images/contributors/${id}.jpg?t=${Date.now()}`;
      } else {
        console.error("Failed to upload image to GitHub");
      }
    }

    // 6. Update Bio
    if (bio !== undefined) {
      contributor.bio = bio.trim();
    }

    // 7. Update Username (with validation)
    if (newUsername && newUsername !== contributor.username) {
      if (contributor.hasChangedUsername) {
        return NextResponse.json({ error: "You can only change your username once." }, { status: 400 });
      }

      const cleanUsername = newUsername.trim().replace(/^@/, "");
      
      // Format validation
      if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        return NextResponse.json({ 
          error: "Username can only contain letters, numbers, and underscores." 
        }, { status: 400 });
      }

      // Reserved names check
      if (RESERVED_USERNAMES.includes(cleanUsername.toLowerCase())) {
        return NextResponse.json({ error: "This username is reserved." }, { status: 400 });
      }

      const formattedUsername = `@${cleanUsername}`;
      
      // Uniqueness check
      if (content.contributors.some((c: any) => 
        c.id !== id && c.username.toLowerCase() === formattedUsername.toLowerCase()
      )) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
      }

      contributor.username = formattedUsername;
      contributor.hasChangedUsername = true;
    }

    content.contributors[contributorIndex] = contributor;

    // 8. Save Updated contributors.json
    const putRes = await fetch(getFileUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `Update Profile: ${contributor.username}`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        sha: fileData.sha,
      }),
    });

    if (!putRes.ok) throw new Error("Failed to save changes to GitHub.");

    return NextResponse.json({ success: true, contributor });
  } catch (error: any) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: error.message || "Profile update failed." }, { status: 500 });
  }
}