import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ImageResponse } from 'next/og';
import { siteConfig, newsSections } from '../../../../data/newsData';

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
          if (art) return { article: art, section, siteConfig: cms.siteConfig || siteConfig };
        }
      }
    }
  } catch (e) {
    console.error('Error finding article in OG route:', e.message);
  }

  // Fallback to static newsData
  for (const section of newsSections) {
    const art = section.articles?.find(
      a => a.id === articleId || a.id?.toLowerCase() === articleId?.toLowerCase()
    );
    if (art) return { article: art, section, siteConfig };
  }

  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return new NextResponse('Article ID missing', { status: 400 });
    }

    const data = findArticle(articleId);
    const article = data?.article;
    const currentConfig = data?.siteConfig || siteConfig;

    // 1. If article has a base64 Data URL, return the decoded image directly
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

    // 2. If article has a local relative path, serve that file directly
    if (article?.image && article.image.startsWith('/')) {
      const filePath = path.join(process.cwd(), 'public', article.image.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
        };
        const buffer = fs.readFileSync(filePath);
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': mimeTypes[ext] || 'image/jpeg',
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      }
    }

    // 3. If article has an external HTTP/HTTPS URL, redirect to it
    if (article?.image && (article.image.startsWith('http://') || article.image.startsWith('https://'))) {
      return NextResponse.redirect(article.image);
    }

    // 4. Generate dynamic high-impact 1200x630 OG image card using next/og
    const title = article?.title || currentConfig?.name || 'NEXVARTA NEWS';
    const category = data?.section?.name || 'ताज्या घडामोडी';
    const date = article?.date || 'आजची बातमी';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#002255',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #003884 2%, transparent 0%), radial-gradient(circle at 75px 75px, #003884 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            padding: '60px 70px',
            color: '#ffffff',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Top Bar with Badge & Brand */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ea580c',
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              🔴 {category}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: 2,
              }}
            >
              नेक्सवार्ता • NVNEWS.IN
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 1.25,
              color: '#ffffff',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </div>

          {/* Footer with Date and Callout */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid rgba(255,255,255,0.2)',
              paddingTop: 24,
            }}
          >
            <div style={{ fontSize: 24, color: '#93c5fd', fontWeight: 600 }}>
              📅 {date} | पुण्याचा नवा आवाज
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                color: '#002255',
                padding: '12px 28px',
                borderRadius: 12,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              वाचा सविस्तर ➡️
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG generation error:', error);
    return new NextResponse('OG generation failed', { status: 500 });
  }
}
