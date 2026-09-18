'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Tv, 
  Film, 
  Video, 
  FileText, 
  Volume2, 
  DollarSign, 
  ArrowRight, 
  Clock, 
  Award, 
  Eye, 
  ExternalLink, 
  Printer, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  X, 
  UserCheck, 
  Radio, 
  AlertCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export default function CreatorStudioPage() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'submit' | 'teleprompter' | 'license' | 'earnings' | 'pass'
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | '9:16' | '16:9'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // CMS Videos
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Selected Video for Preview Modal
  const [previewVideo, setPreviewVideo] = useState(null);
  const [selectedScriptLang, setSelectedScriptLang] = useState('mr'); // 'mr' | 'en'

  // License Modal
  const [selectedLicenseVideo, setSelectedLicenseVideo] = useState(null);

  // Payout Modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('5000');
  const [payoutUpi, setPayoutUpi] = useState('creator@okaxis');
  const [walletBalance, setWalletBalance] = useState(14800);
  const [payoutHistory, setPayoutHistory] = useState([
    { id: 'p-1', date: '१२ सप्टें २०२६', amount: '₹४,५००', utr: 'NV9812401823', status: 'यशस्वी (Success)' },
    { id: 'p-2', date: '०५ सप्टें २०२६', amount: '₹३,०००', utr: 'NV8712390192', status: 'यशस्वी (Success)' },
  ]);

  // Submission Form State (On-ground Footage upload to R2)
  const [submitForm, setSubmitForm] = useState({
    title: '',
    category: 'Pune News',
    format: '9:16',
    videoUrl: '',
    duration: '0:50 min',
    resolution: '1080x1920 Full HD',
    fileSize: '45.0 MB',
    reporterName: 'अनिकेत जोशी (Pune Creator)',
    location: 'हिंजवडी, पुणे',
    scriptMarathi: '',
    scriptEnglish: '',
    requestedRoyalty: '₹१,५००'
  });
  const [isUploadingToR2, setIsUploadingToR2] = useState(false);
  const [r2UploadProgress, setR2UploadProgress] = useState(0);
  const [submissionsList, setSubmissionsList] = useState([
    {
      id: 'sub-01',
      title: 'पुणे-सातारा हायवे लेन विस्तारीकरण व ट्रॅफिक ऑन-ग्राउंड रिपोर्ट',
      category: 'Pune News',
      format: '9:16',
      date: '१३ सप्टें २०२६',
      status: 'approved',
      royalty: '₹१,५००',
      views: '४२,०००+'
    },
    {
      id: 'sub-02',
      title: 'कोथरूड डिएलडब्ल्यू वेस्ट मॅनेजमेंट स्मार्ट प्लांट',
      category: 'Tech & AI',
      format: '16:9',
      date: '१० सप्टें २०२६',
      status: 'approved',
      royalty: '₹२,५००',
      views: '१,१८,०००+'
    },
    {
      id: 'sub-03',
      title: 'सिंहगड किल्ला पावसाळी पर्यटन गर्दी व ड्रोन व्हिज्युअल्स',
      category: 'Culture',
      format: '9:16',
      date: 'आज सादर केले',
      status: 'pending',
      royalty: '₹१,२००',
      views: 'तपासणी सुरू'
    }
  ]);

  // Teleprompter State
  const [teleprompterText, setTeleprompterText] = useState(
    "नमस्कार, मी अनिकेत जोशी. Nexvarta Creator Studio कडून आजची सर्वात महत्त्वाची बातमी...\n\nपुणे मेट्रो लाईन ३ चे आज लोकार्पण झाले असून हिंजवडी ते शिवाजीनगर हा २३ किलोमीटरचा प्रवास आता अवघ्या १५ ते १८ मिनिटांत पूर्ण होणार आहे.\n\nलाखो आयटी कर्मचाऱ्यांना याचा थेट दिलासा मिळणार असून ट्रॅफिकची डोकेदुखी कायमची संपणार आहे. पहा हा खास ऑन-ग्राउंड रिपोर्ट आणि अशाच वेगवान बातम्यांसाठी आताच फॉलो करा @Nexvarta!"
  );
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2); // 1 to 5
  const [teleprompterFontSize, setTeleprompterFontSize] = useState(32);
  const [isTeleprompterRunning, setIsTeleprompterRunning] = useState(false);
  const [isTeleprompterMirrored, setIsTeleprompterMirrored] = useState(false);
  const teleprompterBoxRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  // Fetch initial videos
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/cms');
        if (res.ok) {
          const json = await res.json();
          if (json.creatorVideos && json.creatorVideos.length > 0) {
            setVideos(json.creatorVideos);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Teleprompter auto-scroll loop
  useEffect(() => {
    if (isTeleprompterRunning) {
      scrollIntervalRef.current = setInterval(() => {
        if (teleprompterBoxRef.current) {
          teleprompterBoxRef.current.scrollTop += teleprompterSpeed;
        }
      }, 30);
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isTeleprompterRunning, teleprompterSpeed]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text, label = 'मजकूर') => {
    navigator.clipboard.writeText(text);
    showToast(`📋 ${label} क्लिपबोर्डवर यशस्वीरीत्या कॉपी झाला!`);
  };

  // Direct Cloudflare R2 Upload for Creator Footages
  const handleCreatorR2Upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      showToast('⚠️ व्हिडिओ फाईलची साईझ ५०० MB पेक्षा कमी असावी.');
      return;
    }

    try {
      setIsUploadingToR2(true);
      setR2UploadProgress(20);

      // Pre-extract metadata
      const tempUrl = URL.createObjectURL(file);
      const tempVid = document.createElement('video');
      tempVid.preload = 'metadata';
      tempVid.src = tempUrl;
      tempVid.onloadedmetadata = () => {
        const dur = Math.round(tempVid.duration) || 0;
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;
        const durFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs} min`;
        const width = tempVid.videoWidth || 1080;
        const height = tempVid.videoHeight || 1920;
        const isVertical = height > width;

        setSubmitForm(prev => ({
          ...prev,
          duration: durFormatted,
          resolution: width >= 3840 ? `${width}x${height} 4K UHD` : `${width}x${height} Full HD`,
          format: isVertical ? '9:16' : '16:9',
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        }));
        URL.revokeObjectURL(tempUrl);
      };

      setR2UploadProgress(50);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/r2/upload', {
        method: 'POST',
        body: formData,
      });

      setR2UploadProgress(95);

      if (res.ok) {
        const json = await res.json();
        setR2UploadProgress(100);
        setSubmitForm(prev => ({
          ...prev,
          videoUrl: json.url,
          title: prev.title || file.name.replace(/\.[^/.]+$/, "")
        }));
        showToast(`🎉 Cloudflare R2 वर थेट अपलोड पूर्ण! (${json.sizeMb || ''})`);
      } else {
        showToast('⚠️ व्हिडिओ अपलोड करताना त्रुटी आली.');
      }
    } catch (err) {
      showToast('⚠️ अपलोड त्रुटी.');
    } finally {
      setIsUploadingToR2(false);
      setTimeout(() => setR2UploadProgress(0), 1500);
    }
  };

  // Submit Footage to Editorial
  const handleFootageSubmit = async (e) => {
    e.preventDefault();
    if (!submitForm.videoUrl) {
      showToast('⚠️ कृपया आधी व्हिडिओ फाईल निवडून R2 वर अपलोड करा किंवा व्हिडिओ लिंक टाका.');
      return;
    }

    try {
      const res = await fetch('/api/creator/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitForm),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmissionsList(prev => [
          {
            id: json.submission.id,
            title: submitForm.title,
            category: submitForm.category,
            format: submitForm.format,
            date: 'आज सादर केले',
            status: 'pending',
            royalty: submitForm.requestedRoyalty,
            views: 'तपासणी सुरू'
          },
          ...prev
        ]);
        showToast('🚀 व्हिडिओ फुटेज Nexvarta संपादकीय मंडळाकडे यशस्वीरीत्या पाठवले!');
        setSubmitForm({
          title: '',
          category: 'Pune News',
          format: '9:16',
          videoUrl: '',
          duration: '0:50 min',
          resolution: '1080x1920 Full HD',
          fileSize: '45.0 MB',
          reporterName: 'अनिकेत जोशी (Pune Creator)',
          location: 'हिंजवडी, पुणे',
          scriptMarathi: '',
          scriptEnglish: '',
          requestedRoyalty: '₹१,५००'
        });
      } else {
        showToast('⚠️ सबमिशन सेव्ह करताना त्रुटी आली.');
      }
    } catch (err) {
      showToast('⚠️ नेटवर्क त्रुटी आली.');
    }
  };

  // Process Payout Request
  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const amt = parseInt(payoutAmount);
    if (!amt || amt > walletBalance || amt < 500) {
      showToast('⚠️ कृपया वैध रक्कम प्रविष्ट करा (किमान ₹५००, शिल्लक रकमेपेक्षा कमी).');
      return;
    }

    try {
      const res = await fetch('/api/creator/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, upiId: payoutUpi })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setWalletBalance(prev => prev - amt);
        setPayoutHistory(prev => [
          {
            id: json.payout.id,
            date: 'आज (आत्ताच)',
            amount: `₹${amt}`,
            utr: json.payout.utr,
            status: 'यशस्वी (Instant UPI Transfer)'
          },
          ...prev
        ]);
        setIsPayoutModalOpen(false);
        showToast(`🎉 ₹${amt} चे पेआउट यशस्वी! UTR: ${json.payout.utr}`);
      }
    } catch (e) {
      showToast('⚠️ पेआउट अयशस्वी.');
    }
  };

  // Filtered Videos
  const filteredVideos = videos.filter(v => {
    const matchesFormat = formatFilter === 'all' || v.format === formatFilter;
    const matchesCategory = categoryFilter === 'all' || (v.category && v.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    const matchesSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || (v.tags && v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesFormat && matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* =========================================================================
          CREATOR STUDIO TOP NAVIGATION BAR
          ========================================================================= */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          
          {/* Brand Logo & Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 14px rgba(234,88,12,0.4)' }}>
                N
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: 1.5, color: '#ffffff', lineHeight: 1.1 }}>
                  NEXVARTA <span style={{ color: '#ea580c', fontSize: '0.85rem', fontWeight: 800, background: 'rgba(234,88,12,0.15)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(234,88,12,0.3)' }}>CREATOR HUB</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: 0.5 }}>
                  The Next Voice of News • डिजिटल पत्रकारांचे अधिकृत क्रिएटर पॅनेल
                </div>
              </div>
            </Link>

            <div style={{ height: 26, width: 1, background: 'rgba(255,255,255,0.12)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
              ऑन-ग्राउंड व्हेरिफाईड क्रिएटर
            </div>
          </div>

          {/* Right Action Widgets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            
            {/* Wallet & Royalty Quick Balance */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>जमा रॉयल्टी शिल्लक</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
                  ₹{walletBalance.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                style={{ background: '#15803d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <DollarSign size={13} /> पैसे काढा
              </button>
            </div>

            {/* Portal Link & Admin */}
            <Link 
              href="/"
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              🌐 मुख्य पोर्टल
            </Link>

            <Link 
              href="/admin"
              style={{ color: '#ea580c', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 800, padding: '7px 14px', borderRadius: 8, background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.25)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ⚙️ ॲडमिन CMS
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CREATOR HERO METRICS STRIP
          ========================================================================= */}
      <section style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1d 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            
            {/* Metric 1 */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(234,88,12,0.15)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Film size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>उपलब्ध व्हिडिओ पॅकेजेस</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '2px 0' }}>
                  {videos.length || 6}+ पॅकेजेस
                </div>
                <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 700 }}>📱 9:16 रील्स & 🖥️ 4K B-Roll</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>रॉयल्टी कमाई (Lifetime)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '2px 0' }}>
                  ₹२२,३००
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>● ₹१४,८०० काढण्यासाठी उपलब्ध</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>कमर्शियल कॉपीराइट लायसन्स</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '2px 0' }}>
                  १००% सेफ
                </div>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>✓ यूट्यूब मॉनिटायझेशन गॅरंटीड</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(168,85,247,0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>सदस्यत्व दर्जा (Status)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: '2px 0' }}>
                  ALL-ACCESS PRO
                </div>
                <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 700 }}>अमर्याद वॉटरमार्क-फ्री 4K डाऊनलोड</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          TAB NAVIGATION MENU
          ========================================================================= */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 68, zIndex: 90 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {[
            { id: 'library', label: '🎬 फुटेज व रील पॅकेजेस (Footage Library)', badge: videos.length },
            { id: 'submit', label: '📤 ऑन-ग्राउंड फुटेज सबमिट करा (Submit to R2)', badge: 'रॉयल्टी ₹' },
            { id: 'teleprompter', label: '🎙️ टेलिप्रॉम्प्टर स्टुडिओ (Teleprompter)', badge: 'New' },
            { id: 'license', label: '📜 कमर्शियल लायसन्स (License Generator)' },
            { id: 'earnings', label: '💰 कमाई व पेआउट्स (Earnings & UPI)' },
            { id: 'pass', label: '💎 ऑल-ॲक्सेस पास (Pro Pass)' },
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
                  padding: '2px 6px',
                  borderRadius: 10,
                  background: activeTab === tab.id ? '#ea580c' : 'rgba(255,255,255,0.1)',
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
            TAB 1: FOOTAGE & REELS LIBRARY
            ===================================================================== */}
        {activeTab === 'library' && (
          <div>
            
            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24, background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              
              {/* Format Filter Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>फॉरमॅट:</span>
                {[
                  { id: 'all', label: 'सर्व फॉरमॅट' },
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
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Search & Category Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  <option value="all">सर्व कॅटेगरी (All Categories)</option>
                  <option value="Pune">पुणे विशेष (Pune News)</option>
                  <option value="Maharashtra">महाराष्ट्र घडामोडी (Maharashtra)</option>
                  <option value="Tech">तंत्रज्ञान व AI (Tech)</option>
                  <option value="Culture">संस्कृती व सण (Culture)</option>
                  <option value="Sports">क्रीडा व क्रिकेट (Sports)</option>
                </select>

                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="विषय किंवा कीवर्ड शोधा..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '8px 12px 8px 32px',
                      borderRadius: 8,
                      background: '#1e293b',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontSize: '0.82rem',
                      width: 200
                    }}
                  />
                </div>

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
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                  }}
                >
                  
                  {/* Thumbnail & Badges */}
                  <div style={{ position: 'relative', height: vid.format === '9:16' ? 240 : 200, background: '#000', overflow: 'hidden' }}>
                    <img 
                      src={vid.thumbnail || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"} 
                      alt={vid.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)' }}></div>
                    
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
                      <span style={{ background: 'rgba(0,0,0,0.7)', color: '#f1f5f9', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
                        {vid.category || 'News'}
                      </span>
                    </div>

                    {/* Duration badge */}
                    <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {vid.duration || '0:50 min'}
                    </div>

                    {/* Quick Play Trigger */}
                    <button
                      onClick={() => setPreviewVideo(vid)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        margin: 'auto',
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'rgba(234,88,12,0.9)',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(234,88,12,0.6)',
                        transition: 'transform 0.15s'
                      }}
                    >
                      <Play size={24} fill="#fff" style={{ marginLeft: 3 }} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                      {vid.title}
                    </h3>

                    {/* Technical Specs Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                        {vid.resolution || '1080x1920 Full HD'}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                        {vid.fps || '60 FPS'}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                        {vid.fileSize || '65 MB'}
                      </span>
                      <span style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                        ✓ Clean No-Watermark
                      </span>
                    </div>

                    {/* Script Snippet */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: 18, flex: 1, maxHeight: 70, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.7rem', marginBottom: 2 }}>मराठी व्हॉइसओव्हर हुक:</div>
                      {vid.scriptMarathi || 'पुणे आणि महाराष्ट्राची ब्रेकिंग बातमी...'}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button
                          onClick={() => setPreviewVideo(vid)}
                          style={{
                            background: '#ea580c',
                            color: '#fff',
                            border: 'none',
                            padding: '9px 12px',
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
                            showToast(`📥 ${vid.title} चे Clean 4K बंडल डाउनलोड होत आहे...`);
                            const link = document.createElement('a');
                            link.href = vid.previewVideo || '#';
                            link.download = `${vid.slug || 'nexvarta_video'}.mp4`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            color: '#f8fafc',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '9px 12px',
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
                          <Download size={14} /> डाउनलोड
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button
                          onClick={() => {
                            setSelectedLicenseVideo(vid);
                          }}
                          style={{
                            background: 'transparent',
                            color: '#38bdf8',
                            border: '1px solid rgba(56,189,248,0.3)',
                            padding: '7px 10px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                        >
                          <ShieldCheck size={13} /> लायसन्स सर्टिफिकेट
                        </button>

                        <button
                          onClick={() => {
                            setTeleprompterText(vid.scriptMarathi || vid.title);
                            setActiveTab('teleprompter');
                            showToast('🎙️ स्क्रिप्ट टेलिप्रॉम्प्टरमध्ये लोड झाली!');
                          }}
                          style={{
                            background: 'transparent',
                            color: '#a855f7',
                            border: '1px solid rgba(168,85,247,0.3)',
                            padding: '7px 10px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                        >
                          <Radio size={13} /> टेलिप्रॉम्प्टर
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 2: SUBMIT ON-GROUND FOOTAGE (R2 UPLOAD & EARN)
            ===================================================================== */}
        {activeTab === 'submit' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32, alignItems: 'start' }}>
            
            {/* Left: Upload Form */}
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 30px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(234,88,12,0.15)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      ऑन-ग्राउंड बातमी फुटेज सबमिट करा (Submit &amp; Earn)
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                      तुमच्याकडील ब्रेकिंग न्यूज व्हिडिओ, ड्रोन शॉट्स किंवा रील्स थेट Cloudflare R2 वर अपलोड करून Nexvarta कडून थेट रॉयल्टी मिळवा.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleFootageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                
                {/* DIRECT CLOUDFLARE R2 UPLOAD BOX */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ea580c', display: 'block', marginBottom: 6 }}>
                    ☁️ व्हिडिओ फाईल निवडा (Direct Cloudflare R2 Upload) *
                  </label>
                  
                  <div 
                    style={{
                      border: '2px dashed #ea580c',
                      background: isUploadingToR2 ? 'rgba(234,88,12,0.1)' : 'rgba(255,255,255,0.03)',
                      borderRadius: 12,
                      padding: '24px 20px',
                      textAlign: 'center',
                      position: 'relative',
                      cursor: isUploadingToR2 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      disabled={isUploadingToR2}
                      onChange={handleCreatorR2Upload}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: isUploadingToR2 ? 'not-allowed' : 'pointer',
                        width: '100%',
                        height: '100%',
                        zIndex: 2
                      }}
                    />

                    {isUploadingToR2 ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#ea580c', fontWeight: 800 }}>
                          <span style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid #ea580c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                          Cloudflare R2 वर थेट अपलोड होत आहे... ({r2UploadProgress}%)
                        </div>
                        <div style={{ width: '80%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, margin: '12px auto 6px auto', overflow: 'hidden' }}>
                          <div style={{ width: `${r2UploadProgress}%`, height: '100%', background: '#ea580c', transition: 'width 0.3s ease' }}></div>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>कालावधी व रिझोल्यूशन ऑटोमॅटिक भरले जात आहे...</span>
                      </div>
                    ) : (
                      <div>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(234,88,12,0.2)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
                          <Film size={24} />
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                          येथे क्लिक करून संगणकावरून व्हिडिओ निवडा
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 10px 0' }}>
                          MP4, WebM किंवा MOV (Zero Egress R2 बकेटवर हाय-स्पीड ट्रान्सफर)
                        </p>
                        <span style={{ display: 'inline-block', background: '#ea580c', color: '#fff', padding: '6px 16px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 800, pointerEvents: 'none' }}>
                          📂 व्हिडिओ फाईल निवडा
                        </span>
                      </div>
                    )}
                  </div>

                  {submitForm.videoUrl && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#34d399', background: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.25)' }}>
                      <CheckCircle2 size={16} />
                      <span>व्हिडिओ यशस्वीरीत्या R2 वर तयार आहे: {submitForm.videoUrl.substring(0, 45)}...</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    बातमी / व्हिडिओ शीर्षक *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="उदा. हिंजवडी फेज ३ ट्रॅफिक जॅम व मेट्रो ३ चे थेट अपडेट्स"
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Category & Format */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                      कॅटेगरी *
                    </label>
                    <select
                      value={submitForm.category}
                      onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="Pune News">पुणे विशेष (Pune News)</option>
                      <option value="Maharashtra">महाराष्ट्र घडामोडी (Maharashtra)</option>
                      <option value="India">भारत व राष्ट्रीय (India)</option>
                      <option value="Tech & AI">तंत्रज्ञान व AI (Tech)</option>
                      <option value="Culture">संस्कृती व सण (Culture)</option>
                      <option value="Crime & Civic">नागरी समस्या व क्राईम</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                      व्हिडिओ फॉरमॅट *
                    </label>
                    <select
                      value={submitForm.format}
                      onChange={(e) => setSubmitForm({ ...submitForm, format: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="9:16">📱 9:16 व्हर्टिकल रील / शॉर्ट्स</option>
                      <option value="16:9">🖥️ 16:9 लँडस्केप 4K ब्रॉडकास्ट</option>
                    </select>
                  </div>
                </div>

                {/* Reporter Name & Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                      क्रिएटर / पत्रकाराचे नाव *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={submitForm.reporterName}
                      onChange={(e) => setSubmitForm({ ...submitForm, reporterName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                      ठिकाण / लोकेशन (Location) *
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={submitForm.location}
                      onChange={(e) => setSubmitForm({ ...submitForm, location: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Marathi Script */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    मराठी व्हॉइसओव्हर किंवा बातमीचा तपशील (Script/Facts) *
                  </label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="घडलेल्या घटनेचा मुख्य तपशील, वेळ आणि महत्त्वाची तथ्ये..."
                    value={submitForm.scriptMarathi}
                    onChange={(e) => setSubmitForm({ ...submitForm, scriptMarathi: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem', lineHeight: 1.5 }}
                  />
                </div>

                {/* Requested Royalty Fee */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                    मागणी केलेली रॉयल्टी फी (Royalty Demand per approved story)
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['₹१,०००', '₹१,५००', '₹२,५००', '₹५,०००'].map(fee => (
                      <button
                        type="button"
                        key={fee}
                        onClick={() => setSubmitForm({ ...submitForm, requestedRoyalty: fee })}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 8,
                          fontSize: '0.82rem',
                          fontWeight: submitForm.requestedRoyalty === fee ? 800 : 600,
                          background: submitForm.requestedRoyalty === fee ? '#15803d' : '#1e293b',
                          color: '#fff',
                          border: submitForm.requestedRoyalty === fee ? 'none' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer'
                        }}
                      >
                        {fee}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploadingToR2}
                  style={{
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 10,
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(234,88,12,0.4)',
                    marginTop: 8
                  }}
                >
                  🚀 संपादकीय मंडळाकडे फुटेज सबमिट करा
                </button>

              </form>
            </div>

            {/* Right: Submissions History & Guidelines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Submission Guidelines Card */}
              <div style={{ background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ea580c', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={18} /> क्रिएटर सबमिशन नियमावली
                </h3>
                <ul style={{ fontSize: '0.78rem', color: '#cbd5e1', paddingLeft: 18, lineHeight: 1.6, margin: 0 }}>
                  <li>व्हिडिओ ओरिजिनल आणि स्वतः शूट केलेला असावा.</li>
                  <li>व्हिडिओवर कोणताही थर्ड पार्टी वॉटरमार्क किंवा लोगो नसावा.</li>
                  <li>मंजूर झालेल्या प्रत्येक बातमीची रॉयल्टी २४ तासांत तुमच्या खात्यात जमा होते.</li>
                  <li>Cloudflare R2 मुळे 4K फुटेज मूळ गुणवत्तेत (Lossless) अपलोड होते.</li>
                </ul>
              </div>

              {/* Past Submissions List */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📋 सादर केलेले फुटेजेस ({submissionsList.length})</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>लाइव्ह स्टेटस</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {submissionsList.map(sub => (
                    <div 
                      key={sub.id}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 10,
                        padding: 12
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
                          {sub.title}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: sub.status === 'approved' ? 'rgba(16,185,129,0.2)' : 'rgba(234,88,12,0.2)',
                          color: sub.status === 'approved' ? '#34d399' : '#fb923c',
                          whiteSpace: 'nowrap'
                        }}>
                          {sub.status === 'approved' ? '✓ स्वीकृत (Paid)' : '⏳ पुनरावलोकन सुरू'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                        <span>{sub.category} • {sub.format} • {sub.date}</span>
                        <span style={{ color: '#f59e0b', fontWeight: 800 }}>रॉयल्टी: {sub.royalty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 3: TELEPROMPTER STUDIO
            ===================================================================== */}
        {activeTab === 'teleprompter' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🎙️ डिजिटल टेलिप्रॉम्प्टर स्टुडिओ (Reel &amp; News Recording)
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  मोबाइल कॅमेरा किंवा वेबकॅमसमोर रील रेकॉर्ड करताना ऑटो-स्क्रोलिंग स्क्रिप्ट सहज वाचा.
                </p>
              </div>

              {/* Controls Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1e293b', padding: '8px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                
                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsTeleprompterRunning(!isTeleprompterRunning)}
                  style={{
                    background: isTeleprompterRunning ? '#dc2626' : '#16a34a',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {isTeleprompterRunning ? <Pause size={16} fill="#fff" /> : <Play size={16} fill="#fff" />}
                  {isTeleprompterRunning ? 'थांबवा (Pause)' : 'सुरू करा (Scroll)'}
                </button>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    if (teleprompterBoxRef.current) teleprompterBoxRef.current.scrollTop = 0;
                  }}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
                  title="स्क्रोल रीसेट करा"
                >
                  <RotateCcw size={16} />
                </button>

                {/* Speed Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 10 }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>गती:</span>
                  {[1, 2, 3, 4].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setTeleprompterSpeed(spd)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: teleprompterSpeed === spd ? 800 : 600,
                        background: teleprompterSpeed === spd ? '#ea580c' : 'transparent',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Font Size Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 10 }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>आकार:</span>
                  <input 
                    type="range" 
                    min="20" 
                    max="52" 
                    value={teleprompterFontSize} 
                    onChange={(e) => setTeleprompterFontSize(Number(e.target.value))}
                    style={{ width: 80 }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#fff' }}>{teleprompterFontSize}px</span>
                </div>

                {/* Mirror / Flip for Camera Rig */}
                <button
                  onClick={() => setIsTeleprompterMirrored(!isTeleprompterMirrored)}
                  style={{
                    background: isTeleprompterMirrored ? '#a855f7' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="कॅमेरा ग्लाससाठी मिरर मोड"
                >
                  🪞 मिरर मोड
                </button>

              </div>
            </div>

            {/* Teleprompter Display Screen (Dark High-Contrast) */}
            <div 
              ref={teleprompterBoxRef}
              style={{
                height: 480,
                background: '#000000',
                border: '3px solid #1e293b',
                borderRadius: 16,
                padding: '160px 48px',
                overflowY: 'auto',
                position: 'relative',
                transform: isTeleprompterMirrored ? 'scaleX(-1)' : 'none',
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.9)'
              }}
            >
              {/* Eyeline Center Indicator */}
              <div style={{
                position: 'sticky',
                top: '50%',
                left: 0,
                right: 0,
                height: 2,
                background: 'rgba(234,88,12,0.4)',
                pointerEvents: 'none',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  कॅमेरा आयलाइन (LOOK HERE)
                </span>
                <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  EYELINE
                </span>
              </div>

              {/* Scrolling Text */}
              <div style={{
                fontSize: teleprompterFontSize,
                lineHeight: 1.8,
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'serif, system-ui',
                whiteSpace: 'pre-wrap',
                textAlign: 'center',
                maxWidth: 900,
                margin: '0 auto',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)'
              }}>
                {teleprompterText}
              </div>
            </div>

            {/* Script Textarea for Quick Editing */}
            <div style={{ marginTop: 20, background: '#0f172a', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                  ✏️ टेलिप्रॉम्प्टर स्क्रिप्ट संपादित करा किंवा येथे नवी स्क्रिप्ट पेस्ट करा:
                </span>
                <button
                  onClick={() => copyToClipboard(teleprompterText, 'टेलिप्रॉम्प्टर स्क्रिप्ट')}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Copy size={12} /> कॉपी करा
                </button>
              </div>
              <textarea 
                rows={4}
                value={teleprompterText}
                onChange={(e) => setTeleprompterText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  fontFamily: 'inherit'
                }}
              />
            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 4: COMMERCIAL LICENSE GENERATOR
            ===================================================================== */}
        {activeTab === 'license' && (
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 32px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    रॉयल्टी-फ्री कमर्शियल ब्रॉडकास्ट लायसन्स
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
                    यूट्यूब मॉनिटायझेशन, इन्स्टाग्राम ब्रँड डील्स आणि टीव्ही प्रसारणासाठी अधिकृत कॉपीराइट क्लिअरन्स सर्टिफिकेट.
                  </p>
                </div>
              </div>

              {/* License Certificate Canvas Preview */}
              <div style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '36px 40px',
                borderRadius: 12,
                border: '3px double #003884',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative'
              }}>
                {/* Certificate Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #003884', paddingBottom: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: 2, color: '#002255' }}>
                    NEXVARTA MEDIA PVT. LTD.
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>
                    CERTIFICATE OF COMMERCIAL BROADCAST &amp; SYNDICATION RIGHTS
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                    Reg. No: MAH-PUN-2026-NEXVARTA • ISO 9001:2015 Verified Digital Media Newsroom
                  </div>
                </div>

                {/* Certificate Body */}
                <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: '#334155' }}>
                  <p>
                    This is to certify that <strong>अनिकेत जोशी (Pune Creator Hub)</strong> holds an active 
                    <strong> Nexvarta All-Access Creator Pass (NV-LIC-2026-98124)</strong>.
                  </p>
                  <p>
                    Under this agreement, the licensee is granted <strong>Worldwide, Perpetual, Royalty-Free Commercial Synchronization Rights</strong> to publish, monetize, edit, and distribute Nexvarta Video Packages across YouTube, Instagram, Facebook, and Web Broadcasts without copyright claims or strikes.
                  </p>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 18px', margin: '16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.8rem' }}>
                    <div><strong>License ID:</strong> NV-LIC-2026-98124</div>
                    <div><strong>Issue Date:</strong> 13 Sep 2026</div>
                    <div><strong>Monetization Status:</strong> 100% Cleared (AdSense Safe)</div>
                    <div><strong>Valid Across:</strong> Global (All Digital Platforms)</div>
                  </div>
                </div>

                {/* Certificate Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 32, borderTop: '1px dashed #cbd5e1', paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>✓ DIGITAL ENCRYPTED SIGNATURE</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Authorized by Editor-in-Chief, Nexvarta</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ width: 64, height: 64, background: '#002255', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800, textAlign: 'center' }}>
                      OFFICIAL SEAL
                    </div>
                  </div>
                </div>

              </div>

              {/* Download / Print Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  style={{
                    background: '#003884',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Printer size={16} /> सर्टिफिकेट प्रिंट करा / Save as PDF
                </button>
              </div>

            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 5: EARNINGS & PAYOUTS
            ===================================================================== */}
        {activeTab === 'earnings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
            
            {/* Wallet Overview Card */}
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 30px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>एकूण जमा रॉयल्टी (Total Earnings)</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f59e0b', margin: '4px 0 16px 0' }}>
                ₹{walletBalance.toLocaleString('en-IN')}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                  <span style={{ color: '#cbd5e1' }}>स्वीकृत बातमी पॅकेजेस:</span>
                  <span style={{ fontWeight: 800, color: '#fff' }}>८ बातम्या</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                  <span style={{ color: '#cbd5e1' }}>एकूण सिंडिकेशन व्ह्यूज:</span>
                  <span style={{ fontWeight: 800, color: '#38bdf8' }}>३,४५,०००+</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                  <span style={{ color: '#cbd5e1' }}>किमान पेआउट मर्यादा:</span>
                  <span style={{ fontWeight: 800, color: '#10b981' }}>₹५०० (Instant UPI)</span>
                </div>
              </div>

              <button
                onClick={() => setIsPayoutModalOpen(true)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
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
                  boxShadow: '0 4px 14px rgba(22,163,74,0.4)'
                }}
              >
                <DollarSign size={18} /> UPI / बँक खात्यामध्ये पैसे ट्रान्सफर करा
              </button>
            </div>

            {/* Payouts History Card */}
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 30px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 16px 0' }}>
                📜 मागील पेआउट इतिहास (Withdrawal Logs)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {payoutHistory.map(p => (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10,
                      padding: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                        {p.amount}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                        {p.date} • UTR: {p.utr}
                      </div>
                    </div>

                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 6 }}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 6: ALL-ACCESS PASS MEMBERSHIP
            ===================================================================== */}
        {activeTab === 'pass' && (
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(234,88,12,0.3)', borderRadius: 20, padding: '36px 40px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 20, marginBottom: 24 }}>
                <div>
                  <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
                    Active Subscription
                  </span>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '8px 0 0 0' }}>
                    Nexvarta All-Access Creator Pass
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    यूट्यूबर्स, इन्स्टाग्राम न्यूज क्रिएटर्स आणि वृत्तवाहिन्यांसाठी सर्व-समावेशक पास.
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b' }}>
                    ₹७९९ <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>/ महिना</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                    पुढील रिन्यूअल: ३१ डिसेंबर २०२६
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                {[
                  "दोन्ही फॉरमॅट्स: 9:16 रील्स आणि 16:9 4K ब्रॉडकास्ट",
                  "१००% वॉटरमार्क फ्री (No Watermark) हाय-स्पीड डाऊनलोड",
                  "तयार मराठी व इंग्रजी व्हॉइसओव्हर स्क्रिप्ट्स",
                  "क्लीन ऑडिओ बाईट्स व बॅकग्राउंड स्कोअर (MP3)",
                  "१००% कमर्शियल रॉयल्टी-फ्री लायसन्स सर्टिफिकेट",
                  "दररोज ताजी ऑन-ग्राउंड आणि ब्रेकिंग न्यूज फुटेज",
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#e2e8f0' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      ✓
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <button
                  onClick={() => showToast('🎉 तुमचे Pro Creator सदस्यत्व आधीच सक्रिय आहे!')}
                  style={{
                    flex: 1,
                    background: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ✓ सदस्यत्व सक्रिय आहे (Active Pro)
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODAL: VIDEO PREVIEW & SCRIPT VIEWER
          ========================================================================= */}
      {previewVideo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,29,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, maxWidth: 840, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '24px 28px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            {/* Close Button */}
            <button
              onClick={() => setPreviewVideo(null)}
              style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ background: previewVideo.format === '9:16' ? '#ea580c' : '#0284c7', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4 }}>
                {previewVideo.format === '9:16' ? '📱 9:16 Vertical Reel' : '🖥️ 16:9 Landscape 4K'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {previewVideo.resolution} • {previewVideo.duration} • {previewVideo.fileSize}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              {previewVideo.title}
            </h3>

            {/* Video Player */}
            <div style={{ position: 'relative', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 18, maxHeight: previewVideo.format === '9:16' ? 440 : 360, display: 'flex', justifyContent: 'center' }}>
              <video 
                controls 
                autoPlay 
                playsInline 
                src={previewVideo.previewVideo} 
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
                  onClick={() => copyToClipboard(selectedScriptLang === 'mr' ? previewVideo.scriptMarathi : previewVideo.scriptEnglish, 'स्क्रिप्ट')}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Copy size={13} /> कॉपी करा
                </button>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedScriptLang === 'mr' ? previewVideo.scriptMarathi : previewVideo.scriptEnglish}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  showToast(`📥 ${previewVideo.title} चे बंडल डाउनलोड होत आहे...`);
                  const link = document.createElement('a');
                  link.href = previewVideo.previewVideo || '#';
                  link.download = `${previewVideo.slug || 'nexvarta_footage'}.mp4`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                style={{
                  flex: 2,
                  background: '#ea580c',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Download size={18} /> वॉटरमार्क-फ्री व्हिडिओ बंडल डाउनलोड करा
              </button>

              <button
                onClick={() => {
                  setTeleprompterText(previewVideo.scriptMarathi || previewVideo.title);
                  setPreviewVideo(null);
                  setActiveTab('teleprompter');
                  showToast('🎙️ स्क्रिप्ट टेलिप्रॉम्प्टरमध्ये लोड झाली!');
                }}
                style={{
                  flex: 1,
                  background: '#a855f7',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Radio size={16} /> टेलिप्रॉम्प्टरमध्ये वाचा
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INSTANT UPI PAYOUT WITHDRAWAL
          ========================================================================= */}
      {isPayoutModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,29,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, maxWidth: 480, width: '100%', padding: 26, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={20} color="#10b981" /> पैसे काढा (Instant UPI Payout)
              </h3>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestPayout} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                  उपलब्ध शिल्लक: <strong style={{ color: '#f59e0b' }}>₹{walletBalance.toLocaleString('en-IN')}</strong>
                </label>
                <input 
                  type="number"
                  required
                  min="500"
                  max={walletBalance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="रक्कम टाका (उदा. ५०००)"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                  UPI आयडी (GPay, PhonePe, Paytm, BHIM) *
                </label>
                <input 
                  type="text"
                  required
                  value={payoutUpi}
                  onChange={(e) => setPayoutUpi(e.target.value)}
                  placeholder="उदा. yourname@okaxis किंवा mobile@upi"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: 10, borderRadius: 8, fontSize: '0.74rem', color: '#34d399' }}>
                ⚡ शून्य ट्रॅन्झॅक्शन फी: २४x७ IMPS/UPI द्वारे रक्कम ३० सेकंदांत तुमच्या बँक खात्यात जमा होईल.
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                >
                  पैसे ट्रान्सफर करा
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          TOAST NOTIFICATION
          ========================================================================= */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', border: '1px solid #ea580c', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <CheckCircle2 size={18} color="#ea580c" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
