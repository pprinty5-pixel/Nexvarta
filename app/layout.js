import './globals.css';
import GoogleTranslator from './components/GoogleTranslator';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: 'NEXVARTA | The Next Voice of News | Pune & Maharashtra Live News & Creator Video Hub',
  description: 'Delivering credible, fast, and hyperlocal journalism from Pune to the world. Features 24x7 Live News, Pune Metro, Maharashtra Policy, and B2B Creator Video Syndication with readymade 9:16 Reels and 16:9 4K packages.',
  keywords: ['Nexvarta', 'Pune News', 'Maharashtra News', 'Pune Metro', 'Hinjewadi IT Park', 'Creator Video Syndication', 'News Reels', '9:16 News'],
  authors: [{ name: 'Nexvarta Media Pvt. Ltd.' }],
  creator: 'Nexvarta Media Pvt. Ltd.',
  publisher: 'Nexvarta Media Pvt. Ltd.',
  metadataBase: new URL('https://nvnews.in'),
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NEXVARTA - The Next Voice of News',
    description: 'Hyperlocal journalism and B2B ready-to-use news video footage, scripts & audio for YouTubers and media agencies.',
    url: 'https://nvnews.in',
    siteName: 'NEXVARTA',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'NEXVARTA News Portal',
      },
    ],
    locale: 'mr_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXVARTA - The Next Voice of News',
    description: 'Maharashtra & Pune news portal with All-in-One creator video pass for media publishers and YouTubers.',
    images: ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop'],
    creator: '@NexvartaNews',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mr-IN">
      <body>
        <div id="google_translate_element" style={{ position: 'absolute', top: -9999, left: -9999, opacity: 0, pointerEvents: 'none' }} aria-hidden="true"></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                if (window.google && window.google.translate) {
                  new window.google.translate.TranslateElement({
                    pageLanguage: 'mr',
                    includedLanguages: 'mr,en,hi',
                    autoDisplay: false
                  }, 'google_translate_element');
                }
              }
            `
          }}
        />
        <script
          type="text/javascript"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />
        <GoogleTranslator />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              "name": "NEXVARTA",
              "url": "https://nexvarta.com",
              "logo": "https://nexvarta.com/logo.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Nexvarta Media Complex, Pimpri",
                "addressLocality": "Pune",
                "addressRegion": "Maharashtra",
                "postalCode": "411018",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-20-6789-0000",
                "contactType": "newsroom",
                "email": "news@nexvarta.com"
              }
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}

