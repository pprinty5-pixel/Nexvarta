import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function findArticle(articleId) {
  try {
    const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
    if (fs.existsSync(storePath)) {
      const cms = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      if (cms.newsSections) {
        for (const section of cms.newsSections) {
          const art = section.articles?.find(
            a => a.id === articleId || a.id?.toLowerCase() === articleId?.toLowerCase()
          );
          if (art) return art;
        }
      }
    }
  } catch (e) {
    console.error('Error finding article in OG route:', e.message);
  }
  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.redirect(new URL('/uploads/logos/nexvarta_official_logo.png', request.url));
    }

    const article = findArticle(articleId);

    // 1. If article has a base64 Data URL, decode and return it directly
    if (article?.image && article.image.startsWith('data:image/')) {
      const matches = article.image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      }
    }

    // 2. If article has a local file path, serve it
    if (article?.image && article.image.startsWith('/')) {
      return NextResponse.redirect(new URL(article.image, request.url));
    }

    // 3. If article has an external URL, redirect
    if (article?.image && (article.image.startsWith('http://') || article.image.startsWith('https://'))) {
      return NextResponse.redirect(article.image);
    }

    // 4. Fallback to official Nexvarta logo
    return NextResponse.redirect(new URL('/uploads/logos/nexvarta_official_logo.png', request.url));
  } catch (error) {
    console.error('OG serving error:', error);
    return NextResponse.redirect(new URL('/uploads/logos/nexvarta_official_logo.png', request.url));
  }
}
