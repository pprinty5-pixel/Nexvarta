import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function parseCount(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const s = String(val)
    .replace(/,/g, '')
    .replace(/[\u0966-\u096F]/g, d => d.charCodeAt(0) - 2406);
  const num = parseInt(s, 10);
  return isNaN(num) ? 1000 : num;
}

export async function POST(request) {
  try {
    const { articleId } = await request.json();
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
    if (!fs.existsSync(storePath)) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(storePath, 'utf8');
    const cms = JSON.parse(fileContent);

    let updatedViews = null;
    let found = false;

    if (cms.newsSections && Array.isArray(cms.newsSections)) {
      for (const section of cms.newsSections) {
        if (!section.articles || !Array.isArray(section.articles)) continue;
        const art = section.articles.find(a => a.id === articleId || a.id?.toLowerCase() === articleId.toLowerCase());
        if (art) {
          const currentViews = parseCount(art.views);
          art.views = currentViews + 1;
          updatedViews = art.views;
          found = true;
          break;
        }
      }
    }

    if (found) {
      fs.writeFileSync(storePath, JSON.stringify(cms, null, 2), 'utf8');
      return NextResponse.json({ success: true, views: updatedViews });
    }

    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating article views:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
