import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  try {
    const { editId, action } = await req.json();
    const queuePath = "data/queue.json";

    const queueUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${queuePath}`;
    const queueRes = await fetch(queueUrl, {
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" }
    });
    
    const queueData = await queueRes.json();
    let queueContent = JSON.parse(Buffer.from(queueData.content, 'base64').toString('utf-8'));

    // Ensure arrays exist
    if (!queueContent.pending) queueContent.pending = [];
    if (!queueContent.approved) queueContent.approved = [];

    const itemIndex = queueContent.pending.findIndex((i: any) => i.id === editId);
    if (itemIndex === -1) throw new Error("Item not found in pending queue");

    const item = queueContent.pending[itemIndex];
    queueContent.pending.splice(itemIndex, 1); // Remove from pending

    if (action === "approve") {
      queueContent.approved.push({ ...item, approvedAt: new Date().toISOString() });
    }
    // Agar reject hai, toh yahin discard ho gaya

    // Save updated queue (Just moving data, no target files touched)
    await fetch(queueUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({
        message: `Queue Update: ${action} ${editId}`,
        content: Buffer.from(JSON.stringify(queueContent, null, 2)).toString('base64'),
        sha: queueData.sha
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}