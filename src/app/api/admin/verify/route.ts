import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Aap apna existing admin auth middleware/check yahan use karein)
    // const isAuthenticated = await checkAdminAuth(req);
    // if (!isAuthenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { articleId, tier, sourceId, method, notes, verifiedBy } = body;

    if (!articleId || !tier || !verifiedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const articlesDir = path.join(process.cwd(), 'data', 'articles');
    const stewardshipFile = path.join(process.cwd(), 'data', 'stewardship.json');

    let articleUpdated = false;
    let updatedArticleData = null;

    // 2. Update Article in its specific category file
    const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(articlesDir, file);
      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const articleIndex = rawData.articles?.findIndex((a: any) => a.id === articleId);
      if (articleIndex !== -1 && articleIndex !== undefined) {
        // Update confidence and provenance
        rawData.articles[articleIndex].confidence = tier;
        rawData.articles[articleIndex].provenance = {
          sourceId: sourceId || undefined,
          method: method || 'document',
          verifiedBy,
          verifiedAt: new Date().toISOString(),
          notes: notes || undefined
        };
        
        updatedArticleData = rawData.articles[articleIndex];
        fs.writeFileSync(filePath, JSON.stringify(rawData, null, 2), 'utf8');
        articleUpdated = true;
        break;
      }
    }

    if (!articleUpdated) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // 3. Add Entry to Stewardship Log
    const stewardship = JSON.parse(fs.readFileSync(stewardshipFile, 'utf8'));
    const newEntry = {
      id: `stew-${crypto.randomUUID()}`,
      entityId: articleId,
      entityType: "article",
      action: "verified",
      tier: tier,
      role: "archivist", // Aap admin role ke hisaab se change kar sakte hain
      actor: verifiedBy,
      method: method,
      notes: notes,
      timestamp: new Date().toISOString(),
      sourceIds: sourceId ? [sourceId] : []
    };
    
    stewardship.entries.push(newEntry);
    fs.writeFileSync(stewardshipFile, JSON.stringify(stewardship, null, 2), 'utf8');

    // 🚀 4. COMMIT TO GITHUB 
    // Yahan aap apna existing GitHub API logic call karein:
    // await commitToGitHub([
    //   { path: `data/articles/${targetFile}`, content: updatedArticleData },
    //   { path: 'data/stewardship.json', content: stewardship }
    // ], `Verify ${articleId} as ${tier}`);

    return NextResponse.json({ success: true, message: 'Article verified successfully' });

  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}