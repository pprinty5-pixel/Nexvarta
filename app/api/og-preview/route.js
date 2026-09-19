import fs from 'fs';
import path from 'path';
import { siteConfig, newsSections } from '../../../data/newsData';

export const runtime = 'nodejs';

function getArticleById(id) {
  try {
    const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
    if (fs.existsSync(storePath)) {
      const cms = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      if (cms.newsSections) {
        for (const section of cms.newsSections) {
          const art = section.articles?.find(
            a => a.id === id || a.id?.toLowerCase() === id?.toLowerCase()
          );
          if (art) return { article: art, siteConfig: cms.siteConfig || siteConfig };
        }
      }
    }
  } catch (e) {}

  for (const section of newsSections) {
    const art = section.articles?.find(
      a => a.id === id || a.id?.toLowerCase() === id?.toLowerCase()
    );
    if (art) return { article: art, siteConfig };
  }

  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const result = getArticleById(id);

  const siteName = result?.siteConfig?.name || 'नेक्सवार्ता';
  const title = result?.article?.title || 'नेक्सवार्ता (NEXVARTA) - बातमीचा नवा आणि विश्वासार्ह आवाज';
  const description = result?.article?.summary || result?.siteConfig?.description || 'पुणे आणि महाराष्ट्रातील ताज्या व विश्वासार्ह घडामोडी.';
  
  let ogImageUrl = 'https://nvnews.in/uploads/logos/nexvarta_official_logo.png';
  let mimeType = 'image/png';

  if (result?.article?.image) {
    const img = result.article.image;
    if (img.startsWith('http://') || img.startsWith('https://')) {
      ogImageUrl = img;
      mimeType = img.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
    } else if (img.startsWith('/')) {
      ogImageUrl = `https://nvnews.in${img}`;
      mimeType = img.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    } else if (img.startsWith('data:image/')) {
      ogImageUrl = `https://nvnews.in/api/og/article?id=${encodeURIComponent(id)}`;
      mimeType = 'image/jpeg';
    }
  }

  const pageUrl = `https://nvnews.in/news/${encodeURIComponent(id || '')}`;

  const html = `<!DOCTYPE html>
<html lang="mr-IN" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} | ${escapeHtml(siteName)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${pageUrl}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${escapeHtml(siteName)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:secure_url" content="${ogImageUrl}">
  <meta property="og:image:type" content="${mimeType}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:locale" content="mr_IN">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <!-- Automatic redirect if loaded in a browser -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
</head>
<body style="font-family: system-ui, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${ogImageUrl}" alt="${escapeHtml(title)}" style="max-width: 100%; height: auto; border-radius: 8px;">
  <p><a href="${pageUrl}">येथे क्लिक करा आणि संपूर्ण बातमी वाचा &rarr;</a></p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
