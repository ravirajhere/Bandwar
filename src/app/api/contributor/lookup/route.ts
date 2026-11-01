import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const filePath = "data/contributors.json";

  try {
    const { username } = await req.json();
    const formatted = username.startsWith("@") ? username : `@${username}`;
    
    const res = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }, cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json({ error: "Could not fetch data." }, { status: 500 });

    const fileData = await res.json();
    const content = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));
    const contributor = content.contributors.find(
      (c: any) => c.username.toLowerCase() === formatted.toLowerCase()
    );

    if (!contributor) {
      return NextResponse.json({ error: "No account found with this username." }, { status: 404 });
    }

    return NextResponse.json({ success: true, contributor });
  } catch {
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }
}