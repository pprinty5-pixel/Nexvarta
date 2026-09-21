'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { siteConfig, nexvartaShorts, newsSections } from '../data/newsData';
import { subscriptionPlan, initialCreatorVideos } from '../data/creatorsData';
import { renderRichContent } from '../lib/formatContent';
import { 
  Tv, 
  Play, 
  Check, 
  Download, 
  FileText, 
  Volume2, 
  ShieldCheck, 
  Share2, 
  X, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Send,
  PlusCircle,
  Copy,
  Sparkles,
  Smartphone,
  Monitor,
  Printer
} from 'lucide-react';
import { openEPaperPrintWindow, downloadEPaperPDF } from '../lib/epaperDownloader';
import { translations, getLiveDateDisplay } from '../lib/i18n';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFormatFilter, setActiveFormatFilter] = useState('all');
  const [billingDuration, setBillingDuration] = useState('monthly');
  const [activeSubscription, setActiveSubscription] = useState({
    isActive: false,
    tier: 'All-Access Creator Pass',
    billing: 'monthly',
  });

  const [language, setLanguage] = useState('mr');
  const t = translations[language] || translations.mr;


  // Dynamic State powered by CMS
  const [currentSiteConfig, setCurrentSiteConfig] = useState(siteConfig);
  const [currentTickers, setCurrentTickers] = useState([
    "पुणे मेट्रो: हिंजवडी-शिवाजीनगर मेट्रो ३ चे लोकार्पण, प्रवासाचा वेळ ९० मिनिटांवरून अवघ्या १८ मिनिटांवर!",
    "महाराष्ट्र नवीन औद्योगिक धोरण २०२६: एमएसएमई उद्योगांना ५ लाखांपर्यंत बिनव्याजी कर्ज, १० लाख नव्या नोकऱ्यांचे उद्दिष्ट."
  ]);
  const [tickerSpeed, setTickerSpeed] = useState(28);
  const [currentShorts, setCurrentShorts] = useState(nexvartaShorts);
  const [currentSections, setCurrentSections] = useState(newsSections);
  const [currentPlan, setCurrentPlan] = useState(subscriptionPlan);
  const [currentLiveTv, setCurrentLiveTv] = useState({
    title: "NEXVARTA NEWS 24x7 HD",
    videoUrl: "/videos/pune-metro-footage.mp4",
    viewers: "१४,२५०+ लाइव्ह"
  });
  const [currentTrendingArticleId, setCurrentTrendingArticleId] = useState('india-2');

  const [creatorVideos, setCreatorVideos] = useState(initialCreatorVideos);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch Live Data from Admin CMS API
  useEffect(() => {
    fetch('/api/admin/cms')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.siteConfig) setCurrentSiteConfig(data.siteConfig);
          if (data.breakingTickers) setCurrentTickers(data.breakingTickers);
          if (data.tickerSpeed) setTickerSpeed(Number(data.tickerSpeed));
          if (data.nexvartaShorts) setCurrentShorts(data.nexvartaShorts);
          if (data.newsSections) setCurrentSections(data.newsSections);
          if (data.subscriptionPlan) setCurrentPlan(data.subscriptionPlan);
          if (data.creatorVideos) setCreatorVideos(data.creatorVideos);
          if (data.liveTv) setCurrentLiveTv(data.liveTv);
          if (data.trendingArticleId) setCurrentTrendingArticleId(data.trendingArticleId);
        }
      })
      .catch(err => console.log('Using local fallback for fast SSR'));
  }, []);

  // Modals
  const [readerArticle, setReaderArticle] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [selectedScriptLang, setSelectedScriptLang] = useState('mr');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAdminUploadModalOpen, setIsAdminUploadModalOpen] = useState(false);
  const [isLiveTvModalOpen, setIsLiveTvModalOpen] = useState(false);
  const [isEPaperModalOpen, setIsEPaperModalOpen] = useState(false);
  const [epaperEdition, setEpaperEdition] = useState('pune');
  const [epaperDate, setEpaperDate] = useState(() => getLiveDateDisplay('mr'));
  const [epaperDateSlug, setEpaperDateSlug] = useState(() => {
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
  });
  const [activeEPaperPage, setActiveEPaperPage] = useState(1);

  // Form State for Admin
  const [adminForm, setAdminForm] = useState({
    title: '',
    category: 'Pune News',
    format: '9:16',
    thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    videoUrl: '/videos/pune-metro-footage.mp4',
    scriptMr: '',
    scriptEn: '',
  });

  useEffect(() => {
    // Load local storage subscription
    const savedSub = localStorage.getItem('nexvarta_subscription');
    if (savedSub) {
      try {
        setActiveSubscription(JSON.parse(savedSub));
      } catch (e) {}
    }

    const savedVideos = localStorage.getItem('nexvarta_custom_videos');
    if (savedVideos) {
      try {
        const parsed = JSON.parse(savedVideos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCreatorVideos([...parsed, ...initialCreatorVideos]);
        }
      } catch (e) {}
    }

    try {
      const savedLang = localStorage.getItem('nexvarta_lang');
      if (savedLang && (savedLang === 'mr' || savedLang === 'en' || savedLang === 'hi')) {
        setLanguage(savedLang);
      }
    } catch (e) {}
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem('nexvarta_lang', lang);
    } catch (e) {}
    showToast(lang === 'mr' ? 'भाषा: मराठी निवडली' : lang === 'hi' ? 'भाषा: हिंदी चुनी गई' : 'Language: English selected');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubscribe = () => {
    const newSub = {
      isActive: true,
      tier: 'All-Access Creator Pass',
      billing: billingDuration,
      date: new Date().toISOString(),
    };
    setActiveSubscription(newSub);
    localStorage.setItem('nexvarta_subscription', JSON.stringify(newSub));
    setIsSubscriptionModalOpen(false);
    showToast('🎉 अभिनंदन! तुमचा Nexvarta All-Access पास यशस्वीरीत्या सक्रिय झाला!');
  };

  const handleDownloadBundle = (video) => {
    if (!activeSubscription.isActive) {
      setIsSubscriptionModalOpen(true);
      showToast('कृपया आधी All-Access पास ॲक्टिव्हेट करा!');
      return;
    }

    // Generate script bundle
    const scriptContent = `NEXVARTA CREATOR SYNDICATION KIT
TITLE: ${video.title}
CATEGORY: ${video.category}
FORMAT: ${video.format} (${video.resolution})
LICENSE: Commercial Royalty-Free YouTube/Instagram/TV License granted to Active Subscriber.

=========================================
मराठी व्हॉइसओव्हर स्क्रिप्ट (MARATHI SCRIPT)
=========================================
${video.scriptMarathi}

=========================================
ENGLISH VOICEOVER SCRIPT
=========================================
${video.scriptEnglish}

=========================================
CLEAN NO-WATERMARK VIDEO:
${video.previewVideo}
`;

    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}_Script_Package.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Trigger video download
    const vLink = document.createElement('a');
    vLink.href = video.previewVideo;
    vLink.download = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}_Clean.mp4`;
    vLink.target = '_blank';
    document.body.appendChild(vLink);
    vLink.click();
    document.body.removeChild(vLink);

    showToast(`🎉 "${video.title}" चे क्लीन व्हिडिओ व स्क्रिप्ट डाऊनलोड झाले!`);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    const newPkg = {
      id: `custom-${Date.now()}`,
      title: adminForm.title,
      slug: adminForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      format: adminForm.format,
      formatLabel: adminForm.format === '9:16' ? '9:16 Vertical Reel / Shorts' : '16:9 Landscape Broadcast Pack',
      category: adminForm.category,
      duration: adminForm.format === '9:16' ? '0:45 min' : '2:30 min',
      resolution: adminForm.format === '9:16' ? '1080x1920 Full HD' : '3840x2160 4K UHD',
      fps: '60 FPS',
      date: 'Just Now',
      tags: [adminForm.category, 'Breaking'],
      thumbnail: adminForm.thumbnail || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
      previewVideo: adminForm.videoUrl || '/videos/pune-metro-footage.mp4',
      scriptMarathi: adminForm.scriptMr,
      scriptEnglish: adminForm.scriptEn,
      audioByteUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      fileSize: '88.0 MB',
      downloadsCount: 0,
    };

    const updated = [newPkg, ...creatorVideos];
    setCreatorVideos(updated);
    try {
      const existing = JSON.parse(localStorage.getItem('nexvarta_custom_videos') || '[]');
      existing.unshift(newPkg);
      localStorage.setItem('nexvarta_custom_videos', JSON.stringify(existing));
    } catch (err) {}

    setIsAdminUploadModalOpen(false);
    showToast(`🚀 नवीन बातमी व व्हिडिओ पॅकेज यशस्वीरीत्या जोडले गेले!`);
  };

  const copyScriptToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('स्क्रिप्ट क्लिपबोर्डवर कॉपी झाली!');
  };

  const filteredVideos = activeFormatFilter === 'all' 
    ? creatorVideos 
    : creatorVideos.filter(v => v.format === activeFormatFilter);

  const displayedSections = activeTab === 'all'
    ? currentSections
    : currentSections.filter(s => s.slug === activeTab);

  // Derive all active published articles across all CMS news sections
  const allActiveArticles = currentSections.flatMap(sec => 
    (sec.articles || [])
      .filter(art => !art.status || art.status === 'published' || (art.status === 'scheduled' && art.scheduledFor && new Date(art.scheduledFor) <= new Date()))
      .map(art => ({
        ...art,
        sectionName: sec.name,
        sectionSlug: sec.slug,
        sectionColor: sec.color,
      }))
  );

  // Hero article (Selected by Admin as Trending from CMS, or fallback)
  const heroArticle = 
    allActiveArticles.find(a => a.id === currentTrendingArticleId) ||
    allActiveArticles.find(a => a.isTrending) ||
    allActiveArticles.find(a => a.id === 'india-2') || 
    allActiveArticles[0] || {
    id: 'india-2',
    title: 'ISRO approves Chandrayaan-4 mission, aims to send humans to Moon by 2027',
    summary: 'Union Cabinet greenlights ₹2,104 Cr lunar sample-return mission with next-gen LVM3 rocket and robotic lander.',
    badge: 'ISRO CHANDRAYAAN-4',
    author: 'Devendra Rao',
    date: 'Sep 13, 2026',
    views: '48.2k'
  };

  // Top Stories: Next 3 stories dynamically populated from CMS sections
  const topStories = allActiveArticles.filter(a => a.id !== heroArticle?.id).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Super Top Bar (Exact Screenshot Design) */}
      <div className="super-top-bar">
        <div className="container super-top-inner">
          <div className="super-top-left">
            <span suppressHydrationWarning>{t.dateDisplay}</span>
            <span className="super-top-divider">|</span>
            <span>{t.puneWeather}</span>
            <span className="super-top-divider">|</span>
            <span>{t.mumbaiWeather}</span>
          </div>
          <div className="super-top-right">
            <button 
              className="super-top-link"
              style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}
              onClick={() => setIsEPaperModalOpen(true)}
            >
              {t.ePaper}
            </button>
            <span className="super-top-divider">|</span>
            <button 
              className={`super-top-link ${language === 'mr' ? 'active-lang' : ''}`}
              style={language === 'mr' ? { fontWeight: 800, background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: 4 } : {}}
              onClick={() => changeLanguage('mr')}
            >
              मराठी
            </button>
            <span className="super-top-divider">|</span>
            <button 
              className={`super-top-link ${language === 'en' ? 'active-lang' : ''}`}
              style={language === 'en' ? { fontWeight: 800, background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: 4 } : {}}
              onClick={() => changeLanguage('en')}
            >
              English
            </button>
            <span className="super-top-divider">|</span>
            <button 
              className={`super-top-link ${language === 'hi' ? 'active-lang' : ''}`}
              style={language === 'hi' ? { fontWeight: 800, background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: 4 } : {}}
              onClick={() => changeLanguage('hi')}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* Main Header & Nav (Exact Screenshot Design) */}
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand-group" onClick={() => setActiveTab('all')}>
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
            <button 
              className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              {t.home}
            </button>
            <button 
              className={`nav-link ${activeTab === 'pune' ? 'active' : ''}`}
              onClick={() => setActiveTab('pune')}
            >
              {t.pune}
            </button>
            <button 
              className={`nav-link ${activeTab === 'maharashtra' ? 'active' : ''}`}
              onClick={() => setActiveTab('maharashtra')}
            >
              {t.maharashtra}
            </button>
            <button 
              className={`nav-link ${activeTab === 'india' ? 'active' : ''}`}
              onClick={() => setActiveTab('india')}
            >
              {t.india}
            </button>
            <button 
              className={`nav-link ${activeTab === 'tech' ? 'active' : ''}`}
              onClick={() => setActiveTab('tech')}
            >
              {t.tech}
            </button>
            <button 
              className={`nav-link ${activeTab === 'startup' ? 'active' : ''}`}
              onClick={() => setActiveTab('tech')}
            >
              {t.startup}
            </button>
            <button 
              className={`nav-link ${activeTab === 'politics' ? 'active' : ''}`}
              onClick={() => setActiveTab('maharashtra')}
            >
              {t.politics}
            </button>
            <button 
              className={`nav-link ${activeTab === 'sports' ? 'active' : ''}`}
              onClick={() => setActiveTab('sports')}
            >
              {t.sports}
            </button>
            <a 
              href="#creatorHub" 
              className="nav-link"
            >
              {t.video}
            </a>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button className="live-tv-btn" onClick={() => setIsLiveTvModalOpen(true)}>
              <span className="live-dot"></span> {t.liveTv}
            </button>
          </div>
        </div>
      </header>

      {/* Breaking News Ticker (Dynamic from Admin CMS) */}
      <div className="breaking-ticker">
        <div className="container ticker-inner">
          <span className="ticker-badge">
            <span className="ticker-pulse"></span> {t.breakingBadge}
          </span>
          <div className="ticker-marquee-wrapper">
            <div className="ticker-marquee-track" style={{ animationDuration: `${tickerSpeed || 28}s` }}>
              {/* Continuous loop 1 */}
              {(currentTickers.length > 0 ? currentTickers : [
                "ISRO approves Chandrayaan-4 mission, aims to send humans to Moon by 2027",
                "Petrol, diesel prices cut by Rs 3 after crude oil rates drop nationwide",
                "Pune Metro: Hinjewadi-Shivajinagar line inaugurated, cuts travel to 15 mins",
                "Maharashtra Industrial Policy 2026: ₹5 Lakh interest-free loans for MSMEs"
              ]).map((ticker, idx) => (
                <span key={`t1-${idx}`} className="ticker-item">
                  <span>{ticker}</span>
                  <span className="ticker-dot">•</span>
                </span>
              ))}
              {/* Continuous seamless loop 2 */}
              {(currentTickers.length > 0 ? currentTickers : [
                "ISRO approves Chandrayaan-4 mission, aims to send humans to Moon by 2027",
                "Petrol, diesel prices cut by Rs 3 after crude oil rates drop nationwide",
                "Pune Metro: Hinjewadi-Shivajinagar line inaugurated, cuts travel to 15 mins",
                "Maharashtra Industrial Policy 2026: ₹5 Lakh interest-free loans for MSMEs"
              ]).map((ticker, idx) => (
                <span key={`t2-${idx}`} className="ticker-item">
                  <span>{ticker}</span>
                  <span className="ticker-dot">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Spotlight & Top Stories Section (Dynamic from Admin CMS) */}
      <section className="hero-spotlight-section">
        <div className="container hero-spotlight-grid">
          {/* Left Column: Big Featured Hero Card (Dynamic from CMS) */}
          <Link href={`/news/${heroArticle.id}`} className="hero-featured-card">
            {heroArticle.image ? (
              <div className="hero-featured-image-wrapper">
                <img 
                  src={heroArticle.image} 
                  alt={heroArticle.title} 
                  className="hero-featured-image"
                />
                <div className="hero-featured-image-overlay"></div>
              </div>
            ) : (
              <div className="hero-featured-center">
                <div className="hero-center-circle">
                  <span className="hero-center-circle-text">
                    {heroArticle.badge || 'नेक्सवार्ता विशेष'}
                  </span>
                </div>
              </div>
            )}

            <div className="hero-trending-badge">
              {t.trending}
            </div>

            {heroArticle.image && (
              <div 
                className="hero-category-pill" 
                style={{ background: heroArticle.badgeColor || '#ea580c' }}
              >
                {heroArticle.badge || 'नेक्सवार्ता विशेष'}
              </div>
            )}

            <div className="hero-featured-overlay">
              <h2 className="hero-featured-title">
                {language === 'en' && heroArticle.titleEn ? heroArticle.titleEn : heroArticle.title}
              </h2>
              <p className="hero-featured-desc">
                {heroArticle.summary}
              </p>
              <div className="hero-featured-meta">
                <span>{heroArticle.author || 'वृत्त कक्ष'}</span>
                <span>•</span>
                <span>{heroArticle.date || t.dateDisplay}</span>
                <span>•</span>
                <span>👁️ {heroArticle.views || '४८ हजार'} {t.views}</span>
              </div>
            </div>
          </Link>

          {/* Right Column: Top Stories (Dynamic from CMS) */}
          <div className="top-stories-column">
            <div className="top-stories-header">
              <span className="top-stories-bar"></span>
              <span>{t.topStories}</span>
            </div>

            <div className="top-stories-stack">
              {topStories.map((story, index) => (
                <Link key={story.id} href={`/news/${story.id}`} className="top-story-card">
                  <div 
                    className="top-story-banner" 
                    style={{ 
                      background: story.image 
                        ? `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.65)), url(${story.image}) center/cover no-repeat`
                        : (story.badgeColor || (index === 0 ? '#ea580c' : index === 1 ? '#0284c7' : '#10b981')) 
                    }}
                  >
                    {story.badge || story.sectionName?.toUpperCase()}
                  </div>
                  <div className="top-story-body">
                    <div className="top-story-category" style={{ color: story.badgeColor || '#ea580c' }}>
                      {story.sectionName || 'बातम्या'}
                    </div>
                    <h3 className="top-story-headline">
                      {language === 'en' && story.titleEn ? story.titleEn : story.title}
                    </h3>
                    <div className="top-story-date">
                      {story.date}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nexvarta Shorts Section */}
      <section className="shorts-section">
        <div className="container">
          <div className="section-title-wrap">
            <h2 className="section-title">{language === 'en' ? 'Nexvarta Shorts' : 'नेक्सवार्ता शॉर्ट्स'}</h2>
            <div className="section-divider"></div>
          </div>
          <div className="shorts-grid">
            {currentShorts.map(short => (
              <div 
                key={short.id} 
                className="short-card"
                onClick={() => showToast(`⚡ ${short.tag}: ${language === 'en' && short.titleEn ? short.titleEn : short.title}`)}
              >
                <div className="short-banner" style={{ backgroundColor: short.bg }}>
                  {short.tag}
                </div>
                <div className="short-body">
                  {language === 'en' && short.titleEn ? short.titleEn : short.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorized News Feeds */}
      {displayedSections.map(section => (
        <section key={section.id} className="news-category-section" id={section.slug}>
          <div className="container">
            <div className="section-title-wrap">
              <h2 className="section-title">
                {language === 'en' && section.nameEn ? section.nameEn : language === 'hi' && section.nameHi ? section.nameHi : section.name}
              </h2>
              <div className="section-divider"></div>
            </div>

            {/* Articles Grid */}

            <div className="news-cards-grid">
              {section.articles
                .filter(article => {
                  if (!article.status || article.status === 'published') return true;
                  if (article.status === 'scheduled' && article.scheduledFor) {
                    return new Date(article.scheduledFor) <= new Date();
                  }
                  return false;
                })
                .map(article => (
                <article key={article.id} className="news-card">
                  {article.image && (
                    <Link href={`/news/${article.id}`} style={{ display: 'block', marginBottom: 12, position: 'relative', overflow: 'hidden', borderRadius: 8, height: 160 }}>
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      {article.watermark && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
                          नेक्सवार्ता विशेष
                        </div>
                      )}
                    </Link>
                  )}
                  <span className="news-badge" style={{ color: article.badgeColor }}>
                    {article.badge}
                  </span>
                  <Link href={`/news/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="news-headline" style={{ cursor: 'pointer' }}>
                      {language === 'en' && article.titleEn ? article.titleEn : article.title}
                    </h3>
                  </Link>
                  <p className="news-summary">
                    {article.summary}
                  </p>
                  <div className="news-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="news-date">{article.date}</span>
                      {article.views && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          👁️ {article.views}
                        </span>
                      )}
                    </div>
                    <Link 
                      href={`/news/${article.id}`}
                      className="news-read-more"
                    >
                      {t.readFull} <span>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* B2B Creator & Media Video Syndication Hub */}
      <section className="creator-hero" id="creatorHub">
        <div className="container creator-hero-content">
          <div className="creator-hero-badge">
            <Sparkles size={16} /> B2B News & Footage Syndication
          </div>
          <h2 className="creator-hero-title">Nexvarta Creator & Media Studio</h2>
          <p className="creator-hero-subtitle">
            यूट्यूबर्स, इन्स्टाग्राम न्यूज पेजेस आणि स्थानिक वृत्तवाहिन्यांसाठी रेडीमेड व्हिडिओ पॅकेजेस, ९:१६ रील्स, 1080p/4K फुटेज, मराठी-इंग्रजी स्क्रिप्ट्स आणि ऑडिओ बाईट्स.
          </p>
        </div>
      </section>

      {/* All-in-One Creator Pass Card */}
      <section className="container pricing-card-wrapper">
        <div className="all-in-one-card">
          <div className="pricing-header">
            <div>
              <span className="news-badge" style={{ color: '#ea580c' }}>
                {currentPlan.badge}
              </span>
              <h3 className="about-title">{currentPlan.name}</h3>
              <p className="about-content" style={{ marginTop: 6 }}>
                {currentPlan.description}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end' }}>
                <span className="stat-value" style={{ color: '#ea580c' }}>
                  {currentPlan.pricing[billingDuration].display}
                </span>
                <span className="stat-label">
                  {currentPlan.pricing[billingDuration].billing}
                </span>
              </div>
              <div className="pricing-duration-toggle" style={{ marginTop: 10 }}>
                <button
                  className={`duration-btn ${billingDuration === 'monthly' ? 'active' : ''}`}
                  onClick={() => setBillingDuration('monthly')}
                >
                  मासिक
                </button>
                <button
                  className={`duration-btn ${billingDuration === 'yearly' ? 'active' : ''}`}
                  onClick={() => setBillingDuration('yearly')}
                >
                  वार्षिक ({currentPlan.pricing.yearly.savings || '२ महिने मोफत'})
                </button>
              </div>
            </div>
          </div>

          <ul className="features-list">
            {currentPlan.features.map((feat, idx) => (
              <li key={idx} className="feature-item">
                <Check className="feature-check" size={20} />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
              <ShieldCheck size={20} />
              <span>१००% कमर्शियल यूट्यूब मॉनिटायझेशन सुरक्षित • त्वरित ॲक्टिव्हेशन</span>
            </div>
            <div>
              {activeSubscription.isActive ? (
                <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', fontWeight: 800, padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={20} />
                  <span>All-Access पास सक्रिय (Active Member)</span>
                </div>
              ) : (
                <button className="subscribe-cta-btn" onClick={() => setIsSubscriptionModalOpen(true)}>
                  All-Access पास मिळवा
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Video Gallery with Format Filters */}
      <section className="container" style={{ marginBottom: 50 }}>
        <div className="filter-tabs-row">
          <div className="filter-pills">
            <button 
              className={`pill-btn ${activeFormatFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFormatFilter('all')}
            >
              सर्व व्हिडिओ (All)
            </button>
            <button 
              className={`pill-btn ${activeFormatFilter === '9:16' ? 'active' : ''}`}
              onClick={() => setActiveFormatFilter('9:16')}
            >
              <Smartphone size={14} style={{ display: 'inline', marginRight: 4 }} />
              9:16 रील्स / शॉर्ट्स
            </button>
            <button 
              className={`pill-btn ${activeFormatFilter === '16:9' ? 'active' : ''}`}
              onClick={() => setActiveFormatFilter('16:9')}
            >
              <Monitor size={14} style={{ display: 'inline', marginRight: 4 }} />
              16:9 4K ब्रॉडकास्ट (YouTube/TV)
            </button>
            <button 
              className="pill-btn"
              onClick={() => setIsAdminUploadModalOpen(true)}
            >
              <PlusCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
              ॲडमिन: व्हिडिओ अपलोड करा
            </button>
          </div>
          <span className="stat-label">
            {filteredVideos.length} पॅकेजेस उपलब्ध
          </span>
        </div>

        <div className="video-grid">
          {filteredVideos.map(vid => (
            <div key={vid.id} className="video-card">
              <div 
                className={`video-thumb-container ${vid.format === '9:16' ? 'portrait' : ''}`}
                onClick={() => setPreviewVideo(vid)}
              >
                <img src={vid.thumbnail} alt={vid.title} className="video-thumb-img" />
                <span className="format-indicator-tag">
                  {vid.format === '9:16' ? '📱 9:16 REEL' : '🖥️ 16:9 4K'}
                </span>
                <span className="duration-tag">{vid.duration}</span>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <Play size={20} fill="#fff" />
                  </div>
                </div>
              </div>

              <div className="video-card-body">
                <div className="bundle-badges-row">
                  <span className="bundle-chip highlight">{vid.resolution}</span>
                  <span className="bundle-chip">मराठी/EN Script</span>
                  <span className="bundle-chip">Audio Byte</span>
                </div>

                <h4 
                  style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.35, marginBottom: 10, cursor: 'pointer' }}
                  onClick={() => setPreviewVideo(vid)}
                >
                  {vid.title}
                </h4>

                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  "{vid.scriptMarathi}"
                </p>

                <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                  <button 
                    style={{ flex: 1, background: '#f1f5f9', fontWeight: 700, fontSize: '0.85rem', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => setPreviewVideo(vid)}
                  >
                    प्रिव्ह्यू
                  </button>
                  <button 
                    style={{ flex: 1.2, background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => handleDownloadBundle(vid)}
                  >
                    <Download size={14} />
                    डाऊनलोड
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats & Trust Banner */}
      <section className="container">
        <div className="stats-banner">
          <div className="stats-grid">
            {(currentSiteConfig.stats || siteConfig.stats).map((st, i) => (
              <div key={i} className="stat-item">
                <span className="stat-value">{st.value}</span>
                <span className="stat-label">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Nexvarta */}
      <section className="container">
        <div className="about-section">
          <div className="about-header">
            <div className="about-tagline">{currentSiteConfig.about?.tagline || siteConfig.tagline}</div>
            <h3 className="about-title">{currentSiteConfig.about?.title || "About Nexvarta"}</h3>
          </div>
          <p className="about-content">
            {currentSiteConfig.about?.content || siteConfig.description}
          </p>
        </div>
      </section>

      {/* Contact Us */}
      <section className="container">
        <div className="contact-section">
          <div className="section-title-wrap" style={{ marginBottom: 0 }}>
            <h2 className="section-title">Contact Us</h2>
            <div className="section-divider"></div>
          </div>

          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon-wrapper">
                <MapPin size={24} />
              </div>
              <div className="contact-info">
                <h4>Headquarters</h4>
                <p>
                  {currentSiteConfig.contact?.address || siteConfig.contact.address}
                </p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon-wrapper">
                <Mail size={24} />
              </div>
              <div className="contact-info">
                <h4>Email Us</h4>
                <p>
                  {(currentSiteConfig.contact?.emails || siteConfig.contact.emails)
                    .filter(m => m && m.email && m.email.trim())
                    .map((m, i) => (
                      <span key={i}>
                        <a href={`mailto:${m.email}`}>{m.email}</a>
                        <br />
                      </span>
                    ))}
                </p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon-wrapper">
                <Phone size={24} />
              </div>
              <div className="contact-info">
                <h4>Call Us</h4>
                <p>
                  {((currentSiteConfig.contact?.phones?.[0]?.number) || siteConfig.contact.phones[0].number) && (
                    <>
                      Newsroom: <strong>{(currentSiteConfig.contact?.phones?.[0]?.number) || siteConfig.contact.phones[0].number}</strong>
                      <br />
                    </>
                  )}
                  {((currentSiteConfig.contact?.phones?.[1]?.number) || siteConfig.contact.phones[1]?.number) && (
                    <>
                      WhatsApp Tips: <strong>{(currentSiteConfig.contact?.phones?.[1]?.number) || siteConfig.contact.phones[1]?.number}</strong>
                      <br />
                    </>
                  )}
                  {((currentSiteConfig.contact?.phones?.[2]?.number) || siteConfig.contact.phones[2]?.number) && (
                    <>
                      Toll Free: <strong>{(currentSiteConfig.contact?.phones?.[2]?.number) || siteConfig.contact.phones[2]?.number}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <h3 className="brand-name" style={{ color: '#fff', fontSize: '1.8rem' }}>
                NEXVARTA
              </h3>
              <p className="footer-brand-desc">
                The Next Voice of News. Delivering credible, fast, and hyperlocal journalism from Pune to the world.
              </p>
            </div>

            <div className="footer-col">
              <h4>Categories</h4>
              <ul>
                <li><a href="#pune">Pune News</a></li>
                <li><a href="#maharashtra">Maharashtra</a></li>
                <li><a href="#india">India</a></li>
                <li><a href="#tech">Technology</a></li>
                <li><a href="#sports">Sports</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company & Access</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><Link href="/subscribe">{t.subscribe || 'सबस्क्रिप्शन'}</Link></li>
                <li><Link href="/dashboard">{t.dashboard || 'माझा डॅशबोर्ड'}</Link></li>
                <li><Link href="/admin">{t.admin || 'ॲडमिन'}</Link></li>
                <li><a href="mailto:advertise@nexvarta.com">Advertise</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Follow Us</h4>
              <div className="social-links-row">
                <a className="social-icon-btn" href="#">f</a>
                <a className="social-icon-btn" href="#">𝕏</a>
                <a className="social-icon-btn" href="#">📷</a>
              </div>
              <div className="download-app-box">
                <p>Download our app:</p>
                <div className="app-store-badges">
                  <span className="store-badge">Google Play</span>
                  <span className="store-badge">App Store</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span>© 2026 Nexvarta Media Pvt. Ltd. All rights reserved. | Headquarters: Pimpri, Maharashtra</span>
            <Link href="/admin" style={{ color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}>
              🔒 संपादकीय प्रवेश (Staff Login)
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal: Full Article Reader */}
      {readerArticle && (
        <div className="modal-backdrop" onClick={() => setReaderArticle(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setReaderArticle(null)}>
              <X size={20} />
            </button>
            <span className="news-badge" style={{ color: readerArticle.badgeColor }}>
              {readerArticle.badge}
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, margin: '10px 0 14px' }}>
              {readerArticle.title}
            </h2>
            <div style={{ display: 'flex', gap: 14, color: '#64748b', fontSize: '0.85rem', paddingBottom: 16, borderBottom: '1px solid #e2e8f0', marginBottom: 20 }}>
              <span>{readerArticle.author}</span>
              <span>•</span>
              <span>{readerArticle.date}</span>
              <span>•</span>
              <span>{readerArticle.readTime}</span>
            </div>
            <div 
              style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#334155', marginBottom: 28 }}
              dangerouslySetInnerHTML={{ __html: renderRichContent(readerArticle.fullContent) }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
              <button 
                style={{ background: '#25D366', color: '#fff', fontWeight: 700, padding: '10px 18px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => {
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(readerArticle.title + ' - ' + window.location.href)}`, '_blank');
                }}
              >
                <Share2 size={16} /> WhatsApp वर शेअर करा
              </button>
              <button 
                style={{ background: 'var(--color-primary)', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 8 }}
                onClick={() => setReaderArticle(null)}
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Video Preview & Download */}
      {previewVideo && (
        <div className="modal-backdrop" onClick={() => setPreviewVideo(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setPreviewVideo(null)}>
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="bundle-chip highlight">{previewVideo.formatLabel}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{previewVideo.resolution} • {previewVideo.duration}</span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 14 }}>
              {previewVideo.title}
            </h3>

            {/* Video Player */}
            <div style={{ position: 'relative', background: '#000', borderRadius: 12, overflow: 'hidden', margin: '14px 0', maxHeight: previewVideo.format === '9:16' ? 480 : 380, display: 'flex', justifyContent: 'center' }}>
              <video controls playsInline style={{ maxHeight: '100%', maxWidth: '100%' }} src={previewVideo.previewVideo} />
              {!activeSubscription.isActive && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 900, border: '2px dashed rgba(255,255,255,0.4)', padding: '6px 18px', transform: 'rotate(-25deg)', borderRadius: 6 }}>
                    NEXVARTA PREVIEW
                  </div>
                </div>
              )}
            </div>

            {/* Script Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className={`duration-btn ${selectedScriptLang === 'mr' ? 'active' : ''}`}
                    onClick={() => setSelectedScriptLang('mr')}
                  >
                    मराठी स्क्रिप्ट
                  </button>
                  <button 
                    className={`duration-btn ${selectedScriptLang === 'en' ? 'active' : ''}`}
                    onClick={() => setSelectedScriptLang('en')}
                  >
                    English Script
                  </button>
                </div>
                <button 
                  style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => copyScriptToClipboard(selectedScriptLang === 'mr' ? previewVideo.scriptMarathi : previewVideo.scriptEnglish)}
                >
                  <Copy size={13} /> कॉपी करा
                </button>
              </div>

              <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedScriptLang === 'mr' ? previewVideo.scriptMarathi : previewVideo.scriptEnglish}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button 
                style={{ flex: 2, background: 'var(--color-primary)', color: '#fff', fontWeight: 800, padding: 14, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => handleDownloadBundle(previewVideo)}
              >
                <Download size={18} />
                डाऊनलोड करा (Clean Video + Script + Audio)
              </button>
              <button 
                style={{ flex: 1, background: '#f1f5f9', fontWeight: 700, padding: 14, borderRadius: 10 }}
                onClick={() => setPreviewVideo(null)}
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Subscription Gateway (Razorpay/UPI Mock) */}
      {isSubscriptionModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsSubscriptionModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 520, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsSubscriptionModalOpen(false)}>
              <X size={20} />
            </button>
            <div style={{ width: 60, height: 60, background: '#fff7ed', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', marginBottom: 16 }}>
              <Sparkles size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>
              Nexvarta All-Access Pass
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
              यूट्यूब आणि इन्स्टासाठी दररोज रेडी व्हिडिओ पॅकेजेस आणि स्क्रिप्ट्सचा संपूर्ण ॲक्सेस मिळवा.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>प्लॅन:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                  {billingDuration === 'monthly' ? 'मासिक पास (₹799/mo)' : 'वार्षिक पास (₹6,999/yr)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', borderTop: '1px dashed #cbd5e1', paddingTop: 10 }}>
                <span style={{ fontWeight: 700 }}>एकूण देय:</span>
                <span style={{ fontWeight: 900, color: '#ea580c' }}>
                  {billingDuration === 'monthly' ? '₹799' : '₹6,999'}
                </span>
              </div>
            </div>

            {/* UPI QR Simulator */}
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: 10, padding: 14, marginBottom: 20, background: '#fff' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>स्कॅन करा (GPay, PhonePe, Paytm, BHIM UPI)</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <div style={{ width: 130, height: 130, background: 'url(https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=upi://pay?pa=nexvarta@upi&pn=Nexvarta%20Media) center/contain no-repeat' }}></div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>UPI ID: <strong>nexvarta@icici</strong></div>
            </div>

            <button 
              style={{ width: '100%', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, padding: 15, borderRadius: 10 }}
              onClick={handleSubscribe}
            >
              पेमेंट पूर्ण करा (Simulate Pay & Activate)
            </button>
          </div>
        </div>
      )}

      {/* Modal: Admin Upload Studio */}
      {isAdminUploadModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAdminUploadModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAdminUploadModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
              नवीन बातमी व व्हिडिओ पॅकेज अपलोड करा
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 18 }}>
              येथे भरलेली माहिती थेट पब्लिक पोर्टलवर बातमी म्हणून आणि क्रिएटर हबमध्ये रेडी पॅकेज म्हणून जोडली जाईल.
            </p>

            <form onSubmit={handleAdminSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="stat-label" style={{ display: 'block', marginBottom: 4 }}>बातमी / व्हिडिओ शीर्षक *</label>
                  <input 
                    type="text" 
                    required 
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8 }}
                    value={adminForm.title}
                    onChange={(e) => setAdminForm({ ...adminForm, title: e.target.value })}
                    placeholder="उदा. पुणे रिंग रोड भूसंपादनास मंजुरी..."
                  />
                </div>

                <div>
                  <label className="stat-label" style={{ display: 'block', marginBottom: 4 }}>कॅटेगरी *</label>
                  <select 
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8 }}
                    value={adminForm.category}
                    onChange={(e) => setAdminForm({ ...adminForm, category: e.target.value })}
                  >
                    <option value="Pune News">Pune News</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="India">India</option>
                    <option value="Tech News">Tech News</option>
                    <option value="Sports News">Sports News</option>
                  </select>
                </div>

                <div>
                  <label className="stat-label" style={{ display: 'block', marginBottom: 4 }}>व्हिडिओ फॉरमॅट *</label>
                  <select 
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8 }}
                    value={adminForm.format}
                    onChange={(e) => setAdminForm({ ...adminForm, format: e.target.value })}
                  >
                    <option value="9:16">9:16 रील्स / शॉर्ट्स</option>
                    <option value="16:9">16:9 4K ब्रॉडकास्ट</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="stat-label" style={{ display: 'block', marginBottom: 4 }}>मराठी रेडीमेड स्क्रिप्ट *</label>
                  <textarea 
                    rows={3} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8 }}
                    value={adminForm.scriptMr}
                    onChange={(e) => setAdminForm({ ...adminForm, scriptMr: e.target.value })}
                    placeholder="मराठी व्हॉइसओव्हर स्क्रिप्ट..."
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="stat-label" style={{ display: 'block', marginBottom: 4 }}>English Voiceover Script *</label>
                  <textarea 
                    rows={3} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8 }}
                    value={adminForm.scriptEn}
                    onChange={(e) => setAdminForm({ ...adminForm, scriptEn: e.target.value })}
                    placeholder="English voiceover script..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button 
                  type="button" 
                  style={{ background: '#f1f5f9', padding: '10px 20px', borderRadius: 8, fontWeight: 700 }}
                  onClick={() => setIsAdminUploadModalOpen(false)}
                >
                  रद्द करा
                </button>
                <button 
                  type="submit" 
                  style={{ background: '#ea580c', color: '#fff', padding: '10px 24px', borderRadius: 8, fontWeight: 800 }}
                >
                  🚀 प्रकाशित करा (Publish Now)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Live TV Stream */}
      {isLiveTvModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLiveTvModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 860, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsLiveTvModalOpen(false)}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span className="live-tv-btn" style={{ padding: '4px 12px', fontSize: '0.75rem', pointerEvents: 'none' }}>
                <span className="live-dot"></span> 24x7 LIVE BROADCAST
              </span>
              <span style={{ fontWeight: 700 }}>NEXVARTA NEWS 24x7 HD</span>
            </div>
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
              <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                <source src="/videos/pune-metro-footage.mp4" type="video/mp4" />
              </video>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem' }}>
              <span>दर्शकांची संख्या: <strong>१४,२५०+ लाइव्ह</strong></span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>● Full HD 1080p 60fps</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: E-Paper Interactive Reader & PDF Downloader */}
      {isEPaperModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEPaperModalOpen(false)}>
          <div 
            className="modal-card" 
            style={{ maxWidth: 960, width: '95%', maxHeight: '92vh', overflowY: 'auto', padding: '24px 28px', background: '#f8fafc' }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: 16, marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.5rem' }}>📰</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#002255', margin: 0 }}>
                    NEXVARTA ई-पेपर (Digital E-Paper)
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                  पुणे आणि महाराष्ट्राची अधिकृत ब्रॉडशीट डिजिटल वृत्तपत्र आवृत्ती
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    downloadEPaperPDF({ edition: epaperEdition, date: epaperDate, dateSlug: epaperDateSlug, fullEdition: true });
                    showToast(`🎉 ${epaperDate} ची संपूर्ण ४-पानी PDF डाउनलोड होत आहे...`);
                  }}
                  style={{ background: '#ea580c', color: '#fff', fontWeight: 800, fontSize: '0.875rem', padding: '10px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.35)', border: 'none' }}
                >
                  <Download size={18} /> 📥 संपूर्ण ४-पानी PDF डाउनलोड करा ({epaperDateSlug}.pdf)
                </button>

                <button
                  onClick={() => {
                    downloadEPaperPDF({ edition: epaperEdition, date: epaperDate, dateSlug: epaperDateSlug, fullEdition: false, pageNumber: activeEPaperPage });
                    showToast(`📄 पृष्ठ ${activeEPaperPage} ची PDF डाउनलोड होत आहे...`);
                  }}
                  style={{ background: '#0284c7', color: '#fff', fontWeight: 800, fontSize: '0.85rem', padding: '10px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none' }}
                >
                  <Download size={16} /> 📄 पृष्ठ {activeEPaperPage} PDF
                </button>

                <button
                  onClick={() => {
                    openEPaperPrintWindow({ edition: epaperEdition, date: epaperDate });
                    showToast('🖨️ प्रिंट / सेव्ह एज PDF विंडो उघडली!');
                  }}
                  style={{ background: '#003884', color: '#fff', fontWeight: 800, fontSize: '0.85rem', padding: '10px 18px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none' }}
                >
                  <Printer size={16} /> 🖨️ प्रिंट / Save as PDF
                </button>

                <button 
                  className="modal-close-btn" 
                  style={{ position: 'static', background: '#e2e8f0', width: 36, height: 36 }} 
                  onClick={() => setIsEPaperModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Edition, Date Archive & Multi-Page Navigation Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>📍 आवृत्ती निवडा (Edition):</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[
                      { id: 'pune', label: 'पुणे (Pune Main)' },
                      { id: 'mumbai', label: 'मुंबई (Mumbai)' },
                      { id: 'maharashtra', label: 'महाराष्ट्र (State)' },
                    ].map(ed => (
                      <button
                        key={ed.id}
                        onClick={() => { setEpaperEdition(ed.id); showToast(`आवृत्ती निवडली: ${ed.label}`); }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          fontSize: '0.825rem',
                          fontWeight: epaperEdition === ed.id ? 800 : 600,
                          background: epaperEdition === ed.id ? '#003884' : '#f1f5f9',
                          color: epaperEdition === ed.id ? '#ffffff' : '#334155',
                          cursor: 'pointer',
                          border: 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        {ed.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} />
                  <span>१००% अधिकृत डिजिटल ब्रॉडशीट PDF (सर्व ४ पृष्ठे समाविष्ट) • मोफत</span>
                </div>
              </div>

              {/* Date Archive Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>📅 तारीख निवडा (Date):</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { date: epaperDate, slug: epaperDateSlug, label: `आजची आवृत्ती (${epaperDate})` },
                    { date: '१२ सप्टेंबर २०२६', slug: '12-Sep-2026', label: 'मागील आवृत्ती (१२ सप्टें)' },
                    { date: '११ सप्टेंबर २०२६', slug: '11-Sep-2026', label: '११ सप्टेंबर २०२६' },
                    { date: '१० सप्टेंबर २०२६', slug: '10-Sep-2026', label: '१० सप्टेंबर २०२६' },
                  ].map(d => (
                    <button
                      key={d.slug}
                      onClick={() => {
                        setEpaperDate(d.date);
                        setEpaperDateSlug(d.slug);
                        showToast(`तारीख निवडली: ${d.date}`);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: '0.8rem',
                        fontWeight: epaperDateSlug === d.slug ? 800 : 600,
                        background: epaperDateSlug === d.slug ? '#ea580c' : '#f8fafc',
                        color: epaperDateSlug === d.slug ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        border: epaperDateSlug === d.slug ? 'none' : '1px solid #e2e8f0',
                        transition: 'all 0.15s'
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Page Navigation Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#002255' }}>📑 पृष्ठ निवडा (Pages 1 to 4):</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { num: 1, label: 'पृष्ठ १: मुख्य पान' },
                    { num: 2, label: 'पृष्ठ २: पुणे विशेष' },
                    { num: 3, label: 'पृष्ठ ३: महाराष्ट्र व देश' },
                    { num: 4, label: 'पृष्ठ ४: क्रीडा व संपादकीय' },
                  ].map(p => (
                    <button
                      key={p.num}
                      onClick={() => {
                        setActiveEPaperPage(p.num);
                        showToast(`पृष्ठ ${p.num} निवडले: ${p.label}`);
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        fontSize: '0.825rem',
                        fontWeight: activeEPaperPage === p.num ? 800 : 600,
                        background: activeEPaperPage === p.num ? '#003884' : '#f8fafc',
                        color: activeEPaperPage === p.num ? '#ffffff' : '#334155',
                        cursor: 'pointer',
                        border: activeEPaperPage === p.num ? 'none' : '1px solid #cbd5e1',
                        boxShadow: activeEPaperPage === p.num ? '0 2px 6px rgba(0,56,132,0.25)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Broadsheet Newspaper Page Preview Canvas / Layout */}
            <div style={{ background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: 8, padding: '24px 30px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', fontFamily: 'serif' }}>
              {/* Masthead */}
              <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: 14, marginBottom: 8 }}>
                <h1 style={{ fontFamily: 'var(--font-heading), serif', fontSize: '3.6rem', fontWeight: 900, color: '#002255', letterSpacing: 2, lineHeight: 1, margin: '0 0 6px' }}>
                  NEXVARTA
                </h1>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ea580c', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  The Next Voice of News • {activeEPaperPage === 1 ? 'पृष्ठ १: मुख्य पान (Front Page)' : activeEPaperPage === 2 ? 'पृष्ठ २: पुणे नगर व परिसर (Pune Special)' : activeEPaperPage === 3 ? 'पृष्ठ ३: महाराष्ट्र राज्य व देश (State & National)' : 'पृष्ठ ४: क्रीडा, तंत्रज्ञान व संपादकीय'}
                </div>
              </div>

              {/* Information Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #000', borderBottom: '1.5px solid #000', padding: '5px 0', fontSize: '0.8rem', fontWeight: 700, background: '#f8fafc', marginBottom: 12, fontFamily: 'sans-serif' }}>
                <span>{epaperEdition === 'mumbai' ? 'मुंबई मुख्य आवृत्ती' : epaperEdition === 'maharashtra' ? 'महाराष्ट्र राज्य आवृत्ती' : 'पुणे मुख्य आवृत्ती'}</span>
                <span>{epaperDate}</span>
                <span>वर्ष ३ • अंक २४२ • पृष्ठ {activeEPaperPage} / ४</span>
                <span>किंमत: मोफत (डिजिटल आवृत्ती)</span>
              </div>

              {/* Market & Weather Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f1f5f9', padding: '6px 10px', fontSize: '0.78rem', fontWeight: 600, borderBottom: '1px solid #cbd5e1', marginBottom: 20, fontFamily: 'sans-serif', flexWrap: 'wrap', gap: 8 }}>
                <span>🌤️ पुणे: २८°C | मुंबई: ३०°C</span>
                <span>📈 सेन्सेक्स: ८४,२५० (+४२० ▲)</span>
                <span>💰 सोने (१० ग्रॅम): ₹७६,८००</span>
                <span>⛽ पेट्रोल (पुणे): ₹१०४.२० / लिटर</span>
                <span>🌾 खरीप पीक स्थिती: समाधानकारक</span>
              </div>

              {/* PAGE 1 CONTENT */}
              {activeEPaperPage === 1 && (
                <div>
                  <div style={{ borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 20 }}>
                    <div style={{ display: 'inline-block', background: '#ea580c', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 3, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'sans-serif' }}>
                      महा-प्रकल्प लोकार्पण
                    </div>
                    <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25, marginBottom: 8, fontFamily: 'sans-serif' }}>
                      पुणे मेट्रो ३ चे लोकार्पण: हिंजवडी-शिवाजीनगर प्रवास आता अवघ्या १५ मिनिटांवर!
                    </h2>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: 16, fontFamily: 'sans-serif' }}>
                      दररोज २ लाख आयटी कर्मचाऱ्यांना वाहतूक कोंडीतून मुक्ती; २३ किमी मार्ग व २३ अत्याधुनिक स्थानके सुरू
                    </div>

                    <div className="epaper-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
                      <div style={{ position: 'relative', background: '#0f172a', borderRadius: 6, overflow: 'hidden' }}>
                        <img 
                          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80" 
                          alt="Pune Metro" 
                          style={{ width: '100%', height: 250, objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '16px 14px 8px', color: '#fff', display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 800, fontFamily: 'sans-serif' }}>
                          <span style={{ color: '#ef4444' }}>🔴 NEXVARTA EXCLUSIVE PHOTO</span>
                          <span>हिंजवडी मेट्रो स्थानक</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#334155', fontFamily: 'sans-serif', textAlign: 'justify' }}>
                        <strong>पुणे:</strong> बहुप्रतिक्षित हिंजवडी ते शिवाजीनगर मेट्रो मार्ग ३ आजपासून प्रवाशांच्या सेवेत अधिकृतपणे दाखल झाली आहे. २३ किलोमीटर लांबीचा हा संपूर्ण उन्नत मार्ग असून त्यावर २३ अत्याधुनिक मेट्रो स्थानके उभारण्यात आली आहेत.
                        <br /><br />
                        या मेट्रोमुळे दररोज सकाळी व संध्याकाळी होणारी भीषण वाहतूक कोंडी इतिहासजमा होणार असून, पूर्वीचा दीड तासांचा प्रवास अवघ्या १५ ते १८ मिनिटांवर आला आहे. मेट्रो स्थानकांपासून हिंजवडी आयटी पार्कच्या अंतर्गत कंपन्यांपर्यंत थेट इलेक्ट्रिक फीडर बस सेवाही एकाच वेळी कार्यान्वित झाली आहे.
                      </div>
                    </div>
                  </div>

                  <div className="epaper-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 18, fontFamily: 'sans-serif' }}>
                    <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: 16 }}>
                      <span style={{ background: '#1d4ed8', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 2 }}>इस्रो अंतराळ मोहीम</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 6px', lineHeight: 1.3 }}>
                        चांद्रयान-४ ची रूपरेषा जाहीर: चंद्रावरून नमुने आणणार
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                        केंद्रीय मंत्रिमंडळाने ₹२,१०४ कोटी मंजूर केले. एलव्हीएम-३ रॉकेट आणि स्वदेशी रोव्हर दक्षिण ध्रुवावर उतरणार.
                      </p>
                    </div>

                    <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: 16 }}>
                      <span style={{ background: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 2 }}>औद्योगिक धोरण</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 6px', lineHeight: 1.3 }}>
                        एमएसएमई उद्योगांना ५ लाखांपर्यंत बिनव्याजी कर्ज
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                        १० लाख नव्या नोकऱ्यांचे उद्दिष्ट. वीज सवलत व महिला उद्योजकांसाठी विशेष प्रोत्साहन निधी योजना.
                      </p>
                    </div>

                    <div>
                      <span style={{ background: '#7c3aed', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 2 }}>गणेशोत्सव सुरक्षा</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 6px', lineHeight: 1.3 }}>
                        पुण्यात २,००० मंडळांची तयारी; AI द्वारे सुरक्षा
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                        १,२०० हाय-डेफिनिशन कॅमेरे आणि गर्दी नियंत्रणासाठी ड्रोन मॉनिटरिंग ग्रिड कार्यान्वित करण्यात आली.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2 CONTENT (Pune City) */}
              {activeEPaperPage === 2 && (
                <div>
                  <div style={{ borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 20 }}>
                    <div style={{ display: 'inline-block', background: '#0284c7', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 3, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'sans-serif' }}>
                      पुणे नगर व विकास विशेष
                    </div>
                    <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25, marginBottom: 8, fontFamily: 'sans-serif' }}>
                      पुणे रिंग रोड आणि चांदणी चौक भुयारी मार्ग काम अंतिम टप्प्यात; नोव्हेंबरपासून खुला
                    </h2>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: 16, fontFamily: 'sans-serif' }}>
                      पश्चिम व पूर्व पुण्याचे अंतर ४० मिनिटांवर येणार; अवजड वाहने थेट शहराबाहेरून वळवणार
                    </div>

                    <div className="epaper-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
                      <div style={{ position: 'relative', background: '#0f172a', borderRadius: 6, overflow: 'hidden' }}>
                        <img 
                          src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80" 
                          alt="Pune Ring Road" 
                          style={{ width: '100%', height: 250, objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '16px 14px 8px', color: '#fff', display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 800, fontFamily: 'sans-serif' }}>
                          <span style={{ color: '#38bdf8' }}>🛣️ MSRDC INFRASTRUCTURE</span>
                          <span>चांदणी चौक जंक्शन</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#334155', fontFamily: 'sans-serif', textAlign: 'justify' }}>
                        <strong>पुणे:</strong> महाराष्ट्र राज्य रस्ते विकास महामंडळाने (MSRDC) जाहीर केले आहे की रिंग रोडच्या पूर्व व पश्चिम पॅकेजचे काम ८८% पूर्ण झाले आहे. यामुळे कात्रज, सिंहगड रोड, बाणेर व वाघोली दरम्यानचा महामार्ग थेट जोडला जाईल.
                        <br /><br />
                        शहरांतर्गत प्रवेश न करता महामार्गावरील लाखो वाहने थेट पुणे शहराबाहेरून मार्गस्थ होतील. चांदणी चौक परिसरातील नवीन उड्डाणपूल व भुयारी मार्गांचे डांबरीकरण अंतिम टप्प्यात असून दिवाळीपूर्वी चाचणी यशस्वी झाली आहे.
                      </div>
                    </div>
                  </div>

                  <div className="epaper-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 18, fontFamily: 'sans-serif' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: 16, borderRadius: 6 }}>
                      <h4 style={{ color: '#003884', marginBottom: 8, fontSize: '1.1rem', fontWeight: 800 }}>💼 हिंजवडी फेज-३: ५००० नव्या आयटी नोकऱ्या</h4>
                      <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
                        एमआयडीसीने नवीन एआय आणि क्लाउड कॉम्प्युटिंग हबचे काम पूर्ण केले आहे. चार आघाडीच्या बहुराष्ट्रीय कंपन्या पुढील २ महिन्यांत कॅम्पस ड्राइव्ह सुरू करणार असून फ्रेशर्सना मोठ्या संधी उपलब्ध होणार आहेत.
                      </p>
                    </div>

                    <div style={{ background: '#0f172a', color: '#fff', padding: 16, borderRadius: 6 }}>
                      <h4 style={{ color: '#38bdf8', marginBottom: 8, fontSize: '1.1rem', fontWeight: 800 }}>🌊 मुळा-मुठा नदी संवर्धन प्रकल्प वेगाने</h4>
                      <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                        जायका (JICA) प्रकल्पांतर्गत ११ सांडपाणी प्रक्रिया प्रकल्प (STP) कार्यान्वित होत असून नदीचे ९०% पाणी पूर्ण शुद्ध केले जाईल. संगमवाडी ते कल्याणीनगर नदीकाठ सायकल ट्रॅकचे काम पूर्णत्वाकडे.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 3 CONTENT (Maharashtra & National) */}
              {activeEPaperPage === 3 && (
                <div>
                  <div style={{ borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 20 }}>
                    <div style={{ display: 'inline-block', background: '#16a34a', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 3, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'sans-serif' }}>
                      राज्य शासन विशेष निर्णय
                    </div>
                    <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25, marginBottom: 8, fontFamily: 'sans-serif' }}>
                      शेतकऱ्यांना मोठा दिलासा: कर्जमाफी टप्पा २ जाहीर; १२ लाख शेतकऱ्यांना थेट लाभ
                    </h2>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: 16, fontFamily: 'sans-serif' }}>
                      पीक कर्ज व आपत्ती अनुदान थेट बँक खात्यात वर्ग होणार • १ ऑक्टोबरपासून वितरण सुरू
                    </div>

                    <div className="epaper-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
                      <div style={{ position: 'relative', background: '#0f172a', borderRadius: 6, overflow: 'hidden' }}>
                        <img 
                          src="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800&q=80" 
                          alt="Agriculture Maharashtra" 
                          style={{ width: '100%', height: 250, objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '16px 14px 8px', color: '#fff', display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 800, fontFamily: 'sans-serif' }}>
                          <span style={{ color: '#4ade80' }}>🌾 कृषी विभाग घोषणा</span>
                          <span>मंत्रालय, मुंबई</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#334155', fontFamily: 'sans-serif', textAlign: 'justify' }}>
                        <strong>मुंबई:</strong> राज्य मंत्रिमंडळाने आज विशेष बैठकीत महात्मा ज्योतिराव फुले शेतकरी कर्जमुक्ती योजनेच्या दुसऱ्या टप्प्याला मंजुरी दिली. यामध्ये नियमित कर्जफेड करणाऱ्या शेतकऱ्यांना ₹५०,००० प्रोत्साहनपर अनुदान आणि अतिवृष्टीग्रस्त शेतकऱ्यांचे २ लाखांपर्यंतचे थकीत कर्ज माफ करण्यात आले आहे.
                        <br /><br />
                        राज्यातील सुमारे १२ लाख शेतकरी कुटुंबांना याचा थेट फायदा होणार असून, आधार संलग्न बँक खात्यात थेट डीबीटी (DBT) द्वारे रक्कम वर्ग होणार आहे. कोणत्याही दलालांशिवाय ही पारदर्शक प्रक्रिया राबवली जाईल.
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#002255', color: '#fff', padding: 20, borderRadius: 8, marginBottom: 18, fontFamily: 'sans-serif' }}>
                    <h3 style={{ color: '#fde047', marginBottom: 8, fontSize: '1.2rem', fontWeight: 800 }}>🛣️ मुंबई-पुणे एक्सप्रेसवे 'मिसिंग लिंक' बोगद्याचे काम पूर्ण; ३० मिनिटे वाचणार!</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#e2e8f0' }}>
                      आशियातील सर्वात रुंद बोगदा अंतिम टप्प्यात असून दिवाळीपूर्वी अधिकृत लोकार्पण होणार आहे. खंडाळा घाटातील अवघड वळणे आणि भीषण वाहतूक कोंडी कायमची टळणार असून मुंबई ते पुणे अंतर फक्त ६० मिनिटांवर येणार आहे.
                    </p>
                  </div>
                </div>
              )}

              {/* PAGE 4 CONTENT (Sports & Editorial) */}
              {activeEPaperPage === 4 && (
                <div>
                  <div style={{ borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 20 }}>
                    <div style={{ display: 'inline-block', background: '#b91c1c', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 3, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'sans-serif' }}>
                      क्रीडा व क्रिकेट विश्व
                    </div>
                    <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25, marginBottom: 8, fontFamily: 'sans-serif' }}>
                      आयपीएल २०२७ मेगा लिलाव: ऋषभ पंत ३२ कोटी रुपयांना मुंबई इंडियन्सकडे!
                    </h2>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: 16, fontFamily: 'sans-serif' }}>
                      आयपीएल इतिहासातील सर्वकालीन विक्रम मोडीत • १५ देशांतील खेळाडूंवर कोट्यवधींचा वर्षाव
                    </div>

                    <div className="epaper-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
                      <div style={{ position: 'relative', background: '#0f172a', borderRadius: 6, overflow: 'hidden' }}>
                        <img 
                          src="https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=800&q=80" 
                          alt="Cricket Auction" 
                          style={{ width: '100%', height: 250, objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '16px 14px 8px', color: '#fff', display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 800, fontFamily: 'sans-serif' }}>
                          <span style={{ color: '#f87171' }}>🏏 CRICKET MEGA AUCTION</span>
                          <span>दुबई</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#334155', fontFamily: 'sans-serif', textAlign: 'justify' }}>
                        <strong>दुबई:</strong> आयपीएल २०२७ च्या मेगा लिलावात आज भारतीय यष्टिरक्षक-फलंदाज ऋषभ पंतने इतिहास रचला. तीव्र चुरशीनंतर मुंबई इंडियन्स संघाने विक्रमी ३२ कोटी रुपयांची बोली लावून त्याला आपल्या ताफ्यात सामील केले.
                        <br /><br />
                        या लिलावात महाराष्ट्राच्या ३ युवा वेगवान गोलंदाजांनाही प्रत्येकी ६ कोटींपेक्षा जास्त बोली मिळाली असून देशांतर्गत खेळाडूंचे कौतुक होत आहे.
                      </div>
                    </div>
                  </div>

                  <div className="epaper-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 18, fontFamily: 'sans-serif' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: 16, borderRadius: 6 }}>
                      <h4 style={{ color: '#003884', marginBottom: 8, fontSize: '1.1rem', fontWeight: 800 }}>📝 नेक्सवार्ता अग्रलेख: महाराष्ट्राची मेट्रो क्रांती</h4>
                      <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
                        पुणे आणि मुंबईच्या मेट्रो नेटवर्कमुळे दैनंदिन जनजीवन गतिमान होत आहे. प्रदूषणमुक्त सार्वजनिक वाहतूक हीच शाश्वत विकासाची खरी गुरुकिल्ली आहे.
                      </p>
                    </div>

                    <div style={{ background: '#002255', color: '#fff', padding: 16, borderRadius: 6 }}>
                      <h4 style={{ color: '#fde047', marginBottom: 8, fontSize: '1.1rem', fontWeight: 800 }}>⚡ टाटा मोटर्सचा सॉलिड-स्टेट बॅटरी शोध</h4>
                      <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                        पुण्यातील आर&डी केंद्रात विकसित झाली १० मिनिटांत चार्ज होणारी आणि १००० किमी रेंज देणारी ईव्ही बॅटरी. २०२७ च्या अखेरीस प्रत्यक्ष उत्पादन सुरू होणार.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Seal & Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'sans-serif', flexWrap: 'wrap', gap: 10 }}>
                <span>संपादक: प्रशांत पाटील | आर.एन.आय. क्र.: MAHMAR/2024/89124 | पृष्ठ {activeEPaperPage} / ४</span>
                <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #10b981', fontWeight: 800, padding: '3px 10px', borderRadius: 99 }}>
                  ✓ अधिकृत डिजिटल पडताळणीकृत ई-पेपर आवृत्ती
                </span>
                <span>www.nexvarta.com • मोफत डिजिटल आवृत्ती</span>
              </div>
            </div>

            {/* Bottom Quick Download Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                💡 <strong>टीप:</strong> <strong>"संपूर्ण ४-पानी PDF"</strong> बटणावर क्लिक केल्यास सर्व ४ पृष्ठे एकाच PDF फाईलमध्ये सेव्ह होतात.
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button 
                  style={{ background: '#0284c7', color: '#fff', fontWeight: 800, fontSize: '0.85rem', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', border: 'none' }}
                  onClick={() => {
                    downloadEPaperPDF({ edition: epaperEdition, date: epaperDate, dateSlug: epaperDateSlug, fullEdition: false, pageNumber: activeEPaperPage });
                    showToast(`📄 पृष्ठ ${activeEPaperPage} ची PDF डाउनलोड होत आहे!`);
                  }}
                >
                  📄 पृष्ठ {activeEPaperPage} PDF
                </button>
                <button 
                  style={{ background: '#ea580c', color: '#fff', fontWeight: 800, fontSize: '0.85rem', padding: '10px 22px', borderRadius: 8, cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}
                  onClick={() => {
                    downloadEPaperPDF({ edition: epaperEdition, date: epaperDate, dateSlug: epaperDateSlug, fullEdition: true });
                    showToast(`🎉 संपूर्ण ४-पानी PDF (${epaperDateSlug}) डाउनलोड होत आहे!`);
                  }}
                >
                  📥 संपूर्ण ४-पानी PDF डाउनलोड करा
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0f172a', color: '#fff', padding: '14px 22px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', zIndex: 9999 }}>
          <Check size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
