import ArticleDetailClient from './ArticleDetailClient';
import fs from 'fs';
import path from 'path';
import { siteConfig, newsSections } from '../../../data/newsData';

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
          if (art) return { article: art, section, siteConfig: cms.siteConfig || siteConfig, cmsData: cms };
        }
      }
    }
  } catch (e) {
    console.error('Error reading cmsStore in getArticleById:', e.message);
  }

  // Fallback to static newsData
  for (const section of newsSections) {
    const art = section.articles?.find(
      a => a.id === id || a.id?.toLowerCase() === id?.toLowerCase()
    );
    if (art) return { article: art, section, siteConfig, cmsData: null };
  }

  return null;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const storePath = path.join(process.cwd(), 'data', 'cmsStore.json');
  const ids = [];
  try {
    if (fs.existsSync(storePath)) {
      const cms = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      if (cms.newsSections) {
        for (const section of cms.newsSections) {
          for (const art of section.articles || []) {
            ids.push({ id: art.id });
          }
        }
      }
    }
  } catch (e) {}

  for (const section of newsSections) {
    for (const art of section.articles || []) {
      if (!ids.some(item => item.id === art.id)) {
        ids.push({ id: art.id });
      }
    }
  }

  return ids;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const result = getArticleById(id);

  if (!result || !result.article) {
    return {
      title: 'बातमी सापडली नाही | नेक्सवार्ता (NEXVARTA)',
      description: 'शोधत असलेली बातमी उपलब्ध नाही किंवा काढून टाकण्यात आली आहे.',
      openGraph: {
        title: 'बातमी सापडली नाही | नेक्सवार्ता',
        description: 'शोधत असलेली बातमी उपलब्ध नाही.',
      }
    };
  }

  const { article, siteConfig: currentConfig } = result;
  const siteName = currentConfig?.name || 'नेक्सवार्ता';
  const title = article.title;
  const description = article.summary || (article.fullContent ? article.fullContent.replace(/<[^>]*>?/gm, '').slice(0, 160) : '') || currentConfig?.tagline || 'नेक्सवार्ता - बातमीचा नवा आणि विश्वासार्ह आवाज';

  // Resolve absolute image URL for WhatsApp / Facebook
  let ogImageUrl = 'https://nvnews.in/uploads/logos/nexvarta_official_logo.png';

  if (article.image) {
    if (article.image.startsWith('http://') || article.image.startsWith('https://')) {
      ogImageUrl = article.image;
    } else if (article.image.startsWith('/')) {
      ogImageUrl = `https://nvnews.in${article.image}`;
    } else if (article.image.startsWith('data:image/')) {
      ogImageUrl = `https://nvnews.in/api/og/article?id=${encodeURIComponent(id)}`;
    }
  }

  return {
    title: `${title} | ${siteName}`,
    description,
    metadataBase: new URL('https://nvnews.in'),
    alternates: {
      canonical: `/news/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://nvnews.in/news/${id}`,
      siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: 'mr_IN',
      type: 'article',
      publishedTime: article.date,
      authors: [article.author || siteName],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function DedicatedArticlePage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const result = getArticleById(id);

  return (
    <ArticleDetailClient
      articleId={id}
      initialArticle={result?.article || null}
      initialSection={result?.section || null}
      initialSiteConfig={result?.siteConfig || null}
      initialCmsData={result?.cmsData || null}
    />
  );
}
