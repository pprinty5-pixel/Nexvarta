import { NextResponse } from 'next/server';

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'WhatsApp',
  'LinkedInBot',
  'TelegramBot',
  'Discordbot',
  'Slackbot',
  'Pinterest',
  'SkypeUriPreview',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Intercept requests to /news/:id
  const match = pathname.match(/^\/news\/([^/]+)$/);
  if (match) {
    const userAgent = request.headers.get('user-agent') || '';
    const isCrawler = CRAWLER_USER_AGENTS.some(crawler =>
      userAgent.toLowerCase().includes(crawler.toLowerCase())
    );

    if (isCrawler) {
      const articleId = match[1];
      const url = request.nextUrl.clone();
      url.pathname = '/api/og-preview';
      url.searchParams.set('id', articleId);
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/news/:id*'],
};
