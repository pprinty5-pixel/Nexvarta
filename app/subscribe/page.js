'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  FileText, 
  Tv, 
  Video, 
  Film, 
  Smartphone, 
  Monitor, 
  Zap, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Lock, 
  QrCode, 
  ArrowRight, 
  Copy, 
  CheckCircle2, 
  Printer, 
  X,
  CreditCard,
  Building2,
  Newspaper
} from 'lucide-react';

export default function SubscribePage() {
  // Billing cycle toggle
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  
  // Selected plan for checkout modal
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select_method'); // 'select_method' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  
  // Active subscription stored locally
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form details in checkout
  const [customerInfo, setCustomerInfo] = useState({
    name: 'सचिन गायकवाड',
    email: 'sachin.g@gmail.com',
    phone: '9876543210',
    gstNumber: ''
  });

  // Success Receipt details
  const [invoiceData, setInvoiceData] = useState(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Load existing subscription from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexvarta_user_subscription');
      if (saved) {
        setActiveSubscription(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subscription Plans Definition
  const plans = [
    {
      id: 'epaper_reader',
      name: 'ई-पेपर व डिजिटल वाचक पास',
      englishName: 'Digital Reader & EPaper Pass',
      badge: 'वाचकांची पहिली पसंती',
      badgeColor: '#0284c7',
      target: 'दैनिक वाचक, विद्यार्थी व नागरिकांसाठी',
      icon: <Newspaper size={28} color="#0284c7" />,
      monthlyPrice: 99,
      yearlyPrice: 899,
      monthlyDisplay: '₹९९',
      yearlyDisplay: '₹८९९',
      yearlySavings: '२ महिने मोफत (Save 24%)',
      features: [
        '१००% जाहिरात-मुक्त (Ad-Free) वेगवान बातमी वाचन',
        'दररोजचे संपूर्ण ४-पानी अधिकृत ई-पेपर PDF डाऊनलोड्स',
        'मागील ३६५ दिवसांचे संपूर्ण ई-पेपर आर्काइव्ह ॲक्सेस',
        'व्हॉट्सॲपवर महत्त्वाच्या ब्रेकिंग न्यूजचे इन्स्टंट अलर्ट्स',
        'मोफत साप्ताहिक डिजिटल विशेषांक व संपादकीय विश्लेषण',
        '२ उपकरणांवर एकाच वेळी लॉगिन सुविधा',
      ],
      highlighted: false,
      ctaText: 'हा पास खरेदी करा'
    },
        {
      id: 'creator_agency_pass',
      name: 'ऑल-ॲक्सेस क्रिएटर, मीडिया व कॉर्पोरेट पास',
      englishName: 'All-Access Creator & Enterprise Media Pass',
      badge: 'सर्वोच्च व सर्व-समावेशक पास ⭐ (Flagship All-in-One)',
      badgeColor: '#ea580c',
      target: 'युट्युबर्स, रील क्रिएटर्स, वृत्तवाहिन्या, डिजिटल मीडिया नेटवर्क व पीआर एजन्सीजसाठी',
      icon: <Video size={28} color="#ea580c" />,
      monthlyPrice: 799,
      yearlyPrice: 6999,
      monthlyDisplay: '₹७९९',
      yearlyDisplay: '₹६,९९९',
      yearlySavings: '२ महिने मोफत (Save 27%)',
      features: [
        '📱 9:16 रील्स आणि 🖥️ 16:9 Full HD/4K व्हिडिओंचे अमर्याद डाऊनलोड्स',
        '१००% वॉटरमार्क-फ्री (No Watermark) हाय-स्पीड 4K डाउनलोड',
        'तयार मराठी व इंग्रजी व्हॉइसओव्हर स्क्रिप्ट्स (Ready Scripts)',
        'क्लीन ओरिजिनल ऑडिओ बाईट्स व व्हॉइस रेकॉर्डिंग्ज (MP3)',
        '१००% कमर्शियल रॉयल्टी-फ्री लायसन्स (यूट्यूब ॲडसेन्स सुरक्षित)',
        '१०+ टीम मेंबर्ससाठी मल्टी-युजर कॉर्पोरेट ॲक्सेस',
        'रॉ कॅमेरा फुटेज (Raw Footage & Drone B-Roll) व अनकट शॉट्स',
        'टीव्ही व डिजिटल ब्रॉडकास्ट री-पब्लिशिंग संपूर्ण कायदेशीर अधिकार',
        '२४x७ प्राधान्य संपादकीय हेल्पडेस्क व कस्टम न्यूज विनंती',
        'अधिकृत जीएसटी टॅक्स इन्व्हॉईस व कॉर्पोरेट करार (MOU)',
        'Cloudflare R2 हाय-स्पीड CDN वरून अमर्याद बफर-फ्री डाऊनलोड',
        'ई-पेपर व डिजिटल वाचक पासची सर्व फिचर्स समाविष्ट',
      ],
      highlighted: true,
      ctaText: 'ऑल-ॲक्सेस पास मिळवा'
    }
  ];

  // Open Checkout Modal
  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    setPaymentStep('select_method');
  };

  // Complete Simulated Payment
  const handleCompletePayment = () => {
    setPaymentStep('processing');

    setTimeout(() => {
      const price = billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
      const invoiceNumber = `NV-INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const licenseKey = `NV-LIC-${Date.now().toString().slice(-8)}`;

      const subscriptionDetails = {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        billingCycle: billingCycle,
        amount: price,
        paidDate: new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        validUntil: billingCycle === 'yearly' ? '१७ सप्टेंबर २०२७' : '१७ ऑक्टोबर २०२६',
        invoiceNumber,
        licenseKey,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        status: 'active'
      };

      // Save to localStorage & state
      localStorage.setItem('nexvarta_user_subscription', JSON.stringify(subscriptionDetails));
      setActiveSubscription(subscriptionDetails);
      setInvoiceData(subscriptionDetails);
      setPaymentStep('success');
      showToast('🎉 अभिनंदन! तुमचे Nexvarta सदस्यत्व यशस्वीरीत्या सक्रिय झाले आहे!');
    }, 1400);
  };

  // Cancel Active Subscription
  const handleCancelSubscription = () => {
    if (confirm('तुम्हाला हे सदस्यत्व नक्की रद्द करायचे आहे का?')) {
      localStorage.removeItem('nexvarta_user_subscription');
      setActiveSubscription(null);
      showToast('सदस्यत्व यशस्वीरीत्या रद्द केले.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* =========================================================================
          TOP NAVBAR
          ========================================================================= */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="subscribe-header-inner" style={{ maxWidth: 1320, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 14px rgba(234,88,12,0.4)' }}>
                N
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: 1.5, color: '#ffffff', lineHeight: 1.1 }}>
                  NEXVARTA <span style={{ color: '#ea580c', fontSize: '0.85rem', fontWeight: 800, background: 'rgba(234,88,12,0.15)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(234,88,12,0.3)' }}>PASS</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: 0.5 }}>
                  The Next Voice of News • अधिकृत सदस्यत्व व सबस्क्रिप्शन पोर्टल
                </div>
              </div>
            </Link>
          </div>

          <div className="subscribe-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {activeSubscription ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 14px', borderRadius: 8, fontSize: '0.82rem', color: '#34d399', fontWeight: 800 }}>
                <CheckCircle2 size={16} />
                <span>सक्रिय सदस्यत्व: {activeSubscription.planName}</span>
              </div>
            ) : null}

            <Link 
              href="/dashboard"
              style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 800, padding: '8px 16px', borderRadius: 8, background: '#0284c7', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}
            >
              👤 माझा डॅशबोर्ड
            </Link>
            <Link 
              href="/"
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)' }}
            >
              🌐 मुख्य वृत्तपोर्टल
            </Link>
          </div>

        </div>
      </header>

      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1d 100%)', padding: '54px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse at center, rgba(234,88,12,0.2) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }}></div>

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.3)', padding: '6px 16px', borderRadius: 30, fontSize: '0.82rem', color: '#fb923c', fontWeight: 800, marginBottom: 18 }}>
            <Sparkles size={16} /> १००% विश्वासार्ह • १०,०००+ वाचक व डिजिटल क्रिएटर्सचा विश्वास
          </div>

          <h1 className="subscribe-hero-title" style={{ fontSize: '2.6rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.25, margin: '0 0 16px 0', letterSpacing: -0.5 }}>
            दर्जेदार पत्रकारिता, डिजिटल ई-पेपर आणि <br />
            <span style={{ background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              कमर्शियल 4K व्हिडिओ फुटेजसाठी
            </span> आजच सदस्य व्हा
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 740, margin: '0 auto 28px' }}>
            जाहिरात-मुक्त वाचन, दररोजचे ४-पानी अधिकृत ई-पेपर PDF, आणि यूट्यूब/इन्स्टाग्राम मॉनिटायझेशनसाठी १००% कॉपीराइट-फ्री रील्स व फुटेज. तुमच्या गरजेनुसार योग्य प्लॅन निवडा.
          </p>

          {/* ACTIVE SUBSCRIPTION CARD IF LOGGED IN */}
          {activeSubscription && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: '18px 24px', maxWidth: 650, margin: '0 auto 32px auto', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                    ACTIVE PRO
                  </span>
                  <strong style={{ color: '#fff', fontSize: '1rem' }}>{activeSubscription.planName}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                  वैधता: {activeSubscription.validUntil} • लायसन्स: {activeSubscription.licenseKey}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    setInvoiceData(activeSubscription);
                    setPaymentStep('success');
                    setSelectedPlan(plans.find(p => p.id === activeSubscription.planId) || plans[1]);
                  }}
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  📄 पावती पहा
                </button>
                <button
                  onClick={handleCancelSubscription}
                  style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '7px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
              </div>
            </div>
          )}

          {/* BILLING FREQUENCY TOGGLE (MONTHLY VS YEARLY) */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1e293b', padding: '5px 6px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '9px 22px',
                borderRadius: 24,
                fontSize: '0.88rem',
                fontWeight: billingCycle === 'monthly' ? 800 : 600,
                background: billingCycle === 'monthly' ? '#ea580c' : 'transparent',
                color: billingCycle === 'monthly' ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              मासिक बिलिंग (Monthly)
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '9px 22px',
                borderRadius: 24,
                fontSize: '0.88rem',
                fontWeight: billingCycle === 'yearly' ? 800 : 600,
                background: billingCycle === 'yearly' ? '#ea580c' : 'transparent',
                color: billingCycle === 'yearly' ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s'
              }}
            >
              <span>वार्षिक बिलिंग (Yearly)</span>
              <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.7rem', fontWeight: 900, padding: '2px 8px', borderRadius: 12 }}>
                Save 27% (२ महिने मोफत)
              </span>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          PRICING CARDS (3 TIERS)
          ========================================================================= */}
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '20px 20px 60px' }}>
        <div className="pricing-cards-grid">
          
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const displayPrice = billingCycle === 'yearly' ? plan.yearlyDisplay : plan.monthlyDisplay;
            const period = billingCycle === 'yearly' ? '/ वर्ष' : '/ महिना';
            const isCurrentActive = activeSubscription && activeSubscription.planId === plan.id;

            return (
              <div 
                key={plan.id}
                style={{
                  background: plan.highlighted ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' : '#0f172a',
                  border: plan.highlighted ? '2px solid #ea580c' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  padding: '34px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: plan.highlighted ? '0 10px 40px rgba(234,88,12,0.2)' : '0 4px 20px rgba(0,0,0,0.2)',
                  transform: plan.highlighted ? 'scale(1.02)' : 'none',
                  transition: 'transform 0.2s'
                }}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: plan.badgeColor, color: '#fff', fontSize: '0.75rem', fontWeight: 900, padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                      {plan.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                      {plan.englishName}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 20px 0', minHeight: 38 }}>
                  {plan.target}
                </p>

                {/* Price Display */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '18px 0', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                      {displayPrice}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>
                      {period}
                    </span>
                  </div>

                  {billingCycle === 'yearly' && plan.yearlySavings && (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: 6 }}>
                      ✓ {plan.yearlySavings}
                    </div>
                  )}
                  {billingCycle === 'monthly' && (
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 6 }}>
                      दरमहा स्वयंचलित नूतनीकरण • कधीही रद्द करा
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div style={{ flex: 1, marginBottom: 28 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
                    समाविष्ट प्रमुख फायदे (Features):
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: plan.highlighted ? 'rgba(234,88,12,0.2)' : 'rgba(16,185,129,0.2)', color: plan.highlighted ? '#ea580c' : '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontSize: '0.75rem', fontWeight: 800 }}>
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handleOpenCheckout(plan)}
                  style={{
                    width: '100%',
                    background: plan.highlighted 
                      ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' 
                      : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    border: plan.highlighted ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    padding: '14px 20px',
                    borderRadius: 12,
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: plan.highlighted ? '0 4px 18px rgba(234,88,12,0.4)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {isCurrentActive ? '✓ सक्रिय सदस्यत्व (Active)' : `${plan.ctaText} →`}
                </button>

              </div>
            );
          })}

        </div>
      </section>

      {/* =========================================================================
          FEATURE COMPARISON MATRIX
          ========================================================================= */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '34px 36px', overflowX: 'auto' }}>
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0', textAlign: 'center' }}>
            प्लॅन्सची तपशीलवार तुलना (Feature Comparison Table)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', margin: '0 0 28px 0' }}>
            तुमच्या आवश्यकतेनुसार कोणत्या प्लॅनमध्ये काय उपलब्ध आहे ते खालील तक्त्यात पहा.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '12px 14px', color: '#cbd5e1', fontWeight: 800 }}>वैशिष्ट्य / सुविधा</th>
                <th style={{ textAlign: 'center', padding: '12px 14px', color: '#94a3b8', fontWeight: 700 }}>मोफत वाचक (Free)</th>
                <th style={{ textAlign: 'center', padding: '12px 14px', color: '#38bdf8', fontWeight: 800 }}>ई-पेपर पास (₹९९)</th>
                <th style={{ textAlign: 'center', padding: '12px 14px', color: '#fb923c', fontWeight: 800, background: 'rgba(234,88,12,0.1)', borderRadius: '8px 8px 0 0' }}>ऑल-ॲक्सेस क्रिएटर व कॉर्पोरेट पास (₹७९९) ⭐</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'दैनिक ताज्या बातम्या वाचन', free: 'मर्यादित', p1: 'अमर्याद', p2: 'अमर्याद', p3: 'अमर्याद' },
                { name: '१००% जाहिरात-मुक्त (No Ads)', free: '✕', p1: '✓', p2: '✓', p3: '✓' },
                { name: 'दैनिक संपूर्ण ४-पानी ई-पेपर PDF', free: '✕', p1: '✓ (HD PDF)', p2: '✓ (HD PDF)', p3: '✓ (HD PDF)' },
                { name: '३६५ दिवसांचे ई-पेपर आर्काइव्ह', free: '✕', p1: '✓', p2: '✓', p3: '✓' },
                { name: '📱 9:16 रील्स व्हिडिओ डाऊनलोड्स', free: '✕ (केवळ प्रिव्ह्यू)', p1: '✕', p2: '✓ (Watermark-free)', p3: '✓ (Raw files)' },
                { name: '🖥️ 16:9 4K ब्रॉडकास्ट फुटेज', free: '✕', p1: '✕', p2: '✓ (4K UHD 60fps)', p3: '✓ (Raw ProRes)' },
                { name: 'तयार मराठी व इंग्रजी स्क्रिप्ट्स', free: '✕', p1: '✕', p2: '✓', p3: '✓' },
                { name: 'रॉयल्टी-फ्री कमर्शियल लायसन्स', free: '✕', p1: '✕', p2: '✓ (यूट्यूब सेफ)', p3: '✓ (ब्रॉडकास्ट सेफ)' },
                { name: 'एकाच वेळी उपकरणांची संख्या', free: '१', p1: '२', p2: '५', p3: '१०+' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '12px 14px', color: '#f1f5f9', fontWeight: 600 }}>{row.name}</td>
                  <td style={{ textAlign: 'center', padding: '12px 14px', color: '#94a3b8' }}>{row.free}</td>
                  <td style={{ textAlign: 'center', padding: '12px 14px', color: '#38bdf8', fontWeight: 700 }}>{row.p1}</td>
                  <td style={{ textAlign: 'center', padding: '12px 14px', color: '#fb923c', fontWeight: 800, background: 'rgba(234,88,12,0.05)' }}>{row.p2}</td>
                  <td style={{ textAlign: 'center', padding: '12px 14px', color: '#34d399', fontWeight: 700 }}>{row.p3}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </section>

      {/* =========================================================================
          FAQ SECTION
          ========================================================================= */}
      <section style={{ maxWidth: 840, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', textAlign: 'center', margin: '0 0 24px 0' }}>
          वारंवार विचारले जाणारे प्रश्न (Frequently Asked Questions)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              q: 'मी व्हिडिओ यूट्यूब किंवा इन्स्टाग्रामवर टाकल्यास कॉपीराइट स्ट्राइक येईल का?',
              a: 'मुळीच नाही! ऑल-ॲक्सेस क्रिएटर पासमध्ये अधिकृत डिजिटल कमर्शियल लायसन्स सर्टिफिकेट दिले जाते. हे व्हिडिओ १००% रॉयल्टी-फ्री असून यूट्यूब ॲडसेन्स, फेसबुक आणि इन्स्टाग्राम मॉनिटायझेशनसाठी कायदेशीररित्या सुरक्षित आहेत.'
            },
            {
              q: 'पेमेंट करण्याचे पर्याय कोणते आहेत?',
              a: 'तुम्ही UPI (Google Pay, PhonePe, Paytm, BHIM), सर्व प्रमुख बँकांचे क्रेडिट/डेबिट कार्ड्स (Visa, Mastercard, RuPay) आणि नेटबँकिंगद्वारे सुरक्षित पेमेंट करू शकता.'
            },
            {
              q: 'ई-पेपर PDF डाऊनलोड कसे करायचे?',
              a: 'सबस्क्रिप्शन सक्रिय झाल्यावर तुम्ही थेट होमपेजवरील ई-पेपर पर्यायात जाऊन कोणत्याही दिवसाची संपूर्ण ४-पानी ब्रॉडशीट हाय-क्वालिटी PDF एका क्लिकवर डाऊनलोड करू शकता.'
            },
            {
              q: 'मला जीएसटी (GST) टॅक्स इन्व्हॉईस मिळेल का?',
              a: 'होय! पेमेंट यशस्वी होताच तुम्हाला कायदेशीर जीएसटी इन्व्हॉईस पावती तात्काळ ऑनलाइन उपलब्ध होते, जी तुम्ही डाऊनलोड किंवा प्रिंट करू शकता.'
            },
            {
              q: 'मी सबस्क्रिप्शन कधीही रद्द करू शकतो का?',
              a: 'होय, कोणत्याही क्षणी तुम्ही एका क्लिकवर तुमचे सबस्क्रिप्शन रद्द करू शकता. कोणतेही छुपे शुल्क आकारले जात नाही.'
            }
          ].map((faq, idx) => (
            <div 
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              style={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                  {faq.q}
                </span>
                {openFaq === idx ? <ChevronUp size={18} color="#ea580c" /> : <ChevronDown size={18} color="#94a3b8" />}
              </div>
              {openFaq === idx && (
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.6, margin: '10px 0 0 0', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          MODAL: CHECKOUT & PAYMENT DRAWER
          ========================================================================= */}
      {selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,29,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, maxWidth: 540, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '28px 30px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlan(null)}
              style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>

            {/* STEP 1: PAYMENT METHOD & REVIEW */}
            {paymentStep === 'select_method' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(234,88,12,0.2)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      सुरक्षित चेकआऊट (Secure Checkout)
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>256-Bit SSL Secured Payment Gateway</span>
                  </div>
                </div>

                {/* Plan Summary Card */}
                <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                      {selectedPlan.name}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ea580c' }}>
                      {billingCycle === 'yearly' ? selectedPlan.yearlyDisplay : selectedPlan.monthlyDisplay}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>बिलिंग प्रकार: <strong>{billingCycle === 'yearly' ? 'वार्षिक बिलिंग (१ वर्ष)' : 'मासिक बिलिंग'}</strong></span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>१८% GST समाविष्ट</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="checkout-fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 3 }}>पूर्ण नाव *</label>
                    <input 
                      type="text" 
                      value={customerInfo.name} 
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 3 }}>मोबाईल नंबर *</label>
                    <input 
                      type="text" 
                      value={customerInfo.phone} 
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Payment Methods Selection */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', display: 'block', marginBottom: 10 }}>
                    पेमेंट पद्धत निवडा (Select Payment Option):
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {[
                      { id: 'upi', label: '⚡ झटपट UPI (GPay/PhonePe)', icon: <QrCode size={15} /> },
                      { id: 'card', label: '💳 डेबिट/क्रेडिट कार्ड', icon: <CreditCard size={15} /> },
                      { id: 'netbanking', label: '🏦 नेटबँकिंग', icon: <Building2 size={15} /> },
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          borderRadius: 8,
                          fontSize: '0.76rem',
                          fontWeight: paymentMethod === m.id ? 800 : 600,
                          background: paymentMethod === m.id ? '#ea580c' : '#1e293b',
                          color: '#fff',
                          border: paymentMethod === m.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                      >
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>

                  {/* UPI QR SCANNER BOX */}
                  {paymentMethod === 'upi' && (
                    <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: 12, padding: 18, textAlign: 'center', border: '2px dashed #cbd5e1' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                        कोणत्याही UPI ॲपने स्कॅन करा (GPay, PhonePe, Paytm, BHIM)
                      </div>
                      
                      {/* Live QR Image */}
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <div style={{ width: 140, height: 140, background: 'url(https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=nexvarta@icici&pn=Nexvarta%20Media%20Pvt%20Ltd) center/contain no-repeat', border: '1px solid #cbd5e1', borderRadius: 8 }}></div>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <span>अधिकृत UPI ID: <strong>nexvarta@icici</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('nexvarta@icici');
                            showToast('📋 UPI ID कॉपी झाला!');
                          }}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          कॉपी
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div style={{ background: '#1e293b', padding: 16, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input type="text" placeholder="कार्ड नंबर (16 Digits)" style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }} defaultValue="4532 •••• •••• 8912" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <input type="text" placeholder="MM/YY" style={{ padding: '9px 12px', borderRadius: 6, background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }} defaultValue="12/28" />
                        <input type="password" placeholder="CVV" style={{ padding: '9px 12px', borderRadius: 6, background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }} defaultValue="•••" />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div style={{ background: '#1e293b', padding: 16, borderRadius: 10 }}>
                      <select style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem' }}>
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Bank of Maharashtra</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Submit Payment CTA */}
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#fff',
                    padding: '14px 20px',
                    borderRadius: 12,
                    fontSize: '1rem',
                    fontWeight: 900,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(22,163,74,0.4)'
                  }}
                >
                  <Lock size={16} /> पेमेंट पूर्ण करा व सबस्क्रिप्शन सुरू करा (₹{billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice})
                </button>
              </div>
            )}

            {/* STEP 2: PROCESSING SIMULATION */}
            {paymentStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ display: 'inline-block', width: 48, height: 48, border: '3px solid #ea580c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 20 }}></div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0' }}>
                  पेमेंट पडताळणी सुरू आहे...
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                  कृपया प्रतीक्षा करा, बँक सर्व्हरकडून कन्फर्मेशन घेतले जात आहे.
                </p>
              </div>
            )}

            {/* STEP 3: SUCCESS CELEBRATION & INVOICE RECEIPT */}
            {paymentStep === 'success' && invoiceData && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    पेमेंट यशस्वी! अभिनंदन 🎉
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700, margin: '4px 0 0 0' }}>
                    तुमचा {invoiceData.planName} सक्रिय झाला आहे.
                  </p>
                </div>

                {/* Printable Invoice Receipt Box */}
                <div style={{ background: '#ffffff', color: '#0f172a', padding: 22, borderRadius: 12, border: '2px dashed #cbd5e1', marginBottom: 20, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 10, marginBottom: 10 }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: '#002255' }}>NEXVARTA MEDIA PVT. LTD.</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>GSTIN: 27AABCN8912P1ZX • Pune, MH</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                      <div>पावती क्र.: <strong>{invoiceData.invoiceNumber}</strong></div>
                      <div>तारीख: {invoiceData.paidDate}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12, fontSize: '0.8rem' }}>
                    <div>ग्राहक: <strong>{invoiceData.customerName}</strong></div>
                    <div>मोबाईल: <strong>{invoiceData.customerPhone}</strong></div>
                    <div>प्लॅन: <strong style={{ color: '#ea580c' }}>{invoiceData.planName}</strong></div>
                    <div>वैधता: <strong style={{ color: '#16a34a' }}>{invoiceData.validUntil}</strong></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: 6, borderTop: '1px solid #cbd5e1', fontWeight: 800 }}>
                    <span>एकूण भरलेली रक्कम (Paid Amount):</span>
                    <span style={{ fontSize: '1.1rem', color: '#15803d' }}>₹{invoiceData.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    style={{ flex: 1, background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '11px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Printer size={15} /> पावती प्रिंट करा
                  </button>
                  <Link
                    href="/dashboard"
                    style={{ flex: 1, background: '#ea580c', color: '#fff', padding: '11px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    👉 थेट डॅशबोर्डमध्ये जा →
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', border: '1px solid #ea580c', color: '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <CheckCircle2 size={18} color="#ea580c" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
