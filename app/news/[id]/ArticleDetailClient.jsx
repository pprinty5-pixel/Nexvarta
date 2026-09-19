'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { siteConfig, nexvartaShorts, newsSections } from '../../../data/newsData';
import { renderRichContent } from '../../../lib/formatContent';
import { 
  Tv, 
  Share2, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Copy, 
  Check, 
  ExternalLink, 
  TrendingUp, 
  ChevronRight,
  Flame,
  ShieldCheck,
  Bookmark
} from 'lucide-react';

export default function ArticleDetailClient({
  articleId: propArticleId,
  initialArticle = null,
  initialSection = null,
  initialSiteConfig = null,
  initialCmsData = null,
}) {
  const params = useParams();
  const articleId = propArticleId || params?.id;

  const [currentSiteConfig, setCurrentSiteConfig] = useState(initialSiteConfig || siteConfig);
  const [currentSections, setCurrentSections] = useState(initialCmsData?.newsSections || newsSections);
  const [currentTickers, setCurrentTickers] = useState(initialCmsData?.breakingTickers || [
    "पुणे मेट्रो: हिंजवडी-शिवाजीनगर मेट्रो ३ चे लोकार्पण, प्रवासाचा वेळ ९० मिनिटांवरून अवघ्या १८ मिनिटांवर!",
    "महाराष्ट्र नवीन औद्योगिक धोरण २०२६: एमएसएमई उद्योगांना ५ लाखांपर्यंत बिनव्याजी कर्ज, १० लाख नव्या नोकऱ्यांचे उद्दिष्ट."
  ]);
  const [tickerSpeed, setTickerSpeed] = useState(initialCmsData?.tickerSpeed || 28);
  const [currentShorts, setCurrentShorts] = useState(initialCmsData?.nexvartaShorts || nexvartaShorts);
  const [toastMessage, setToastMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch Live Data from CMS
  useEffect(() => {
    fetch('/api/admin/cms')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.siteConfig) setCurrentSiteConfig(data.siteConfig);
          if (data.newsSections) setCurrentSections(data.newsSections);
          if (data.breakingTickers) setCurrentTickers(data.breakingTickers);
          if (data.tickerSpeed) setTickerSpeed(Number(data.tickerSpeed));
          if (data.nexvartaShorts) setCurrentShorts(data.nexvartaShorts);
        }
      })
      .catch(err => console.log('Using local fallback for fast SSR'));
  }, []);

  // Track view analytics on mount
  useEffect(() => {
    if (articleId) {
      fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view', articleId })
      }).catch(() => {});
    }
  }, [articleId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('🔗 बातमीची लिंक क्लिपबोर्डवर कॉपी झाली!');
      setTimeout(() => setCopied(false), 3000);
      fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share', articleId })
      }).catch(() => {});
    }
  };

  // Find the requested article and its section
  let foundArticle = initialArticle || null;
  let foundSection = initialSection || null;

  for (const section of currentSections) {
    const art = section.articles?.find(a => a.id === articleId || a.id?.toLowerCase() === articleId?.toLowerCase());
    if (art) {
      foundArticle = art;
      foundSection = section;
      break;
    }
  }

  // Related articles from same section or others
  const relatedArticles = foundSection 
    ? foundSection.articles.filter(a => a.id !== foundArticle?.id).slice(0, 3)
    : [];

  // Trending articles across sections
  const trendingArticles = currentSections
    .flatMap(s => s.articles.map(a => ({ ...a, sectionName: s.name, sectionSlug: s.slug })))
    .filter(a => a.id !== foundArticle?.id)
    .slice(0, 5);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Super Top Bar */}
      <div className="super-top-bar">
        <div className="container super-top-inner">
          <div className="super-top-left">
            <span>September 13, 2026</span>
            <span className="super-top-divider">|</span>
            <span>Pune: 28°C</span>
            <span className="super-top-divider">|</span>
            <span>Mumbai: 30°C</span>
          </div>
          <div className="super-top-right">
            <Link href="/" className="epaper-link">
              <Tv size={13} /> E-Paper
            </Link>
            <span className="super-top-divider">|</span>
            <span className="lang-badge">हिंदी</span>
            <span className="lang-badge active">मराठी</span>
          </div>
        </div>
      </div>

      {/* Top Breaking Ticker (Moving Marquee) */}
      <div className="breaking-ticker">
        <div className="container ticker-inner">
          <span className="ticker-badge">
            <span className="ticker-pulse"></span> BREAKING
          </span>
          <div className="ticker-marquee-wrapper">
            <div className="ticker-marquee-track" style={{ animationDuration: `${tickerSpeed || 28}s` }}>
              {currentTickers.map((t, i) => (
                <span key={`nt1-${i}`} className="ticker-item">
                  <span>{t}</span>
                  <span className="ticker-dot">•</span>
                </span>
              ))}
              {currentTickers.map((t, i) => (
                <span key={`nt2-${i}`} className="ticker-item">
                  <span>{t}</span>
                  <span className="ticker-dot">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header & Nav */}
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand-group">
            {currentSiteConfig?.logoUrl ? (
              <img 
                src={currentSiteConfig.logoUrl} 
                alt={currentSiteConfig.name || "NEXVARTA"} 
                style={{ height: 42, maxWidth: 180, objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="brand-logo-icon">
                <Tv size={26} />
              </div>
            )}
            {!currentSiteConfig?.logoOnly && (
              <div className="brand-texts">
                <span className="brand-name">{currentSiteConfig.name}</span>
                <span className="brand-tagline">{currentSiteConfig.tagline}</span>
              </div>
            )}
          </Link>

          {/* Navigation Categories */}
          <nav className="nav-categories">
            <Link href="/" className="nav-link">
              Home
            </Link>
            {currentSections.map(sec => (
              <Link 
                key={sec.id} 
                href={`/#${sec.slug}`} 
                className="nav-link"
              >
                {sec.name.replace(' News', '')}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <Link href="/" className="live-tv-btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              <span className="live-dot"></span> Live TV
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb & Navigation Bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 0' }} className="article-breadcrumb-bar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#64748b', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <Link href="/" style={{ color: '#003884', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} /> मुख्य पान (Home)
            </Link>
            <ChevronRight size={14} />
            {foundSection && (
              <>
                <Link href={`/#${foundSection.slug}`} style={{ color: '#475569', fontWeight: 600 }}>
                  {foundSection.name}
                </Link>
                <ChevronRight size={14} />
              </>
            )}
            <span style={{ color: '#0f172a', fontWeight: 700, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {foundArticle ? foundArticle.title : 'बातमी'}
            </span>
          </div>

          <Link href="/" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#003884', display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', padding: '6px 14px', borderRadius: 6, whiteSpace: 'nowrap' }}>
            ← सर्व बातम्या पहा
          </Link>
        </div>
      </div>

      {/* Article Content or Not Found */}
      <main className="container article-main-container">
        {!foundArticle ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '60px 30px', textAlign: 'center', border: '1px solid #e2e8f0', maxWidth: 640, margin: '40px auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📰</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
              बातमी सापडली नाही (Article Not Found)
            </h1>
            <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.95rem' }}>
              तुम्ही शोधत असलेली बातमी उपलब्ध नाही किंवा काढून टाकण्यात आली आहे.
            </p>
            <Link href="/" style={{ background: '#003884', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              ← मुख्य पानावर परत जा
            </Link>
          </div>
        ) : (
          <div className="article-layout-grid">
            {/* Left Column: Full News Article */}
            <article className="article-main-card">
              {/* Category Badge & Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 800, 
                    color: foundArticle.badgeColor || '#ea580c',
                    background: `${foundArticle.badgeColor || '#ea580c'}15`,
                    border: `1.5px solid ${foundArticle.badgeColor || '#ea580c'}`,
                    padding: '4px 12px', 
                    borderRadius: 99,
                    letterSpacing: 0.5
                  }}
                >
                  {foundArticle.badge}
                </span>
                {foundSection && (
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                    • {foundSection.name}
                  </span>
                )}
              </div>

              {/* Main Marathi Headline */}
              <h1 className="article-headline-title">
                {foundArticle.title}
              </h1>

              {/* Sub-headline / English Title if present */}
              {foundArticle.titleEn && (
                <p style={{ fontSize: '1.05rem', color: '#475569', fontWeight: 600, marginBottom: 20, fontStyle: 'italic', lineHeight: 1.5 }}>
                  {foundArticle.titleEn}
                </p>
              )}

              {/* Author & Publication Meta Bar */}
              <div className="article-author-meta-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#003884', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                    {foundArticle.author ? foundArticle.author.charAt(0) : 'N'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      {foundArticle.author || 'Nexvarta News Bureau'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} /> {foundArticle.date}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} /> {foundArticle.readTime || '3 min read'}
                      </span>
                      {foundArticle.views && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#ea580c', fontWeight: 700 }}>
                            👁️ {foundArticle.views} वाचक
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="article-share-actions">
                  <button 
                    onClick={handleCopyLink}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 14px', fontSize: '0.825rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    title="बातमीची लिंक कॉपी करा"
                  >
                    {copied ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
                    {copied ? 'कॉपी झाले!' : 'लिंक शेअर'}
                  </button>
                  <button 
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(foundArticle.title + ' - वाचा सविस्तर: ' + window.location.href)}`, '_blank');
                      }
                    }}
                    style={{ background: '#25D366', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.825rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,211,102,0.3)' }}
                  >
                    <Share2 size={15} /> WhatsApp
                  </button>
                </div>
              </div>

              {/* Watermarked Feature Image if present */}
              {foundArticle.image && (
                <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', marginBottom: 28, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <img 
                    src={foundArticle.image} 
                    alt={foundArticle.title} 
                    style={{ width: '100%', maxHeight: 520, objectFit: 'cover', display: 'block' }}
                  />
                  {/* Dynamic Watermark Tag */}
                  {foundArticle.watermark && (
                    <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(0, 56, 132, 0.85)', color: '#fff', backdropFilter: 'blur(6px)', padding: '6px 14px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.2)' }}>
                      <ShieldCheck size={14} color="#f59e0b" />
                      {foundArticle.watermark}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Summary Box */}
              {foundArticle.summary && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', 
                  borderLeft: '5px solid #003884', 
                  borderRadius: 10, 
                  padding: '18px 22px', 
                  marginBottom: 28 
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#003884', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                    ⚡ बातमीचा सारांश (Quick Summary)
                  </div>
                  <p style={{ fontSize: '1.05rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.65, margin: 0 }}>
                    {foundArticle.summary}
                  </p>
                </div>
              )}

              {/* Reel / Short Video Script Pass (Creator Feature) */}
              {foundArticle.reelScript && (
                <div style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '20px 22px', marginBottom: 30, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                        CREATOR PASS
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        🎬 30-Sec Reels & YouTube Shorts Script
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(foundArticle.reelScript);
                          showToast('📋 रील्स स्क्रिप्ट क्लिपबोर्डवर कॉपी झाली!');
                        }
                      }}
                      style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    >
                      <Copy size={13} /> स्क्रिप्ट कॉपी करा
                    </button>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, background: '#1e293b', padding: 14, borderRadius: 8 }}>
                    {foundArticle.reelScript}
                  </pre>
                </div>
              )}

              {/* Full News Content with Marathi Rich Formatting */}
              <div 
                className="article-full-content-body"
                dangerouslySetInnerHTML={{ __html: renderRichContent(foundArticle.fullContent) }}
              />

              {/* Bottom Engagement Bar */}
              <div style={{ marginTop: 36, paddingTop: 24, borderTop: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    ही बातमी आवडली असल्यास आपल्या मित्रांसोबत शेअर करा:
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(foundArticle.title + ' ' + window.location.href)}`, '_blank');
                      }
                    }}
                    style={{ background: '#25D366', color: '#fff', fontWeight: 800, padding: '12px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  >
                    <Share2 size={16} /> WhatsApp वर शेअर करा
                  </button>
                </div>
              </div>
            </article>

            {/* Right Column: Sidebar */}
            <aside className="article-sidebar">
              {/* More from this category */}
              {relatedArticles.length > 0 && (
                <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '2px solid #f1f5f9', paddingBottom: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: foundSection?.color || '#003884' }}></span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {foundSection?.name} मधील आणखी बातम्या
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {relatedArticles.map(art => (
                      <Link 
                        key={art.id} 
                        href={`/news/${art.id}`}
                        style={{ display: 'block', paddingBottom: 12, borderBottom: '1px solid #f1f5f9', textDecoration: 'none' }}
                      >
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: art.badgeColor || '#2563eb' }}>
                          {art.badge}
                        </span>
                        <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a', margin: '4px 0', lineHeight: 1.4 }}>
                          {art.title}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {art.date}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Headlines */}
              <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '2px solid #f1f5f9', paddingBottom: 10 }}>
                  <Flame size={18} color="#ea580c" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    ट्रेंडिंग बातम्या (Trending)
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {trendingArticles.map((art, idx) => (
                    <Link 
                      key={art.id} 
                      href={`/news/${art.id}`}
                      style={{ display: 'flex', gap: 12, alignItems: 'flex-start', textDecoration: 'none' }}
                    >
                      <span style={{ width: 24, height: 24, borderRadius: 6, background: '#f1f5f9', color: '#003884', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                          {art.title}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2, display: 'block' }}>
                          {art.sectionName}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Nexvarta Shorts Widget */}
              <div style={{ background: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                  ⚡ Nexvarta Shorts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentShorts.slice(0, 4).map(short => (
                    <div 
                      key={short.id} 
                      onClick={() => showToast(`⚡ ${short.tag}: ${short.title}`)}
                      style={{ padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', background: short.bg, padding: '2px 6px', borderRadius: 4, marginRight: 8 }}>
                        {short.tag}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        {short.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-bottom">
            © 2026 Nexvarta Media Pvt. Ltd. All rights reserved. | Headquarters: Pimpri, Maharashtra
          </div>
        </div>
      </footer>

      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0f172a', color: '#fff', padding: '14px 22px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 20px 25px rgba(0,0,0,0.3)', zIndex: 9999 }}>
          <Check size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
