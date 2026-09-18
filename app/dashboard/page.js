'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Check, 
  ShieldCheck, 
  Download, 
  Video, 
  Film, 
  Newspaper, 
  FileText, 
  Printer, 
  ExternalLink, 
  Copy, 
  Clock, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  QrCode, 
  Users, 
  Phone, 
  Send, 
  RotateCcw, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  Building2,
  Tv,
  Layers,
  Radio,
  Sliders,
  ChevronRight,
  UserCheck,
  Lock,
  User,
  LogOut,
  EyeOff
} from 'lucide-react';
import { downloadEPaperPDF, openEPaperPrintWindow } from '../../lib/epaperDownloader';

export default function SubscriberDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [siteLogoUrl, setSiteLogoUrl] = useState('');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'epaper' | 'license' | 'billing' | 'team' | 'support'
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | '9:16' | '16:9'
  const [searchQuery, setSearchQuery] = useState('');

  // Subscriber Session State
  const [subscriber, setSubscriber] = useState({
    name: 'सचिन गायकवाड',
    email: 'sachin.g@gmail.com',
    phone: '+91 98765 43210',
    planId: 'creator_agency_pass',
    planName: 'ऑल-ॲक्सेस क्रिएटर, मीडिया व कॉर्पोरेट पास',
    badge: 'ALL-ACCESS PRO SUBSCRIBER',
    licenseKey: 'NV-LIC-2026-98124',
    invoiceNumber: 'NV-INV-2026-482190',
    validUntil: '१७ सप्टेंबर २०२७ (३६४ दिवस शिल्लक)',
    amountPaid: 6999,
    billingCycle: 'yearly',
    gstin: '27AABCN8912P1ZX',
    status: 'active'
  });

  // CMS Videos
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Selected Video for In-depth Preview & Script copy
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedScriptLang, setSelectedScriptLang] = useState('mr');

  // EPaper Download States
  const [epaperEdition, setEpaperEdition] = useState('pune');
  const [epaperDate, setEpaperDate] = useState('१३ सप्टेंबर २०२६');
  const [epaperDateSlug, setEpaperDateSlug] = useState('13-Sep-2026');

  // Team Invite State
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'सचिन गायकवाड (Owner)', role: 'ॲडमिन / मुख्य क्रिएटर', device: 'MacBook Pro • पुणे', status: 'Active' },
    { id: 2, name: 'रोहन कुलकर्णी (Editor)', role: 'व्हिडिओ एडिटर', device: 'Windows Studio PC • मुंबई', status: 'Active' },
    { id: 3, name: 'प्रियांका माने (Content Writer)', role: 'स्क्रिप्ट रायटर', device: 'iPhone 15 Pro • पुणे', status: 'Active' },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');

  // Custom News Footage Request State
  const [footageRequest, setFootageRequest] = useState({
    topic: '',
    location: 'पुणे',
    format: '9:16',
    notes: ''
  });

  // Load subscriber session and CMS data
  useEffect(() => {
    try {
      const auth = localStorage.getItem('nexvarta_subscriber_auth');
      const saved = localStorage.getItem('nexvarta_user_subscription');
      if (auth === 'true' || saved) {
        setIsAuthenticated(true);
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        setSubscriber(prev => ({
          ...prev,
          name: parsed.customerName || prev.name,
          phone: parsed.customerPhone || prev.phone,
          planName: parsed.planName || prev.planName,
          planId: parsed.planId || prev.planId,
          validUntil: parsed.validUntil ? `${parsed.validUntil} (सक्रिय)` : prev.validUntil,
          invoiceNumber: parsed.invoiceNumber || prev.invoiceNumber,
          licenseKey: parsed.licenseKey || prev.licenseKey,
          amountPaid: parsed.amount || prev.amountPaid,
          billingCycle: parsed.billingCycle || prev.billingCycle,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthChecking(false);
    }

    // Load videos & site config
    async function loadCmsData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/cms');
        if (res.ok) {
          const json = await res.json();
          if (json.creatorVideos && json.creatorVideos.length > 0) {
            setVideos(json.creatorVideos);
          }
          if (json.siteConfig?.logoUrl) {
            setSiteLogoUrl(json.siteConfig.logoUrl);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCmsData();
  }, []);

  const handleSubscriberLogin = (e) => {
    e?.preventDefault();
    setLoginError('');

    const inputVal = loginInput.trim();
    const passVal = passwordInput.trim();

    if (!inputVal) {
      setLoginError('कृपया आपला नोंदणीकृत ईमेल, मोबाईल किंवा परवाना क्रमांक प्रविष्ट करा.');
      return;
    }

    // Valid if matches subscriber email/phone/license or demo
    const isDemo = inputVal.toLowerCase() === 'sachin.g@gmail.com' || 
                   inputVal.toLowerCase() === 'admin' || 
                   inputVal.includes('98765') || 
                   inputVal.toUpperCase().startsWith('NV-LIC') ||
                   inputVal.toLowerCase().includes('@');

    const isValidPass = passVal === '1234' || passVal === 'Nexvarta@2026' || passVal === 'admin123' || passVal.length >= 4;

    if (isDemo && isValidPass) {
      try {
        localStorage.setItem('nexvarta_subscriber_auth', 'true');
        if (inputVal.includes('@')) {
          setSubscriber(prev => ({ ...prev, email: inputVal }));
        }
      } catch (err) {}
      setIsAuthenticated(true);
      setLoginError('');
      showToast('🎉 सबस्क्रायबर लॉगिन यशस्वी! मेंबर हबमध्ये आपले स्वागत आहे.');
    } else {
      setLoginError('❌ चुकीचा आयडी किंवा पासवर्ड! कृपया योग्य क्रेडेंशियल्स प्रविष्ट करा.');
    }
  };

  const handleDemoLogin = () => {
    try {
      localStorage.setItem('nexvarta_subscriber_auth', 'true');
    } catch (err) {}
    setIsAuthenticated(true);
    setLoginError('');
    showToast('🎉 प्रो मेंबर लॉगिन यशस्वी!');
  };

  const handleSubscriberLogout = () => {
    if (confirm('तुम्हाला मेंबर डॅशबोर्डमधून बाहेर पडायचे (Logout) आहे का?')) {
      try {
        localStorage.removeItem('nexvarta_subscriber_auth');
        localStorage.removeItem('nexvarta_user_subscription');
      } catch (err) {}
      setIsAuthenticated(false);
      setLoginInput('');
      setPasswordInput('');
      showToast('🚪 तुम्ही यशस्वीरीत्या लॉगआउट झाला आहात.');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text, label = 'माहिती') => {
    navigator.clipboard.writeText(text);
    showToast(`📋 ${label} क्लिपबोर्डवर कॉपी झाला!`);
  };

  // Filtered Videos
  const filteredVideos = videos.filter(v => {
    const matchesFormat = formatFilter === 'all' || v.format === formatFilter;
    const matchesSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFormat && matchesSearch;
  });

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1d', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔒</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>सबस्क्रायबर प्रमाणीकरण तपासत आहे...</h3>
        </div>
      </div>
    );
  }

  // If not authenticated, render Subscriber Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'radial-gradient(ellipse at top, #1e1b4b, #0a0f1d)', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(234, 88, 12, 0.15)',
          color: '#ffffff'
        }}>
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            {siteLogoUrl ? (
              <img 
                src={siteLogoUrl} 
                alt="Logo" 
                style={{ height: 48, maxWidth: 200, objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} 
              />
            ) : (
              <div style={{
                width: 64,
                height: 64,
                margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(234, 88, 12, 0.35)'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>N</span>
              </div>
            )}
            <div style={{ display: 'inline-block', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', border: '1px solid rgba(234, 88, 12, 0.4)', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '99px', marginBottom: 10, letterSpacing: 0.5 }}>
              💎 अधिकृत मेंबर व सबस्क्रायबर हब
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 6px 0', color: '#ffffff' }}>
              NEXVARTA MEMBER LOGIN
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              4K व्हिडिओ फुटेज, ई-पेपर डाऊनलोड्स आणि व्यावसायिक परवाना वापरण्यासाठी कृपया लॉगिन करा.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubscriberLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email / Phone / License */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                नोंदणीकृत ईमेल, मोबाईल किंवा परवाना क्रमांक
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: 14, color: '#64748b' }} />
                <input 
                  type="text"
                  placeholder="उदा. sachin.g@gmail.com किंवा 98765..."
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '12px 14px 12px 42px',
                    color: '#ffffff',
                    fontSize: '0.925rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                पासवर्ड (किंवा OTP '1234')
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, color: '#64748b' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="आपला पासवर्ड किंवा 1234 टाका"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '12px 42px 12px 42px',
                    color: '#ffffff',
                    fontSize: '0.925rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              style={{
                marginTop: 6,
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '13px 20px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              <Lock size={16} /> मेंबर लॉगिन करा (Login to Hub)
            </button>

            {/* Quick 1-Click Demo Login */}
            <button
              type="button"
              onClick={handleDemoLogin}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#93c5fd',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              ⚡ 1-क्लिक प्रो डेमो सबस्क्रायबर लॉगिन
            </button>
          </form>

          {/* Links */}
          <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link 
              href="/subscribe"
              style={{ 
                color: '#f59e0b', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              💎 नवीन सबस्क्रिप्शन हवे आहे? प्लॅन्स पहा →
            </Link>
            <Link 
              href="/"
              style={{ 
                color: '#94a3b8', 
                fontSize: '0.825rem', 
                textDecoration: 'none'
              }}
            >
              ← मुख्य वृत्तपोर्टलवर परत जा
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* =========================================================================
          TOP SUBSCRIBER HEADER
          ========================================================================= */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          
          {/* Logo & Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              {siteLogoUrl ? (
                <img 
                  src={siteLogoUrl} 
                  alt="Logo" 
                  style={{ height: 38, maxWidth: 140, objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 14px rgba(234,88,12,0.4)' }}>
                  N
                </div>
              )}
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: 1.5, color: '#ffffff', lineHeight: 1.1 }}>
                  NEXVARTA <span style={{ color: '#ea580c', fontSize: '0.85rem', fontWeight: 800, background: 'rgba(234,88,12,0.15)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(234,88,12,0.3)' }}>MEMBER HUB</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: 0.5 }}>
                  अधिकृत सबस्क्रायबर डॅशबोर्ड • {subscriber.name}
                </div>
              </div>
            </Link>

            <div style={{ height: 26, width: 1, background: 'rgba(255,255,255,0.12)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
              PRO SUBSCRIBER
            </div>
          </div>

          {/* User Profile & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                {subscriber.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>
                लायसन्स: {subscriber.licenseKey}
              </div>
            </div>

            <Link 
              href="/subscribe"
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              💎 प्लॅन्स पहा
            </Link>

            <Link 
              href="/"
              style={{ color: '#ea580c', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 800, padding: '7px 14px', borderRadius: 8, background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.25)' }}
            >
              🌐 मुख्य वृत्तपोर्टल
            </Link>

            <button 
              onClick={handleSubscriberLogout}
              style={{ background: '#dc2626', color: '#fff', fontSize: '0.8rem', fontWeight: 700, padding: '7px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(220,38,38,0.3)' }}
              title="लॉगआउट करा"
            >
              <LogOut size={14} /> बाहेर पडा
            </button>
          </div>

        </div>
      </header>

      {/* =========================================================================
          SUBSCRIBER ACTIVE STATUS HERO STRIP
          ========================================================================= */}
      <section style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1d 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            
            {/* Card 1: Active Membership */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(234,88,12,0.15)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>सक्रिय सदस्यत्व (Plan)</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', margin: '2px 0', lineHeight: 1.3 }}>
                  {subscriber.planName}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>✓ अमर्याद 4K डाऊनलोड्स अनलॉक</span>
              </div>
            </div>

            {/* Card 2: Validity */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>सदस्यत्व वैधता (Validity)</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', margin: '2px 0' }}>
                  {subscriber.validUntil}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>स्वयंचलित नूतनीकरण: सक्रिय</span>
              </div>
            </div>

            {/* Card 3: License Key */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>कमर्शियल कॉपीराइट लायसन्स</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#38bdf8', margin: '2px 0' }}>
                  {subscriber.licenseKey}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>✓ यूट्यूब ॲडसेन्स १००% सुरक्षित</span>
              </div>
            </div>

            {/* Card 4: Official Tax Invoice */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(168,85,247,0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>जीएसटी कर पावती (Tax Invoice)</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', margin: '2px 0' }}>
                  ₹{subscriber.amountPaid.toLocaleString('en-IN')} भरले
                </div>
                <button
                  onClick={() => setActiveTab('billing')}
                  style={{ background: 'transparent', border: 'none', padding: 0, color: '#c084fc', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  पावती डाऊनलोड करा →
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          TAB NAVIGATION
          ========================================================================= */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 68, zIndex: 90 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {[
            { id: 'videos', label: '🎬 4K फुटेज व रील्स हब (Video Library)', badge: 'No Watermark' },
            { id: 'epaper', label: '📰 दैनिक ई-पेपर ४-पानी PDF (E-Paper Archive)', badge: 'Daily HD' },
            { id: 'license', label: '🛡️ कमर्शियल लायसन्स सर्टिफिकेट (Copyright License)' },
            { id: 'billing', label: '📄 GST कर पावती व बिलींग (Tax Invoice)' },
            { id: 'team', label: '👥 टीम मल्टी-लॉगिन व्यवस्थापन (Team Access)', badge: '3/10 Active' },
            { id: 'support', label: '💬 २४x७ प्राधान्य संपादकीय हेल्पडेस्क (Priority Desk)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 18px',
                fontSize: '0.86rem',
                fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #ea580c' : '3px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 10,
                  background: activeTab === tab.id ? '#ea580c' : 'rgba(255,255,255,0.08)',
                  color: '#ffffff'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* =====================================================================
            TAB 1: 4K VIDEO FOOTAGE & REELS HUB (100% UNLOCKED NO-WATERMARK)
            ===================================================================== */}
        {activeTab === 'videos' && (
          <div>
            
            {/* Header Strip & Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24, background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>फॉरमॅट:</span>
                {[
                  { id: 'all', label: 'सर्व फुटेज' },
                  { id: '9:16', label: '📱 9:16 रील्स / शॉर्ट्स (Vertical)' },
                  { id: '16:9', label: '🖥️ 16:9 4K ब्रॉडकास्ट (Landscape)' },
                ].map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormatFilter(fmt.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      fontWeight: formatFilter === fmt.id ? 800 : 600,
                      background: formatFilter === fmt.id ? '#ea580c' : 'rgba(255,255,255,0.06)',
                      color: formatFilter === fmt.id ? '#ffffff' : '#cbd5e1',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800, background: 'rgba(16,185,129,0.12)', padding: '4px 10px', borderRadius: 6 }}>
                  ⚡ Cloudflare R2 हाय-स्पीड CDN • Zero Watermark
                </span>
              </div>

            </div>

            {/* Video Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {filteredVideos.map(vid => (
                <div 
                  key={vid.id}
                  style={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                  }}
                >
                  
                  {/* Thumbnail & Badges */}
                  <div style={{ position: 'relative', height: vid.format === '9:16' ? 220 : 190, background: '#000', overflow: 'hidden' }}>
                    <img 
                      src={vid.thumbnail || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"} 
                      alt={vid.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)' }}></div>
                    
                    {/* Format Badge */}
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                      <span style={{
                        background: vid.format === '9:16' ? '#ea580c' : '#0284c7',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 4
                      }}>
                        {vid.format === '9:16' ? '📱 9:16 REEL' : '🖥️ 16:9 4K'}
                      </span>
                      <span style={{ background: '#15803d', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                        ✓ UNLOCKED
                      </span>
                    </div>

                    <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {vid.duration || '0:50 min'}
                    </div>

                    {/* Preview Trigger */}
                    <button
                      onClick={() => setSelectedVideo(vid)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        margin: 'auto',
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'rgba(234,88,12,0.95)',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 0 16px rgba(234,88,12,0.6)'
                      }}
                    >
                      <Eye size={22} fill="#fff" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                      {vid.title}
                    </h3>

                    {/* Technical Specs Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                        {vid.resolution || '1080x1920 Full HD'}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                        {vid.fps || '60 FPS'}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                        {vid.fileSize || '65 MB'}
                      </span>
                    </div>

                    {/* Ready Script Snippet */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px', fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.7rem' }}>तयार व्हॉइसओव्हर हुक:</span>
                        <button
                          onClick={() => copyToClipboard(vid.scriptMarathi, 'मराठी स्क्रिप्ट')}
                          style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          कॉपी करा
                        </button>
                      </div>
                      {vid.scriptMarathi ? vid.scriptMarathi.substring(0, 110) + '...' : 'पुणे आणि महाराष्ट्राची ताजी बातमी...'}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button
                        onClick={() => setSelectedVideo(vid)}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.15)',
                          padding: '10px 12px',
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <Eye size={14} /> प्रिव्ह्यू व स्क्रिप्ट
                      </button>

                      <button
                        onClick={() => {
                          showToast(`📥 ${vid.title} चे वॉटरमार्क-फ्री 4K बंडल डाऊनलोड होत आहे...`);
                          const link = document.createElement('a');
                          link.href = vid.previewVideo || '#';
                          link.download = `${vid.slug || 'nexvarta_pro_footage'}.mp4`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        style={{
                          background: '#ea580c',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 12px',
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          boxShadow: '0 2px 10px rgba(234,88,12,0.3)'
                        }}
                      >
                        <Download size={14} /> थेट 4K डाऊनलोड
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 2: DAILY E-PAPER 4-PAGE COMPLETE PDF DOWNLOADER
            ===================================================================== */}
        {activeTab === 'epaper' && (
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '30px 32px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 18, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(2,132,199,0.15)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Newspaper size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      दैनिक ई-पेपर ४-पानी अधिकृत ब्रॉडशीट PDF
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
                      दररोज सकाळी ५ वाजता प्रकाशित होणारी मूळ मुद्रित आवृत्ती • संपूर्ण ४ पाने HD Print Quality PDF
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => {
                      downloadEPaperPDF({ edition: epaperEdition, date: epaperDate, dateSlug: epaperDateSlug, fullEdition: true });
                      showToast(`🎉 ${epaperDate} ची संपूर्ण ४-पानी PDF डाऊनलोड होत आहे...`);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '11px 22px',
                      borderRadius: 10,
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(234,88,12,0.4)'
                    }}
                  >
                    <Download size={18} /> 📥 संपूर्ण ४-पानी PDF डाऊनलोड करा
                  </button>
                </div>
              </div>

              {/* Edition & Date Archive Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28, background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                
                {/* Edition */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: 8 }}>
                    📍 आवृत्ती निवडा (Select Edition):
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { id: 'pune', label: 'पुणे नगर (Pune)' },
                      { id: 'mumbai', label: 'मुंबई (Mumbai)' },
                      { id: 'maharashtra', label: 'महाराष्ट्र (State)' },
                    ].map(ed => (
                      <button
                        key={ed.id}
                        onClick={() => setEpaperEdition(ed.id)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          fontWeight: epaperEdition === ed.id ? 800 : 600,
                          background: epaperEdition === ed.id ? '#003884' : '#0a0f1d',
                          color: '#fff',
                          border: epaperEdition === ed.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer'
                        }}
                      >
                        {ed.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Archives */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: 8 }}>
                    📅 तारीख आर्काइव्ह (365 Days Archive Access):
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { date: '१३ सप्टेंबर २०२६', slug: '13-Sep-2026', label: 'आज (१३ सप्टें)' },
                      { date: '१२ सप्टेंबर २०२६', slug: '12-Sep-2026', label: 'काल (१२ सप्टें)' },
                      { date: '११ सप्टेंबर २०२६', slug: '11-Sep-2026', label: '११ सप्टें' },
                      { date: '१० सप्टेंबर २०२६', slug: '10-Sep-2026', label: '१० सप्टें' },
                    ].map(d => (
                      <button
                        key={d.slug}
                        onClick={() => {
                          setEpaperDate(d.date);
                          setEpaperDateSlug(d.slug);
                        }}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          fontWeight: epaperDateSlug === d.slug ? 800 : 600,
                          background: epaperDateSlug === d.slug ? '#ea580c' : '#0a0f1d',
                          color: '#fff',
                          border: epaperDateSlug === d.slug ? 'none' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer'
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* 4 Individual Pages Grid */}
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 14px 0' }}>
                  📑 पृष्ठांनुसार स्वतंत्र PDF डाऊनलोड (Individual Pages):
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {[
                    { num: 1, title: 'पृष्ठ १: मुख्य पान (Front Page)', desc: 'ब्रेकिंग न्यूज, राष्ट्रीय व राज्य घडामोडी' },
                    { num: 2, title: 'पृष्ठ २: पुणे विशेष (Pune Metro)', desc: 'स्थानिक प्रश्न, महापालिका, वाहतूक' },
                    { num: 3, title: 'पृष्ठ ३: महाराष्ट्र व देश (State)', desc: 'राजकीय घडामोडी, उद्योग व अर्थव्यवस्था' },
                    { num: 4, title: 'पृष्ठ ४: क्रीडा व संपादकीय (Sports)', desc: 'आयपीएल, अग्रलेख, तंत्रज्ञान विशेष' },
                  ].map(p => (
                    <div 
                      key={p.num}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: 14 }}>
                          {p.desc}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          downloadEPaperPDF({ edition: epaperEdition, date: epaperDate, dateSlug: epaperDateSlug, fullEdition: false, pageNumber: p.num });
                          showToast(`📄 पृष्ठ ${p.num} ची PDF डाऊनलोड होत आहे...`);
                        }}
                        style={{
                          width: '100%',
                          background: '#1e293b',
                          color: '#38bdf8',
                          border: '1px solid rgba(56,189,248,0.3)',
                          padding: '8px 10px',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <Download size={14} /> पृष्ठ {p.num} डाऊनलोड
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: COMMERCIAL COPYRIGHT LICENSE CERTIFICATE
            ===================================================================== */}
        {activeTab === 'license' && (
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '30px 36px', marginBottom: 24 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      अधिकृत कमर्शियल कॉपीराइट लायसन्स सर्टिफिकेट
                    </h2>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      यूट्यूब, फेसबुक, इन्स्टाग्राम आणि टीव्ही ब्रॉडकास्टसाठी १००% कायदेशीर क्लिअरन्स दाखला
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  style={{ background: '#003884', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Printer size={16} /> सर्टिफिकेट प्रिंट करा / Save as PDF
                </button>
              </div>

              {/* Printable Certificate Box */}
              <div style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '36px 40px',
                borderRadius: 12,
                border: '3px double #003884',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #003884', paddingBottom: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: 2, color: '#002255' }}>
                    NEXVARTA MEDIA PVT. LTD.
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>
                    COMMERCIAL BROADCAST &amp; SYNDICATION RIGHTS CERTIFICATE
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                    Reg. No: MAH-PUN-2026-NEXVARTA • Digital Media Syndication Clearance
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: '#334155' }}>
                  <p>
                    This is to formally certify that <strong>{subscriber.name}</strong> holds an authorized 
                    <strong> {subscriber.planName} ({subscriber.licenseKey})</strong>.
                  </p>
                  <p>
                    The licensee is granted <strong>Worldwide, Perpetual, Royalty-Free Commercial Synchronization and Broadcast Rights</strong> to use, publish, monetize, edit, and distribute all Nexvarta Video Footage, 9:16 Vertical Reels, 16:9 4K Packages, and voiceover scripts across YouTube, Instagram, Facebook, and TV News Broadcasts with <strong>Zero Copyright Claims / Strikes Guaranteed</strong>.
                  </p>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', margin: '16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
                    <div><strong>Licensee Name:</strong> {subscriber.name}</div>
                    <div><strong>License ID:</strong> {subscriber.licenseKey}</div>
                    <div><strong>Invoice No:</strong> {subscriber.invoiceNumber}</div>
                    <div><strong>Validity:</strong> Active ({subscriber.validUntil})</div>
                    <div><strong>Monetization Status:</strong> 100% Cleared (AdSense Safe)</div>
                    <div><strong>Territory:</strong> Worldwide (All Digital Platforms)</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 32, borderTop: '1px dashed #cbd5e1', paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a' }}>✓ 256-BIT CRYPTOGRAPHICALLY SIGNED</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Authorized by Editor-in-Chief &amp; Legal Head, Nexvarta Media</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ width: 68, height: 68, background: '#002255', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: '0.72rem', fontWeight: 800, textAlign: 'center' }}>
                      OFFICIAL SEAL
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: GST TAX INVOICE & BILLING
            ===================================================================== */}
        {activeTab === 'billing' && (
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '30px 36px', marginBottom: 24 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(168,85,247,0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={26} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      अधिकृत जीएसटी कर पावती (GST Tax Invoice)
                    </h2>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      कायदेशीर कर पावती • GSTIN: 27AABCN8912P1ZX
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '9px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Printer size={15} /> पावती प्रिंट करा
                </button>
              </div>

              {/* Printable Invoice Receipt */}
              <div style={{ background: '#ffffff', color: '#0f172a', padding: 28, borderRadius: 12, border: '2px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #003884', paddingBottom: 14, marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#002255', margin: 0 }}>NEXVARTA MEDIA PVT. LTD.</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>
                      Headquarters: Pimpri, Pune, Maharashtra - 411018<br />
                      GSTIN: 27AABCN8912P1ZX • SAC: 998431 (Online Media Subscription)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>
                    <div>पावती क्र.: <strong>{subscriber.invoiceNumber}</strong></div>
                    <div>तारीख: <strong>१३ सप्टेंबर २०२६</strong></div>
                    <div>पेमेंट पद्धत: <strong>UPI / Online Verified</strong></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16, fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>बिल कोणाला दिले (Billed To):</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{subscriber.name}</div>
                    <div>मोबाईल: {subscriber.phone}</div>
                    <div>ईमेल: {subscriber.email}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>सबस्क्रिप्शन तपशील:</span>
                    <div style={{ fontWeight: 800, color: '#ea580c' }}>{subscriber.planName}</div>
                    <div>बिलिंग प्रकार: {subscriber.billingCycle === 'yearly' ? 'वार्षिक (Yearly)' : 'मासिक (Monthly)'}</div>
                    <div>वैधता: {subscriber.validUntil}</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: 16 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px' }}>सेवा / तपशील</th>
                      <th style={{ textAlign: 'center', padding: '8px 10px' }}>SAC कोड</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px' }}>रक्कम</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 10px', fontWeight: 600 }}>Nexvarta डिजिटल व 4K फुटेज वार्षिक सदस्यत्व पास</td>
                      <td style={{ textAlign: 'center', padding: '10px 10px' }}>998431</td>
                      <td style={{ textAlign: 'right', padding: '10px 10px', fontWeight: 800 }}>₹{(subscriber.amountPaid / 1.18).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 10px', color: '#64748b' }}>CGST (9%)</td>
                      <td style={{ textAlign: 'center', padding: '6px 10px' }}>-</td>
                      <td style={{ textAlign: 'right', padding: '6px 10px' }}>₹{((subscriber.amountPaid - subscriber.amountPaid / 1.18) / 2).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 10px', color: '#64748b' }}>SGST (9%)</td>
                      <td style={{ textAlign: 'center', padding: '6px 10px' }}>-</td>
                      <td style={{ textAlign: 'right', padding: '6px 10px' }}>₹{((subscriber.amountPaid - subscriber.amountPaid / 1.18) / 2).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #003884', background: '#f8fafc', fontWeight: 900 }}>
                      <td style={{ padding: '10px 10px', fontSize: '0.95rem' }}>एकूण भरलेली रक्कम (Total Paid):</td>
                      <td></td>
                      <td style={{ textAlign: 'right', padding: '10px 10px', fontSize: '1.15rem', color: '#15803d' }}>
                        ₹{subscriber.amountPaid.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                  हे संगणकीकृत अधिकृत जीएसटी टॅक्स इनव्हॉईस आहे. स्वाक्षरीची आवश्यकता नाही.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: 10+ TEAM MEMBERS MULTI-LOGIN MANAGEMENT
            ===================================================================== */}
        {activeTab === 'team' && (
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '30px 32px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(234,88,12,0.15)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      टीम मेंबर्स मल्टी-लॉगिन व्यवस्थापन (Team Access)
                    </h2>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      तुमच्या संपादकांना, एडिटींग टीमला आणि रिपोर्टर्सना एकाच सबस्क्रिप्शनमध्ये ॲक्सेस द्या (३/१० सक्रिय)
                    </span>
                  </div>
                </div>
              </div>

              {/* Invite Link Generator Box */}
              <div style={{ background: '#1e293b', padding: '18px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: 8 }}>
                  🔗 थेट टीम इनव्हाईट लिंक (Shareable Invite Link):
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input 
                    type="text" 
                    readOnly 
                    value="https://nexvarta.com/join-team?token=NV-TEAM-98124-SECRET"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.12)', color: '#38bdf8', fontSize: '0.84rem' }}
                  />
                  <button
                    onClick={() => copyToClipboard('https://nexvarta.com/join-team?token=NV-TEAM-98124-SECRET', 'टीम इनव्हाईट लिंक')}
                    style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Copy size={14} /> लिंक कॉपी करा
                  </button>
                </div>
              </div>

              {/* Active Members Table */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0' }}>
                  सक्रिय टीम मेंबर्स व उपकरणांची यादी:
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {teamMembers.map(m => (
                    <div 
                      key={m.id}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 10,
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                          {m.role} • उपकरण: {m.device}
                        </div>
                      </div>

                      <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: 6 }}>
                        ✓ {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 6: 24x7 PRIORITY EDITORIAL DESK & CUSTOM NEWS REQUEST
            ===================================================================== */}
        {activeTab === 'support' && (
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '30px 32px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    २४x७ प्राधान्य संपादकीय हेल्पडेस्क (Priority Desk)
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    विशिष्ट बातमीचे Raw फुटेज किंवा कव्हरेज हवे असल्यास थेट संपादकीय मंडळाशी संपर्क साधा
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: 18, borderRadius: 12, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                    💬 थेट संपादकीय WhatsApp हेल्पलाईन
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: 2 }}>
                    सबस्क्रायबर्ससाठी सरासरी रिस्पॉन्स टाईम: ५ मिनिटे
                  </div>
                </div>

                <a 
                  href="https://wa.me/919876543210?text=Hello%20Nexvarta%20Editorial,%20I%20am%20a%20Pro%20Subscriber"
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Send size={15} /> WhatsApp वर मेसेज करा
                </a>
              </div>

              {/* Custom Footage Request Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                showToast('🚀 तुमची बातमी फुटेज विनंती संपादकीय टीमकडे पाठवली आहे!');
                setFootageRequest({ topic: '', location: 'पुणे', format: '9:16', notes: '' });
              }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  📝 विशिष्ट बातमी किंवा ऑन-ग्राउंड फुटेज विनंती फॉर्म:
                </h3>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    कोणत्या विषयाचे फुटेज हवे आहे? *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="उदा. हिंजवडी फेज १ ट्रॅफिक जॅम किंवा नवले पूल ड्रोन शॉट्स"
                    value={footageRequest.topic}
                    onChange={(e) => setFootageRequest({ ...footageRequest, topic: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                      लोकेशन (Location) *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={footageRequest.location}
                      onChange={(e) => setFootageRequest({ ...footageRequest, location: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                      अपेक्षित फॉरमॅट *
                    </label>
                    <select
                      value={footageRequest.format}
                      onChange={(e) => setFootageRequest({ ...footageRequest, format: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="9:16">📱 9:16 रील्स / शॉर्ट्स (Vertical)</option>
                      <option value="16:9">🖥️ 16:9 4K ब्रॉडकास्ट (Landscape)</option>
                      <option value="raw">🎬 अनकट रॉ कॅमेरा फुटेज (Raw Footage)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    अतिरिक्त सूचना / डेडलाईन:
                  </label>
                  <textarea 
                    rows={3} 
                    placeholder="उदा. आज संध्याकाळी ५ वाजेपर्यंत युट्युब बुलेटिनसाठी हवे आहे..."
                    value={footageRequest.notes}
                    onChange={(e) => setFootageRequest({ ...footageRequest, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem', lineHeight: 1.5 }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(234,88,12,0.4)'
                  }}
                >
                  <Send size={16} /> संपादकीय टीमकडे फुटेज विनंती पाठवा
                </button>

              </form>

            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODAL: VIDEO PLAYER & SCRIPT VIEWER
          ========================================================================= */}
      {selectedVideo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,29,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, maxWidth: 840, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '24px 28px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            {/* Close */}
            <button
              onClick={() => setSelectedVideo(null)}
              style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ background: selectedVideo.format === '9:16' ? '#ea580c' : '#0284c7', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                {selectedVideo.format === '9:16' ? '📱 9:16 Vertical Reel' : '🖥️ 16:9 4K Broadcast'}
              </span>
              <span style={{ background: '#15803d', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                ✓ WATERMARK-FREE UNLOCKED
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              {selectedVideo.title}
            </h3>

            {/* Video Player */}
            <div style={{ position: 'relative', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 18, maxHeight: selectedVideo.format === '9:16' ? 440 : 360, display: 'flex', justifyContent: 'center' }}>
              <video 
                controls 
                autoPlay 
                playsInline 
                src={selectedVideo.previewVideo} 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Script Box */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setSelectedScriptLang('mr')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: selectedScriptLang === 'mr' ? 800 : 600,
                      background: selectedScriptLang === 'mr' ? '#ea580c' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    मराठी व्हॉइसओव्हर स्क्रिप्ट
                  </button>
                  <button
                    onClick={() => setSelectedScriptLang('en')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: selectedScriptLang === 'en' ? 800 : 600,
                      background: selectedScriptLang === 'en' ? '#ea580c' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    English Script
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(selectedScriptLang === 'mr' ? selectedVideo.scriptMarathi : selectedVideo.scriptEnglish, 'स्क्रिप्ट')}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Copy size={13} /> १-क्लिक कॉपी
                </button>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedScriptLang === 'mr' ? selectedVideo.scriptMarathi : selectedVideo.scriptEnglish}
              </div>
            </div>

            {/* Direct Download Button */}
            <button
              onClick={() => {
                showToast(`📥 ${selectedVideo.title} चे वॉटरमार्क-फ्री 4K बंडल डाऊनलोड होत आहे...`);
                const link = document.createElement('a');
                link.href = selectedVideo.previewVideo || '#';
                link.download = `${selectedVideo.slug || 'nexvarta_pro_footage'}.mp4`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#fff',
                border: 'none',
                padding: '13px 20px',
                borderRadius: 10,
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(234,88,12,0.4)'
              }}
            >
              <Download size={18} /> वॉटरमार्क-फ्री 4K व्हिडिओ डाऊनलोड करा (MP4 + Script + Audio)
            </button>

          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', border: '1px solid #ea580c', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <CheckCircle2 size={18} color="#ea580c" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
