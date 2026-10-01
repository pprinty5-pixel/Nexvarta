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
  const proto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host') || '';

  // Auto-redirect HTTP to HTTPS in production
  if (proto === 'http' && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    httpsUrl.host = host;
    return NextResponse.redirect(httpsUrl.toString(), 301);
  }

  // Intercept requests to /news/:id for crawlers
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
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-article-id', articleId);
      return NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (static user uploads)
     */
    '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
};
