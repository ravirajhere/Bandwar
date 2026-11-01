import { NextResponse } from "next/server";

export async function GET() {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/queue.json";

  try {
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const res = await fetch(getFileUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      cache: "no-store" // Hamesha fresh data mile
    });

    if (!res.ok) {
      if (res.status === 404) return NextResponse.json({ pending: [] }); // Agar file nahi hai
      throw new Error("GitHub fetch failed");
    }

    const fileData = await res.json();
    const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 });
  }
}