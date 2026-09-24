'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdsManager from '../components/AdsManager';
import { compressImage } from '../../lib/compressImage';
import { renderRichContent } from '../../lib/formatContent';
import { 
  Tv, 
  Newspaper, 
  Zap, 
  Video, 
  CreditCard, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Eye, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Clock,
  Sparkles,
  Smartphone,
  Monitor,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  BarChart3,
  TrendingUp,
  UploadCloud,
  Image as ImageIcon,
  Share2,
  Download,
  RefreshCw,
  Sliders,
  Calendar as CalendarIcon,
  Layers,
  CheckCircle2,
  Printer,
  Copy,
  Wand2,
  FileText,
  Upload,
  Play,
  Film,
  Globe,
  HardDrive,
  Lock,
  User,
  EyeOff,
  LogOut
} from 'lucide-react';
import { applyWatermarkToImage } from '../../lib/watermarkUtil';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('articles');
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Article Modal State
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleCategoryTarget, setArticleCategoryTarget] = useState('pune');
  const [storyEditorTab, setStoryEditorTab] = useState('write');
  const [customTextColor, setCustomTextColor] = useState('#2563eb');

  // Category Modal State
  const [editingCategory, setEditingCategory] = useState(null);

  // Video Package Modal State
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoStorageType, setVideoStorageType] = useState('r2'); // 'drive' | 'r2' | 'direct'
  const [videoTestPlaying, setVideoTestPlaying] = useState(false);
  const [isR2Uploading, setIsR2Uploading] = useState(false);
  const [r2UploadProgress, setR2UploadProgress] = useState(0);
  const [isR2ConfigModalOpen, setIsR2ConfigModalOpen] = useState(false);
  const [r2Settings, setR2Settings] = useState({
    accountId: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    publicDomain: '',
  });

  // Article Filtering & Workflow State
  const [articleStatusFilter, setArticleStatusFilter] = useState('all');

  // AI Assistant Modal & State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInputText, setAiInputText] = useState('');
  const [aiCategory, setAiCategory] = useState('pune');
  const [aiTone, setAiTone] = useState('breaking');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isAiInlineOpen, setIsAiInlineOpen] = useState(false);

  // Watermark Studio State
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-banner');
  const [watermarkTag, setWatermarkTag] = useState('🌟 अधिकृत लोगो');
  const [showWatermarkLogo, setShowWatermarkLogo] = useState(true);
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [rawOriginalImage, setRawOriginalImage] = useState(null);
  const [watermarkLocation, setWatermarkLocation] = useState('PUNE • MAHARASHTRA');
  const [showWatermarkLocation, setShowWatermarkLocation] = useState(true);
  const [watermarkDomain, setWatermarkDomain] = useState('NVNEWS.IN');
  const [showWatermarkDomain, setShowWatermarkDomain] = useState(true);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Logo Upload State
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isInlineImgUploading, setIsInlineImgUploading] = useState(false);
  const [logoPreviewBg, setLogoPreviewBg] = useState('light'); // 'light' | 'dark'
  const [logoLoadError, setLogoLoadError] = useState(false);

  // Analytics Dashboard State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [liveReadersCount, setLiveReadersCount] = useState(1482);

  // Fetch CMS data & Check Authentication on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('nexvarta_admin_auth');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthChecking(false);
    }
    fetchCmsData();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const u = usernameInput.trim();
    const p = passwordInput.trim();

    if (!u || !p) {
      setLoginError('कृपया वापरकर्ता नाव (User ID) आणि पासवर्ड प्रविष्ट करा.');
      return;
    }

    const validUsers = ['admin', 'nexvarta', 'avinashcommercial01@gmail.com'];
    const validPasswords = ['Nexvarta@2026', 'admin123'];

    if (validUsers.includes(u.toLowerCase()) && validPasswords.includes(p)) {
      try {
        await fetch('/api/admin/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', username: u, password: p }) });
      } catch (err) { /* Ads manager offers sign-in if the session was unavailable. */ }

      try {
        localStorage.setItem('nexvarta_admin_auth', 'true');
        localStorage.setItem('nexvarta_admin_user', u);
      } catch (err) {}
      setIsAuthenticated(true);
      setLoginError('');
      showToast('🎉 लॉगिन यशस्वी! ॲडमिन पॅनेलमध्ये आपले स्वागत आहे.');
    } else {
      setLoginError('❌ अवैध लॉगिन आयडी किंवा पासवर्ड! कृपया योग्य माहिती टाका.');
    }
  };

  const handleLogout = () => {
    if (confirm('तुम्हाला ॲडमिन पॅनेलमधून बाहेर पडायचे (Logout) आहे का?')) {
      try {
        localStorage.removeItem('nexvarta_admin_auth');
        localStorage.removeItem('nexvarta_admin_user');
      } catch (err) {}
      fetch('/api/admin/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }).catch(() => {});
      setIsAuthenticated(false);
      setUsernameInput('');
      setPasswordInput('');
      setLoginError('');
      showToast('🚪 तुम्ही यशस्वीरीत्या लॉगआउट झाला आहात.');
    }
  };

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cms');
      if (res.ok) {
        const data = await res.json();
        setCmsData(data);
      }
    } catch (err) {
      console.error('Error fetching CMS:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveCmsData = async (dataToSave = cmsData) => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        showToast('✅ सर्व बदल यशस्वीरीत्या सेव्ह झाले!');
      } else {
        showToast('⚠️ एरर: बदल सेव्ह करता आले नाहीत.');
      }
    } catch (err) {
      showToast('⚠️ सर्व्हर एरर.');
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // LOGO UPLOAD & BRANDING ACTIONS
  // ----------------------------------------------------
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ लोगो इमेज फाईलची साईझ 5MB पेक्षा लहान असावी.');
      return;
    }

    try {
      setIsLogoUploading(true);
      const formData = new FormData();
      formData.append('file', await compressImage(file));

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        const updated = { ...cmsData };
        if (!updated.siteConfig) updated.siteConfig = {};
        updated.siteConfig.logoUrl = data.url;
        setCmsData(updated);
        saveCmsData(updated);
        setLogoLoadError(false);
        showToast('✅ लोगो यशस्वीरीत्या अपलोड आणि सेव्ह झाला!');
      } else {
        showToast('⚠️ लोगो अपलोड करताना त्रुटी: ' + (data.error || 'अयशस्वी'));
      }
    } catch (err) {
      showToast('⚠️ नेटवर्क एरर आला.');
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleAutoFixLogo = async () => {
    if (!cmsData?.siteConfig?.logoUrl) return;
    try {
      setIsLogoUploading(true);
      showToast('⏳ लोगो वेब-सुसंगत (sRGB) फॉरमॅटमध्ये रूपांतरित करत आहे...');
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fix-existing', url: cmsData.siteConfig.logoUrl }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const updated = { ...cmsData };
        if (!updated.siteConfig) updated.siteConfig = {};
        updated.siteConfig.logoUrl = data.url;
        setCmsData(updated);
        saveCmsData(updated);
        setLogoLoadError(false);
        showToast('✅ लोगो यशस्वीरीत्या sRGB मध्ये रूपांतरित आणि सेव्ह झाला!');
      } else {
        showToast('⚠️ त्रुटी: ' + (data.error || 'रूपांतरित करता आले नाही.'));
      }
    } catch (err) {
      showToast('⚠️ नेटवर्क त्रुटी आली.');
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    if (confirm('वेबसाइटचा लोगो काढून टाकायचा आहे का?')) {
      const updated = { ...cmsData };
      if (updated.siteConfig) {
        updated.siteConfig.logoUrl = '';
      }
      setCmsData(updated);
      saveCmsData(updated);
      setLogoLoadError(false);
      showToast('🗑️ लोगो काढून टाकला!');
    }
  };

  // ----------------------------------------------------
  // CATEGORY / SECTION ACTIONS & PRIORITY
  // ----------------------------------------------------
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) return;
    const updated = { ...cmsData };

    if (editingCategory.isNew) {
      const generatedSlug = (editingCategory.slug || editingCategory.name)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const generatedId = generatedSlug || `cat-${Date.now()}`;

      const newSection = {
        id: generatedId,
        name: editingCategory.name.trim(),
        slug: generatedSlug,
        color: editingCategory.color || '#2563eb',
        banners: [],
        articles: [],
      };
      updated.newsSections.push(newSection);
      showToast(`✨ नवीन कॅटेगरी "${newSection.name}" जोडली गेली!`);
    } else {
      const idx = updated.newsSections.findIndex(s => s.id === editingCategory.id);
      if (idx !== -1) {
        updated.newsSections[idx].name = editingCategory.name.trim();
        if (editingCategory.slug) {
          updated.newsSections[idx].slug = editingCategory.slug.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
        }
        updated.newsSections[idx].color = editingCategory.color;
        showToast(`✅ कॅटेगरी बदल सेव्ह झाले!`);
      }
    }

    setCmsData(updated);
    saveCmsData(updated);
    setEditingCategory(null);
  };

  const handleMoveCategory = (index, direction) => {
    const updated = { ...cmsData };
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.newsSections.length) return;

    // Swap positions
    const temp = updated.newsSections[index];
    updated.newsSections[index] = updated.newsSections[targetIndex];
    updated.newsSections[targetIndex] = temp;

    setCmsData(updated);
    saveCmsData(updated);
    showToast(`🔄 कॅटेगरी प्राधान्य (Priority) अपडेट केले!`);
  };

  const handleDeleteCategory = (sectionId, sectionName) => {
    if (!confirm(`"${sectionName}" ही संपूर्ण कॅटेगरी आणि त्यामधील सर्व बातम्या डिलीट करायच्या आहेत का?`)) return;
    const updated = { ...cmsData };
    updated.newsSections = updated.newsSections.filter(s => s.id !== sectionId);
    setCmsData(updated);
    saveCmsData(updated);
    showToast(`🗑️ "${sectionName}" कॅटेगरी डिलीट केली!`);
  };

  // ----------------------------------------------------
  // ARTICLE ACTIONS & RICH FORMATTING
  // ----------------------------------------------------
  const insertStoryFormat = (before, after = '', defaultText = 'मजकूर') => {
    const textarea = document.getElementById('fullStoryTextarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = editingArticle.fullContent || '';
    const hasSelection = start !== end;
    const selectedText = hasSelection ? currentVal.substring(start, end) : defaultText;

    const newText = currentVal.substring(0, start) + before + selectedText + after + currentVal.substring(end);

    setEditingArticle({ ...editingArticle, fullContent: newText });

    setTimeout(() => {
      textarea.focus();
      const newCursorStart = start + before.length;
      const newCursorEnd = newCursorStart + selectedText.length;
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 30);
  };

  const handleInlineImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', await compressImage(file));

    try {
      setIsInlineImgUploading(true);
      showToast('⏳ फोटो अपलोड होत आहे...');
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const caption = prompt('फोटोसाठी कॅप्शन / टीप लिहा (पर्यायी):', '') || '';
        const markdownImg = `\n\n![${caption.trim()}](${data.url})\n\n`;

        const textarea = document.getElementById('fullStoryTextarea');
        if (textarea) {
          const start = textarea.selectionStart;
          const currentVal = editingArticle.fullContent || '';
          const newText = currentVal.substring(0, start) + markdownImg + currentVal.substring(start);
          setEditingArticle({ ...editingArticle, fullContent: newText });
          setTimeout(() => {
            textarea.focus();
            const nextPos = start + markdownImg.length;
            textarea.setSelectionRange(nextPos, nextPos);
          }, 40);
        } else {
          setEditingArticle({ ...editingArticle, fullContent: (editingArticle.fullContent || '') + markdownImg });
        }
        showToast('✅ फोटो बातमीमध्ये जोडला!');
      } else {
        showToast('⚠️ फोटो अपलोड त्रुटी: ' + (data.error || 'अयशस्वी'));
      }
    } catch (err) {
      console.error(err);
      showToast('⚠️ फोटो अपलोड करताना एरर आला.');
    } finally {
      setIsInlineImgUploading(false);
      e.target.value = '';
    }
  };

  const handleInsertImageUrl = () => {
    const url = prompt('फोटोची URL / लिंक टाका (उदा. https://... किंवा /uploads/...):', '');
    if (!url || !url.trim()) return;
    const caption = prompt('फोटोसाठी कॅप्शन / टीप लिहा (पर्यायी):', '') || '';
    const markdownImg = `\n\n![${caption.trim()}](${url.trim()})\n\n`;

    const textarea = document.getElementById('fullStoryTextarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const currentVal = editingArticle.fullContent || '';
      const newText = currentVal.substring(0, start) + markdownImg + currentVal.substring(start);
      setEditingArticle({ ...editingArticle, fullContent: newText });
      setTimeout(() => {
        textarea.focus();
        const nextPos = start + markdownImg.length;
        textarea.setSelectionRange(nextPos, nextPos);
      }, 40);
    } else {
      setEditingArticle({ ...editingArticle, fullContent: (editingArticle.fullContent || '') + markdownImg });
    }
    showToast('✅ फोटो बातमीमध्ये जोडला!');
  };

  const handleInsertWebLink = () => {
    const textarea = document.getElementById('fullStoryTextarea');
    let selectedText = '';
    let start = 0;
    let end = 0;
    if (textarea) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
      const currentVal = editingArticle.fullContent || '';
      selectedText = currentVal.substring(start, end);
    }

    const url = prompt('वेबसाईट किंवा बातमीची लिंक (URL) टाका:\nउदा. https://nvnews.in किंवा nvnews.in', 'https://');
    if (!url || !url.trim() || url.trim() === 'https://' || url.trim() === 'http://') return;
    
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('mailto:') && !cleanUrl.startsWith('tel:')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    let linkText = selectedText && selectedText.trim() ? selectedText.trim() : '';
    if (!linkText) {
      const defaultDomain = cleanUrl.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/.*$/, '');
      const userText = prompt('लिंकचे नाव (Link Text) टाका:\nउदा. अधिकृत वेबसाईट / येथे क्लिक करा', defaultDomain || 'येथे क्लिक करा');
      linkText = userText && userText.trim() ? userText.trim() : (defaultDomain || cleanUrl);
    }

    const insertText = `[${linkText}](${cleanUrl})`;

    if (textarea) {
      const currentVal = editingArticle.fullContent || '';
      const newText = currentVal.substring(0, start) + insertText + currentVal.substring(end);
      setEditingArticle({ ...editingArticle, fullContent: newText });
      setTimeout(() => {
        textarea.focus();
        const nextPos = start + insertText.length;
        textarea.setSelectionRange(nextPos, nextPos);
      }, 40);
    } else {
      setEditingArticle({ ...editingArticle, fullContent: (editingArticle.fullContent || '') + ' ' + insertText });
    }
    showToast('🔗 लिंक बातमीमध्ये जोडली!');
  };

  // ----------------------------------------------------
  // AI MARATHI NEWS ASSISTANT & WATERMARK HELPERS
  // ----------------------------------------------------
  const handleAiGenerate = async (customPrompt = aiInputText) => {
    if (!customPrompt || customPrompt.trim().length < 4) {
      showToast('⚠️ कृपया बातमीचा कच्चा मसुदा किंवा माहिती प्रविष्ट करा.');
      return;
    }
    try {
      setIsAiGenerating(true);
      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: customPrompt,
          category: aiCategory,
          tone: aiTone
        })
      });
      if (res.ok) {
        const json = await res.json();
        setAiResult(json.data);
        showToast('✨ AI द्वारे बातमी, हेडलाईन्स आणि रील्स स्क्रिप्ट तयार झाली!');
      } else {
        showToast('⚠️ AI जनरेशनमध्ये अडचण आली.');
      }
    } catch (err) {
      showToast('⚠️ AI सर्व्हर एरर.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyAiToForm = (data = aiResult) => {
    if (!data) return;
    if (editingArticle) {
      setEditingArticle({
        ...editingArticle,
        title: data.selectedHeadline || data.headlines?.[0] || editingArticle.title,
        summary: data.summary30 || editingArticle.summary,
        fullContent: data.fullStory || editingArticle.fullContent,
        badge: data.badge || editingArticle.badge,
        badgeColor: data.badgeColor || editingArticle.badgeColor,
        reelScript: data.reelScript || editingArticle.reelScript
      });
      setIsAiInlineOpen(false);
    } else {
      // Open new article with this data
      setArticleCategoryTarget(aiCategory || 'pune');
      setEditingArticle({
        isNew: true,
        badge: data.badge || 'BREAKING',
        badgeColor: data.badgeColor || '#dc2626',
        title: data.selectedHeadline || data.headlines?.[0] || '',
        summary: data.summary30 || '',
        fullContent: data.fullStory || '',
        reelScript: data.reelScript || '',
        author: 'Nexvarta AI & Bureau',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: '3 min read',
        status: 'published',
        views: 18500,
        shares: 640,
        downloads: 120,
        image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&q=80'
      });
      setIsAiModalOpen(false);
    }
    showToast('🚀 AI मसुदा बातमी फॉर्ममध्ये भरला!');
  };

  const processAndApplyWatermark = async (
    fileOrUrl, 
    tag = watermarkTag, 
    pos = watermarkPosition, 
    overrides = {}
  ) => {
    if (!fileOrUrl) return;
    try {
      setIsWatermarking(true);
      const isNone = tag === '❌ विना वॉटरमार्क' || pos === 'none';
      showToast(isNone ? '🖼️ विना-वॉटरमार्क मूळ फोटो सेट करत आहे...' : `🎨 ${tag} वॉटरमार्क जोडत आहे...`);

      const locActive = overrides.showLocation !== undefined ? overrides.showLocation : showWatermarkLocation;
      const locText = overrides.locationText !== undefined ? overrides.locationText : watermarkLocation;
      const domActive = overrides.showDomain !== undefined ? overrides.showDomain : showWatermarkDomain;
      const domText = overrides.domainText !== undefined ? overrides.domainText : watermarkDomain;
      const logoActive = overrides.showLogo !== undefined ? overrides.showLogo : showWatermarkLogo;
      const currentLogoUrl = overrides.logoUrl !== undefined ? overrides.logoUrl : (cmsData?.siteConfig?.logoUrl || '/uploads/logos/nexvarta_official_logo.png');

      const watermarkedDataUrl = await applyWatermarkToImage(fileOrUrl, {
        watermarkText: tag,
        position: isNone ? 'none' : 'bottom-banner',
        showLocation: locActive,
        locationText: locText,
        showDomain: domActive,
        domainText: domText,
        showLogo: logoActive,
        logoUrl: currentLogoUrl
      });

      // Upload to server so it has a permanent real URL for WhatsApp, Facebook and social media thumbnails
      try {
        const fetchRes = await fetch(watermarkedDataUrl);
        const blob = await fetchRes.blob();
        const uploadForm = new FormData();
        const compressed = await compressImage(new File([blob], `article_img_${Date.now()}.jpg`, { type: 'image/jpeg' }));
        uploadForm.append('file', compressed);
        const uploadRes = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: uploadForm
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          setEditingArticle(prev => ({
            ...prev,
            image: uploadData.url
          }));
          showToast(isNone ? '✅ विना-वॉटरमार्क मूळ फोटो सेव्ह झाला!' : `✅ ${tag} वॉटरमार्क जोडून सेव्ह झाला!`);
          return;
        }
      } catch (uploadErr) {
        console.warn('Fallback to data URL:', uploadErr);
      }

      setEditingArticle(prev => ({
        ...prev,
        image: watermarkedDataUrl
      }));
      showToast(isNone ? '✅ विना-वॉटरमार्क मूळ फोटो सेट केला!' : `✅ ${tag} वॉटरमार्क सेट केला!`);
    } catch (err) {
      console.error(err);
      showToast('⚠️ फोटो वॉटरमार्क करताना अडचण आली.');
    } finally {
      setIsWatermarking(false);
    }
  };

  const triggerWatermarkRefresh = async (overrides = {}) => {
    const sourceImage = rawOriginalImage || (editingArticle?.image && !editingArticle.image.startsWith('data:') ? editingArticle.image : null) || editingArticle?.image;
    if (sourceImage) {
      await processAndApplyWatermark(sourceImage, watermarkTag, watermarkPosition, overrides);
    }
  };

  const handleWatermarkTagSelect = async (tag) => {
    setWatermarkTag(tag);
    const newPos = tag === '❌ विना वॉटरमार्क' ? 'none' : 'bottom-banner';
    setWatermarkPosition(newPos);

    let defaultLoc = watermarkLocation;
    if (tag.includes('PUNE') && (!watermarkLocation || watermarkLocation === 'PUNE • MAHARASHTRA')) {
      defaultLoc = 'PUNE • PCMC • MAHARASHTRA';
      setWatermarkLocation(defaultLoc);
    }

    const sourceImage = rawOriginalImage || (editingArticle?.image && !editingArticle.image.startsWith('data:') ? editingArticle.image : null);
    if (sourceImage) {
      await processAndApplyWatermark(sourceImage, tag, newPos, { locationText: defaultLoc });
    }
  };

  const handleImageFileSelected = async (file) => {
    if (!file) return;
    setRawOriginalImage(file);
    await processAndApplyWatermark(file, watermarkTag, watermarkPosition);
  };

  const handleQuickStatusChange = (sectionId, articleId, newStatus) => {
    const updated = { ...cmsData };
    const sec = updated.newsSections.find(s => s.id === sectionId);
    if (sec) {
      const art = sec.articles.find(a => a.id === articleId);
      if (art) {
        art.status = newStatus;
        setCmsData(updated);
        saveCmsData(updated);
        showToast(`🔄 स्टेटस बदलले: ${newStatus.toUpperCase()}`);
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        setAnalyticsData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const simulateLiveReaders = () => {
    const delta = Math.floor(Math.random() * 60) - 20;
    setLiveReadersCount(prev => Math.max(1200, prev + delta));
    showToast('⚡ लाइव्ह वाचकांचे आकडे रीफ्रेश झाले!');
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const handleSaveArticle = (e) => {
    e.preventDefault();
    const updated = { ...cmsData };
    const secIndex = updated.newsSections.findIndex(s => s.id === articleCategoryTarget);
    
    if (secIndex !== -1) {
      const rawViews = editingArticle.views;
      const parsedViews = typeof rawViews === 'number' 
        ? rawViews 
        : (parseInt(String(rawViews || '').replace(/,/g, '').replace(/[\u0966-\u096F]/g, d => d.charCodeAt(0) - 2406), 10) || 0);

      const rawShares = editingArticle.shares;
      const parsedShares = typeof rawShares === 'number' 
        ? rawShares 
        : (parseInt(String(rawShares || '').replace(/,/g, '').replace(/[\u0966-\u096F]/g, d => d.charCodeAt(0) - 2406), 10) || 0);

      const artToSave = {
        ...editingArticle,
        status: editingArticle.status || 'published',
        scheduledAt: editingArticle.status === 'scheduled' ? editingArticle.scheduledAt : null,
        views: parsedViews,
        shares: parsedShares,
        downloads: typeof editingArticle.downloads === 'number' ? editingArticle.downloads : (editingArticle.downloads || 115),
        image: editingArticle.image || '',
        reelScript: editingArticle.reelScript || '',
        isTrending: Boolean(editingArticle.isTrending),
      };

      let savedArticleId = editingArticle.id;

      if (editingArticle.id && editingArticle.isNew !== true) {
        // Edit existing article - handle possible section change
        let previousSecIndex = -1;
        let previousArtIndex = -1;
        for (let sIdx = 0; sIdx < updated.newsSections.length; sIdx++) {
          const aIdx = updated.newsSections[sIdx].articles.findIndex(a => a.id === editingArticle.id);
          if (aIdx !== -1) {
            previousSecIndex = sIdx;
            previousArtIndex = aIdx;
            break;
          }
        }

        if (previousSecIndex !== -1 && previousSecIndex !== secIndex) {
          updated.newsSections[previousSecIndex].articles.splice(previousArtIndex, 1);
          updated.newsSections[secIndex].articles.unshift(artToSave);
        } else if (previousSecIndex !== -1) {
          updated.newsSections[secIndex].articles[previousArtIndex] = artToSave;
        }
        showToast('✅ बातमी अपडेट झाली!');
      } else {
        // Add new
        savedArticleId = `art-${Date.now()}`;
        const newArt = {
          ...artToSave,
          id: savedArticleId,
          date: editingArticle.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
        delete newArt.isNew;
        updated.newsSections[secIndex].articles.unshift(newArt);
        showToast('✨ नवीन बातमी यशस्वीरीत्या जोडली!');
      }

      // If marked as trending, set as active trendingArticleId
      if (editingArticle.isTrending) {
        updated.trendingArticleId = savedArticleId;
      }

      setCmsData(updated);
      saveCmsData(updated);
      setEditingArticle(null);
    }
  };

  const handleSetTrendingArticle = (articleId) => {
    const updated = { ...cmsData, trendingArticleId: articleId };
    setCmsData(updated);
    saveCmsData(updated);
    showToast('🔥 मुख्य ट्रेंडिंग बातमी (Featured Trending Story) सेट झाली!');
  };

  const handleDeleteArticle = (sectionId, articleId) => {
    if (!confirm('ही बातमी खरंच डिलीट करायची आहे का?')) return;
    const updated = { ...cmsData };
    const secIndex = updated.newsSections.findIndex(s => s.id === sectionId);
    if (secIndex !== -1) {
      updated.newsSections[secIndex].articles = updated.newsSections[secIndex].articles.filter(a => a.id !== articleId);
      if (updated.trendingArticleId === articleId) {
        const remainingArts = updated.newsSections.flatMap(s => s.articles || []);
        updated.trendingArticleId = remainingArts[0]?.id || null;
      }
      setCmsData(updated);
      saveCmsData(updated);
      showToast('🗑️ बातमी डिलीट केली!');
    }
  };

  // ----------------------------------------------------
  // VIDEO STORAGE & THUMBNAIL HELPERS
  // ----------------------------------------------------
  const extractGoogleDriveId = (url) => {
    if (!url) return null;
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/);
    return match ? (match[1] || match[2]) : null;
  };

  const handleThumbnailFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('⚠️ थंबनेल फाईलची साईझ 8 MB पेक्षा कमी असावी.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editingVideo) {
        setEditingVideo({
          ...editingVideo,
          thumbnail: event.target.result
        });
        showToast('📸 थंबनेल फोटो यशस्वीरीत्या लोड झाला!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDirectR2FileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      showToast('⚠️ व्हिडिओ फाईलची साईझ ५०० MB पेक्षा कमी असावी.');
      return;
    }

    try {
      setIsR2Uploading(true);
      setR2UploadProgress(15);

      const sizeMb = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      // Pre-extract duration, resolution & aspect ratio
      const tempUrl = URL.createObjectURL(file);
      const tempVid = document.createElement('video');
      tempVid.preload = 'metadata';
      tempVid.src = tempUrl;
      tempVid.onloadedmetadata = () => {
        const durSec = Math.round(tempVid.duration) || 0;
        const mins = Math.floor(durSec / 60);
        const secs = durSec % 60;
        const durFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs} min`;
        const width = tempVid.videoWidth || 1080;
        const height = tempVid.videoHeight || 1920;
        const resFormatted = width >= 3840 ? `${width}x${height} 4K UHD` : `${width}x${height} Full HD`;
        const detectedFormat = height > width ? '9:16' : '16:9';

        setEditingVideo(prev => prev ? ({
          ...prev,
          duration: durFormatted,
          resolution: resFormatted,
          fileSize: sizeMb,
          format: detectedFormat,
        }) : prev);
        URL.revokeObjectURL(tempUrl);
      };

      setR2UploadProgress(40);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/r2/upload', {
        method: 'POST',
        body: formData,
      });

      setR2UploadProgress(90);

      if (res.ok) {
        const json = await res.json();
        setR2UploadProgress(100);

        setEditingVideo(prev => prev ? ({
          ...prev,
          previewVideo: json.url,
          fileSize: json.sizeMb || sizeMb,
        }) : prev);

        if (json.storage === 'cloudflare-r2') {
          showToast(`🎉 Cloudflare R2 वर थेट अपलोड पूर्ण! (${json.sizeMb})`);
        } else {
          showToast(`✅ व्हिडिओ अपलोड झाला! (${json.sizeMb})`);
        }
      } else {
        showToast('⚠️ व्हिडिओ अपलोड करताना त्रुटी आली.');
      }
    } catch (err) {
      console.error(err);
      showToast('⚠️ अपलोड अयशस्वी: नेटवर्क त्रुटी.');
    } finally {
      setIsR2Uploading(false);
      setTimeout(() => setR2UploadProgress(0), 1200);
    }
  };

  const fetchR2Config = async () => {
    try {
      const res = await fetch('/api/admin/r2/config');
      if (res.ok) {
        const json = await res.json();
        setR2Settings({
          accountId: json.accountId || '',
          accessKeyId: json.accessKeyId || '',
          secretAccessKey: '',
          bucketName: json.bucketName || '',
          publicDomain: json.publicDomain || '',
        });
      }
    } catch (e) {}
  };

  const handleSaveR2Config = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/r2/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r2Settings),
      });
      if (res.ok) {
        showToast('✅ Cloudflare R2 सेटिंग्स यशस्वीरीत्या सेव्ह झाल्या!');
        setIsR2ConfigModalOpen(false);
      } else {
        showToast('⚠️ सेटिंग्स सेव्ह करताना त्रुटी आली.');
      }
    } catch (err) {
      showToast('⚠️ एरर आला.');
    }
  };

  // ----------------------------------------------------
  // VIDEO PACKAGE ACTIONS
  // ----------------------------------------------------

  const handleSaveVideo = (e) => {
    e.preventDefault();
    const updated = { ...cmsData };

    let finalVideoUrl = (editingVideo.previewVideo || '').trim();
    const driveId = extractGoogleDriveId(finalVideoUrl);
    if (driveId) {
      // Store preview URL for embedding/playback and keep driveId
      finalVideoUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    }

    const videoToSave = {
      ...editingVideo,
      previewVideo: finalVideoUrl,
      videoStorageType: videoStorageType,
      driveId: driveId || null,
      formatLabel: editingVideo.format === '9:16' ? '9:16 Vertical Reel / Shorts' : '16:9 Landscape Broadcast Pack',
    };

    if (editingVideo.id && editingVideo.isNew !== true) {
      const idx = updated.creatorVideos.findIndex(v => v.id === editingVideo.id);
      if (idx !== -1) {
        updated.creatorVideos[idx] = videoToSave;
      }
      showToast('✅ व्हिडिओ पॅकेज अपडेट केले!');
    } else {
      const newVid = {
        ...videoToSave,
        id: `vid-${Date.now()}`,
        downloadsCount: 0,
      };
      delete newVid.isNew;
      updated.creatorVideos.unshift(newVid);
      showToast('✨ नवीन व्हिडिओ पॅकेज यशस्वीरीत्या सेव्ह झाले!');
    }

    setCmsData(updated);
    saveCmsData(updated);
    setEditingVideo(null);
    setVideoTestPlaying(false);
  };


  const handleDeleteVideo = (videoId) => {
    if (!confirm('हा व्हिडिओ पॅकेज खरंच डिलीट करायचा आहे का?')) return;
    const updated = { ...cmsData };
    updated.creatorVideos = updated.creatorVideos.filter(v => v.id !== videoId);
    setCmsData(updated);
    saveCmsData(updated);
    showToast('🗑️ व्हिडिओ पॅकेज डिलीट केले!');
  };

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔒</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>सुरक्षा तपासणी सुरू आहे...</h3>
        </div>
      </div>
    );
  }

  // If not authenticated, render secure Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'radial-gradient(ellipse at top, #1e293b, #0a0f1d)', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 56, 132, 0.2)',
          color: '#ffffff'
        }}>
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 64,
              height: 64,
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #003884 0%, #ea580c 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(234, 88, 12, 0.35)'
            }}>
              <Tv size={34} color="#ffffff" />
            </div>
            <div style={{ display: 'inline-block', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', border: '1px solid rgba(234, 88, 12, 0.4)', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '99px', marginBottom: 10, letterSpacing: 0.5 }}>
              🛡️ अधिकृत संपादकीय प्रवेश
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 6px 0', color: '#ffffff' }}>
              NEXVARTA CMS
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              कंट्रोल पॅनेलमध्ये प्रवेश करण्यासाठी कृपया आपला लॉगिन आयडी व पासवर्ड प्रविष्ट करा.
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
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Username / ID */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                लॉगिन आयडी / वापरकर्ता नाव (User ID)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: 14, color: '#64748b' }} />
                <input 
                  type="text"
                  placeholder="उदा. admin किंवा ईमेल"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
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
                सुरक्षित पासवर्ड (Password)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, color: '#64748b' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="आपला पासवर्ड प्रविष्ट करा"
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
              <Lock size={16} /> लॉगिन करा (Login to Admin)
            </button>
          </form>

          {/* Return to Portal Link */}
          <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}>
            <Link 
              href="/"
              style={{ 
                color: '#93c5fd', 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              ← मुख्य न्यूज पोर्टलवर परत जा
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !cmsData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚡</div>
          <h3>Nexvarta CMS लोड होत आहे...</h3>
        </div>
      </div>
    );
  }

  // Quick stats & workflow breakdown
  const allArticlesList = cmsData.newsSections.flatMap(s => s.articles || []);
  const totalArticles = allArticlesList.length;
  const publishedCount = allArticlesList.filter(a => !a.status || a.status === 'published').length;
  const scheduledCount = allArticlesList.filter(a => a.status === 'scheduled').length;
  const reviewCount = allArticlesList.filter(a => a.status === 'review').length;
  const draftCount = allArticlesList.filter(a => a.status === 'draft').length;
  const totalVideos = cmsData.creatorVideos.length;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Top Admin Navbar */}
      <header className="admin-header" style={{ background: '#003884', color: '#fff', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {cmsData?.siteConfig?.logoUrl ? (
            <img 
              src={cmsData.siteConfig.logoUrl} 
              alt="Logo" 
              style={{ height: 34, maxWidth: 120, objectFit: 'contain', background: 'rgba(255,255,255,0.1)', padding: 4, borderRadius: 6 }} 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ width: 34, height: 34, background: '#ea580c', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tv size={18} />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.1 }}>{cmsData?.siteConfig?.name || 'NEXVARTA CMS'}</h1>
            <span style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 600 }}>फुल ॲडमिन कंट्रोल पॅनल</span>
          </div>
        </div>

        <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/subscribe" target="_blank" style={{ background: '#ea580c', color: '#fff', fontSize: '0.85rem', fontWeight: 800, padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', boxShadow: '0 2px 8px rgba(234,88,12,0.3)' }}>
            <Sparkles size={15} /> 💎 सबस्क्रिप्शन विक्री पॅनेल
          </Link>
          <Link href="/" target="_blank" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ExternalLink size={15} /> मुख्य पोर्टल पहा
          </Link>
          <button 
            onClick={() => saveCmsData(cmsData)}
            disabled={isSaving}
            style={{ background: '#ea580c', color: '#fff', fontSize: '0.85rem', fontWeight: 800, padding: '8px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)' }}
          >
            <Save size={16} /> {isSaving ? 'सेव्ह होत आहे...' : 'सर्व बदल सेव्ह करा'}
          </button>
          <button 
            onClick={handleLogout}
            style={{ background: '#dc2626', color: '#fff', fontSize: '0.85rem', fontWeight: 700, padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(220,38,38,0.3)' }}
            title="लॉगिन सेशन बंद करा"
          >
            <LogOut size={16} /> बाहेर पडा
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="admin-main-wrapper" style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ width: 280, background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, paddingLeft: 12 }}>
            व्यवस्थापन विभाग
          </div>

          <button 
            onClick={() => setActiveTab('articles')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', color: activeTab === 'articles' ? '#fff' : '#475569', background: activeTab === 'articles' ? '#003884' : 'transparent', transition: 'all 0.15s ease' }}
          >
            <Newspaper size={18} />
            <span>बातम्या व कॅटेगरीज</span>
            <span style={{ marginLeft: 'auto', background: activeTab === 'articles' ? '#1e40af' : '#f1f5f9', color: activeTab === 'articles' ? '#fff' : '#64748b', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 99 }}>{totalArticles}</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', color: activeTab === 'analytics' ? '#fff' : '#475569', background: activeTab === 'analytics' ? '#003884' : 'transparent', transition: 'all 0.15s ease' }}
          >
            <BarChart3 size={18} />
            <span>📊 ॲनालिटिक्स व ट्रेंड्स</span>
            <span style={{ marginLeft: 'auto', background: activeTab === 'analytics' ? '#1e40af' : '#dcfce7', color: activeTab === 'analytics' ? '#fff' : '#15803d', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 99, fontWeight: 800 }}>LIVE</span>
          </button>

          <button 
            onClick={() => setActiveTab('shorts')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', color: activeTab === 'shorts' ? '#fff' : '#475569', background: activeTab === 'shorts' ? '#003884' : 'transparent' }}
          >
            <Zap size={18} />
            <span>शॉर्ट्स व ब्रेकिंग टिकर</span>
          </button>

          <button 
            onClick={() => setActiveTab('videos')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', color: activeTab === 'videos' ? '#fff' : '#475569', background: activeTab === 'videos' ? '#003884' : 'transparent' }}
          >
            <Video size={18} />
            <span>क्रिएटर व्हिडिओ स्टुडिओ</span>
            <span style={{ marginLeft: 'auto', background: activeTab === 'videos' ? '#1e40af' : '#f1f5f9', color: activeTab === 'videos' ? '#fff' : '#64748b', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 99 }}>{totalVideos}</span>
          </button>

          <button 
            onClick={() => setActiveTab('pricing')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', color: activeTab === 'pricing' ? '#fff' : '#475569', background: activeTab === 'pricing' ? '#003884' : 'transparent' }}
          >
            <CreditCard size={18} />
            <span>प्लॅन्स व प्राईसिंग</span>
          </button>

          <button 
            onClick={() => setActiveTab('livetv')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', color: activeTab === 'livetv' ? '#fff' : '#475569', background: activeTab === 'livetv' ? '#003884' : 'transparent' }}
          >
            <Tv size={18} />
            <span>Live TV व YouTube व्हिडिओ</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', color: activeTab === 'settings' ? '#fff' : '#475569', background: activeTab === 'settings' ? '#003884' : 'transparent' }}
          >
            <Settings size={18} />
            <span>साइट सेटिंग्स व संपर्क</span>
          </button>

          <Link
            href="/subscribe"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              fontWeight: 800,
              fontSize: '0.88rem',
              color: '#ea580c',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              textDecoration: 'none',
              marginTop: 6
            }}
          >
            <Sparkles size={18} />
            <span>💎 सबस्क्रिप्शन विक्री पॅनेल</span>
            <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
          </Link>

          <button onClick={() => setActiveTab('ads')} style={{ padding: '12px 16px', borderRadius: 8, textAlign: 'left', fontWeight: 700, color: activeTab === 'ads' ? '#fff' : '#003884', background: activeTab === 'ads' ? '#003884' : '#eff6ff' }}>जाहिराती व्यवस्थापन</button>
          {/* Quick Metrics Bar at bottom */}
          <div style={{ marginTop: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>सक्रिय पास किंमत:</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ea580c' }}>
              {cmsData.subscriptionPlan.pricing.monthly.display} / महिना
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: 4 }}>
              ● सर्व्हर सिंक सुरू आहे
            </div>
          </div>
        </aside>

        {/* Workspace Body */}
        <main className="admin-workspace" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {/* =========================================================================
              TAB 1: ARTICLES & NEWS MANAGER
              ========================================================================= */}
          {activeTab === 'ads' && <AdsManager />}
          {activeTab === 'articles' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>बातम्या व्यवस्थापन (News Articles)</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>पोर्टलवरील सर्व कॅटेगरीजमधील बातम्या जोडा, संपादित करा किंवा काढून टाका.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      setAiInputText('');
                      setAiResult(null);
                      setIsAiModalOpen(true);
                    }}
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontWeight: 800, padding: '10px 18px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
                  >
                    <Sparkles size={18} /> ✨ AI मराठी असिस्टंट
                  </button>
                  <button 
                    onClick={() => {
                      setEditingCategory({
                        isNew: true,
                        name: '',
                        slug: '',
                        color: '#2563eb'
                      });
                    }}
                    style={{ background: '#fff', color: '#003884', border: '2px solid #003884', fontWeight: 700, padding: '10px 18px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <FolderPlus size={18} /> + नवीन कॅटेगरी जोडा
                  </button>
                  <button 
                    onClick={() => {
                      setArticleCategoryTarget(cmsData.newsSections[0]?.id || 'pune');
                      setEditingArticle({
                        isNew: true,
                        badge: 'BREAKING',
                        badgeColor: '#dc2626',
                        title: '',
                        summary: '',
                        fullContent: '',
                        author: 'Nexvarta Bureau',
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        readTime: '3 min read',
                        status: 'published',
                        views: 12000,
                        shares: 420,
                        downloads: 85,
                        image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&q=80',
                        reelScript: ''
                      });
                    }}
                    style={{ background: '#003884', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  >
                    <Plus size={18} /> नवीन बातमी जोडा (Add News)
                  </button>
                </div>
              </div>

              {/* Featured Trending Article Selector Banner */}
              {(() => {
                const allArts = (cmsData.newsSections || []).flatMap(s => s.articles || []);
                const currentTrendingArt = allArts.find(a => a.id === cmsData.trendingArticleId) || allArts[0];
                return (
                  <div style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '2px solid #fdba74', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)' }}>
                        🔥
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            सध्याची मुख्य ट्रेंडिंग बातमी (Current Featured Trending Story)
                          </span>
                          <span style={{ fontSize: '0.7rem', background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 800 }}>
                            होमपेज स्पॉटलाइट
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7c2d12', marginTop: 4, marginBottom: 2 }}>
                          {currentTrendingArt ? currentTrendingArt.title : 'कोणतीही बातमी निवडलेली नाही'}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#9a3412' }}>
                          {currentTrendingArt ? `ID: ${currentTrendingArt.id} • ${currentTrendingArt.date || ''} • 👁️ ${currentTrendingArt.views || 0} व्ह्यूज` : ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9a3412' }}>बदला:</span>
                      <select
                        value={cmsData.trendingArticleId || currentTrendingArt?.id || ''}
                        onChange={(e) => handleSetTrendingArticle(e.target.value)}
                        style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid #ea580c', background: '#fff', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', maxWidth: 360, cursor: 'pointer' }}
                      >
                        {allArts.map(art => (
                          <option key={art.id} value={art.id}>
                            {art.title.length > 55 ? art.title.slice(0, 55) + '...' : art.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })()}

              {/* Editorial Workflow Status Filter Bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', background: '#fff', padding: '12px 18px', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sliders size={15} /> संपादकीय वर्कफ्लो (Status):
                </span>
                {[
                  { id: 'all', label: 'सर्व बातम्या', count: totalArticles },
                  { id: 'published', label: '🟢 प्रसिद्ध (Live)', count: publishedCount },
                  { id: 'scheduled', label: '🔵 शेड्यूल (Scheduled)', count: scheduledCount },
                  { id: 'review', label: '🟠 तपासणी बाकी (Review)', count: reviewCount },
                  { id: 'draft', label: '🟡 मसुदा (Drafts)', count: draftCount },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setArticleStatusFilter(filter.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1px solid',
                      borderColor: articleStatusFilter === filter.id ? '#003884' : '#cbd5e1',
                      background: articleStatusFilter === filter.id ? '#003884' : '#f8fafc',
                      color: articleStatusFilter === filter.id ? '#fff' : '#334155',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {filter.label}
                    <span style={{
                      background: articleStatusFilter === filter.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: articleStatusFilter === filter.id ? '#fff' : '#0f172a',
                      padding: '1px 6px',
                      borderRadius: 99,
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sections & Articles Loop */}
              {cmsData.newsSections.map((section, secIdx) => (
                <div key={section.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, marginBottom: 28, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '2px solid #f1f5f9', paddingBottom: 14, flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: section.color }}></span>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{section.name}</h3>
                      <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>
                        /{section.slug}
                      </span>
                      <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 99, fontWeight: 800 }}>
                        ★ Priority #{secIdx + 1}
                      </span>
                      <span style={{ fontSize: '0.8rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 99 }}>
                        {section.articles.length} बातम्या
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {/* Priority Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 4px' }}>
                        <button
                          onClick={() => handleMoveCategory(secIdx, 'up')}
                          disabled={secIdx === 0}
                          title="प्राधान्य वर करा (Move Up)"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '4px 6px',
                            cursor: secIdx === 0 ? 'not-allowed' : 'pointer',
                            opacity: secIdx === 0 ? 0.35 : 1,
                            color: '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 4
                          }}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', padding: '0 4px' }}>
                          #{secIdx + 1}
                        </span>
                        <button
                          onClick={() => handleMoveCategory(secIdx, 'down')}
                          disabled={secIdx === cmsData.newsSections.length - 1}
                          title="प्राधान्य खाली करा (Move Down)"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '4px 6px',
                            cursor: secIdx === cmsData.newsSections.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: secIdx === cmsData.newsSections.length - 1 ? 0.35 : 1,
                            color: '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 4
                          }}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>

                      {/* Edit Category */}
                      <button
                        onClick={() => setEditingCategory({
                          isNew: false,
                          id: section.id,
                          name: section.name,
                          slug: section.slug,
                          color: section.color
                        })}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '6px 10px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                        title="कॅटेगरी नाव किंवा रंग बदला"
                      >
                        <Edit3 size={13} /> कॅटेगरी एडिट
                      </button>

                      {/* Delete Category */}
                      <button
                        onClick={() => handleDeleteCategory(section.id, section.name)}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '6px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        title="कॅटेगरी डिलीट करा"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Add Article to Section */}
                      <button 
                        onClick={() => {
                          setArticleCategoryTarget(section.id);
                          setEditingArticle({
                            isNew: true,
                            badge: 'BREAKING',
                            badgeColor: '#ea580c',
                            title: '',
                            summary: '',
                            fullContent: '',
                            author: 'Nexvarta Bureau',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            readTime: '3 min read',
                            views: 5000,
                            shares: 420
                          });
                        }}
                        style={{ fontSize: '0.825rem', background: '#003884', color: '#fff', padding: '6px 12px', borderRadius: 6, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                      >
                        <Plus size={14} /> या विभागात जोडा
                      </button>
                    </div>
                  </div>

                  {/* Articles List with Workflow & Metrics */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {section.articles
                      .filter(article => {
                        if (articleStatusFilter === 'all') return true;
                        if (articleStatusFilter === 'published') return !article.status || article.status === 'published';
                        return article.status === articleStatusFilter;
                      })
                      .map(article => (
                      <div key={article.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', gap: 16, flexWrap: 'wrap' }}>
                        
                        {/* Left: Article Thumbnail (if exists) */}
                        {article.image && (
                          <div style={{ position: 'relative', width: 96, height: 68, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid #cbd5e1', background: '#0f172a' }}>
                            <img 
                              src={article.image} 
                              alt={article.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, textAlign: 'center', padding: '1px 0' }}>
                              🔴 NEXVARTA
                            </div>
                          </div>
                        )}

                        {/* Middle: Details, Status & Stats */}
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: article.badgeColor || '#ea580c', background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 4 }}>
                              {article.badge}
                            </span>

                            {(cmsData.trendingArticleId === article.id || article.isTrending) && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fff', background: '#ea580c', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 5px rgba(234, 88, 12, 0.3)' }}>
                                🔥 मुख्य ट्रेंडिंग बातमी
                              </span>
                            )}

                            {/* Status Badge */}
                            {article.status === 'scheduled' ? (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e40af', background: '#dbeafe', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={11} /> शेड्यूल: {article.scheduledAt ? new Date(article.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'उद्या'}
                              </span>
                            ) : article.status === 'review' ? (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c2410c', background: '#ffedd5', border: '1px solid #fed7aa', padding: '2px 8px', borderRadius: 4 }}>
                                🟠 तपासणी बाकी (Review)
                              </span>
                            ) : article.status === 'draft' ? (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a16207', background: '#fef9c3', border: '1px solid #fef08a', padding: '2px 8px', borderRadius: 4 }}>
                                🟡 कच्चा मसुदा (Draft)
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 4 }}>
                                🟢 प्रसिद्ध (Live)
                              </span>
                            )}

                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{article.date} • {article.author}</span>
                          </div>

                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                            {article.title}
                          </h4>
                          <p style={{ fontSize: '0.825rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {article.summary}
                          </p>

                          {/* Live Performance Stats Strip */}
                          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 8, fontSize: '0.75rem', color: '#475569', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                              👁️ {typeof article.views === 'number' ? article.views.toLocaleString() : (article.views || '14,200')} व्ह्यूज
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                              ↗️ {typeof article.shares === 'number' ? article.shares.toLocaleString() : (article.shares || '480')} शेअर्स
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                              📥 {typeof article.downloads === 'number' ? article.downloads.toLocaleString() : (article.downloads || '110')} डाऊनलोड्स
                            </span>
                            {article.reelScript && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f3e8ff', color: '#7e22ce', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                                🎬 ९:१६ रील्स स्क्रिप्ट
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Quick Status Changer & Actions */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', alignSelf: 'center' }}>
                          {/* 1-Click Trending Selector Button */}
                          <button
                            onClick={() => handleSetTrendingArticle(article.id)}
                            style={{
                              background: (cmsData.trendingArticleId === article.id || article.isTrending) ? '#ea580c' : '#fff',
                              color: (cmsData.trendingArticleId === article.id || article.isTrending) ? '#fff' : '#ea580c',
                              border: '1.5px solid #ea580c',
                              padding: '8px 12px',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: (cmsData.trendingArticleId === article.id || article.isTrending) ? '0 2px 6px rgba(234, 88, 12, 0.3)' : 'none'
                            }}
                            title="ही बातमी होमपेजवर मुख्य TRENDING स्पॉटलाइट बातमी म्हणून सेट करा"
                          >
                            {(cmsData.trendingArticleId === article.id || article.isTrending) ? '⭐ ट्रेंडिंग सेट आहे' : '🔥 ट्रेंडिंग बनवा'}
                          </button>

                          <select
                            value={article.status || 'published'}
                            onChange={(e) => handleQuickStatusChange(section.id, article.id, e.target.value)}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '8px 10px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: '#0f172a',
                              cursor: 'pointer'
                            }}
                            title="स्टेटस थेट बदला"
                          >
                            <option value="published">🟢 Published</option>
                            <option value="scheduled">🔵 Scheduled</option>
                            <option value="review">🟠 Review Pending</option>
                            <option value="draft">🟡 Draft</option>
                          </select>

                          <Link 
                            href={`/news/${article.id}`}
                            target="_blank"
                            style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '8px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                            title="थेट पोर्टलवर बातमी कशी दिसते ते पहा"
                          >
                            <ExternalLink size={14} /> पहा
                          </Link>
                          <button 
                            onClick={() => {
                              setArticleCategoryTarget(section.id);
                              let artViews = article.views;
                              if (typeof artViews === 'string') {
                                const n = parseInt(artViews.replace(/,/g, '').replace(/[\u0966-\u096F]/g, d => d.charCodeAt(0) - 2406), 10);
                                if (!isNaN(n)) artViews = n;
                              }
                              let artShares = article.shares;
                              if (typeof artShares === 'string') {
                                const s = parseInt(artShares.replace(/,/g, '').replace(/[\u0966-\u096F]/g, d => d.charCodeAt(0) - 2406), 10);
                                if (!isNaN(s)) artShares = s;
                              }
                              setEditingArticle({ ...article, views: artViews, shares: artShares });
                            }}
                            style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#003884', padding: '8px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                          >
                            <Edit3 size={14} /> एडिट
                          </button>
                          <button 
                            onClick={() => handleDeleteArticle(section.id, article.id)}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                          >
                            <Trash2 size={14} /> डिलीट
                          </button>
                        </div>
                      </div>
                    ))}
                    {section.articles.filter(article => {
                      if (articleStatusFilter === 'all') return true;
                      if (articleStatusFilter === 'published') return !article.status || article.status === 'published';
                      return article.status === articleStatusFilter;
                    }).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        या फिल्टर अंतर्गत कोणतीही बातमी उपलब्ध नाही.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =========================================================================
              TAB 2: SHORTS & TICKERS
              ========================================================================= */}
          {activeTab === 'shorts' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>शॉर्ट्स व ब्रेकिंग टिकर</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 24 }}>होमपेजवरील फिरणारी ब्रेकिंग न्यूज पट्टी आणि ६ मुख्य शॉर्ट्स कार्डे बदला.</p>

              {/* Breaking Tickers Editor */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                      🔴 ब्रेकिंग न्यूज टिकर (Live Headings & Speed Control)
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                      होमपेजवरील फिरणाऱ्या ब्रेकिंग न्यूज बातम्या आणि त्यांचा फिरण्याचा वेग (Scroll Speed) नियंत्रित करा.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => saveCmsData(cmsData)}
                    disabled={isSaving}
                    style={{
                      background: '#ea580c',
                      color: '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 6px rgba(234,88,12,0.3)'
                    }}
                  >
                    <Save size={15} /> {isSaving ? 'सेव्ह होत आहे...' : 'बदल सेव्ह करा'}
                  </button>
                </div>

                {/* ⚡ Ticker Speed Management Panel */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: '1px solid #cbd5e1',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(234,88,12,0.3)' }}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                          टिकर फिरण्याचा वेग (Scroll Speed Control)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          कमी सेकंद = जलद गती | जास्त सेकंद = हळूवार व वाचनीय गती
                        </div>
                      </div>
                    </div>

                    {/* Speed category status badge */}
                    <div style={{
                      padding: '6px 14px',
                      borderRadius: 99,
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: (cmsData.tickerSpeed || 28) <= 18 
                        ? '#fef2f2' 
                        : (cmsData.tickerSpeed || 28) <= 25 
                        ? '#eff6ff' 
                        : (cmsData.tickerSpeed || 28) <= 35 
                        ? '#f0fdf4' 
                        : '#faf5ff',
                      color: (cmsData.tickerSpeed || 28) <= 18 
                        ? '#dc2626' 
                        : (cmsData.tickerSpeed || 28) <= 25 
                        ? '#2563eb' 
                        : (cmsData.tickerSpeed || 28) <= 35 
                        ? '#16a34a' 
                        : '#9333ea',
                      border: `1px solid ${(cmsData.tickerSpeed || 28) <= 18 ? '#fecaca' : (cmsData.tickerSpeed || 28) <= 25 ? '#bfdbfe' : (cmsData.tickerSpeed || 28) <= 35 ? '#bbf7d0' : '#e9d5ff'}`
                    }}>
                      <Clock size={14} />
                      <span>
                        {(cmsData.tickerSpeed || 28) <= 18 
                          ? `⚡ खूप जलद (${cmsData.tickerSpeed || 28}s)` 
                          : (cmsData.tickerSpeed || 28) <= 25 
                          ? `🚀 वेगवान (${cmsData.tickerSpeed || 28}s)` 
                          : (cmsData.tickerSpeed || 28) <= 35 
                          ? `⚖️ संतुलित / मध्यम (${cmsData.tickerSpeed || 28}s)` 
                          : `📖 हळूवार / वाचनीय (${cmsData.tickerSpeed || 28}s)`}
                      </span>
                    </div>
                  </div>

                  {/* Preset Speed Buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {[
                      { label: '⚡ जलद (15s)', val: 15 },
                      { label: '🚀 वेगवान (22s)', val: 22 },
                      { label: '⚖️ मध्यम / डीफॉल्ट (28s)', val: 28 },
                      { label: '📖 हळूवार / वाचनीय (38s)', val: 38 },
                      { label: '🐢 अतिशय हळू (50s)', val: 50 }
                    ].map(preset => {
                      const isSelected = (cmsData.tickerSpeed || 28) === preset.val;
                      return (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => {
                            const updated = { ...cmsData, tickerSpeed: preset.val };
                            setCmsData(updated);
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            border: isSelected ? '2px solid #ea580c' : '1px solid #cbd5e1',
                            background: isSelected ? '#ea580c' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#334155',
                            boxShadow: isSelected ? '0 2px 6px rgba(234,88,12,0.3)' : 'none'
                          }}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Range Slider & Manual Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#ffffff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                    <Sliders size={18} style={{ color: '#64748b' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', minWidth: 65 }}>१०s (जलद)</span>
                    <input 
                      type="range"
                      min="10"
                      max="60"
                      step="1"
                      value={cmsData.tickerSpeed || 28}
                      onChange={(e) => {
                        const updated = { ...cmsData, tickerSpeed: parseInt(e.target.value, 10) };
                        setCmsData(updated);
                      }}
                      style={{ flex: 1, accentColor: '#ea580c', cursor: 'pointer', height: 6 }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', minWidth: 65, textAlign: 'right' }}>६०s (हळू)</span>
                    
                    {/* Stepper buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, borderLeft: '1px solid #e2e8f0', paddingLeft: 12 }}>
                      <button 
                        type="button"
                        onClick={() => {
                          const current = cmsData.tickerSpeed || 28;
                          if (current > 10) {
                            setCmsData({ ...cmsData, tickerSpeed: current - 2 });
                          }
                        }}
                        title="२ सेकंद वेग वाढवा"
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', minWidth: 42, textAlign: 'center' }}>
                        {cmsData.tickerSpeed || 28}s
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          const current = cmsData.tickerSpeed || 28;
                          if (current < 60) {
                            setCmsData({ ...cmsData, tickerSpeed: current + 2 });
                          }
                        }}
                        title="२ सेकंद वेग कमी करा (हळू)"
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Live Simulation Preview in Admin */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Eye size={14} style={{ color: '#ea580c' }} /> थेट प्रिव्ह्यू (Live Simulation - {cmsData.tickerSpeed || 28} सेकंद):
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        होमपेजवर या वेगाने बातमी पट्टी फिरेल
                      </span>
                    </div>

                    <div style={{
                      background: '#0f172a',
                      borderRadius: 8,
                      padding: '8px 12px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      border: '1px solid #1e293b'
                    }}>
                      <div style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                        letterSpacing: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#fff' }}></span>
                        LIVE
                      </div>

                      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', whiteSpace: 'nowrap' }}>
                        <div 
                          key={cmsData.tickerSpeed || 28}
                          style={{
                            display: 'inline-flex',
                            whiteSpace: 'nowrap',
                            animation: `tickerScroll ${cmsData.tickerSpeed || 28}s linear infinite`
                          }}
                        >
                          {(cmsData.breakingTickers || []).concat(cmsData.breakingTickers || []).map((t, idx) => (
                            <span key={idx} style={{ color: '#f8fafc', fontSize: '0.84rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', marginRight: 24 }}>
                              <span>{t}</span>
                              <span style={{ color: '#ea580c', marginLeft: 16 }}>•</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Breaking News Headings List */}
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
                  📝 ब्रेकिंग न्यूज मथळे (Live Headings List)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {cmsData.breakingTickers.map((ticker, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10 }}>
                      <input 
                        type="text" 
                        value={ticker} 
                        onChange={(e) => {
                          const updated = { ...cmsData };
                          updated.breakingTickers[idx] = e.target.value;
                          setCmsData(updated);
                        }}
                        style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' }}
                      />
                      <button 
                        onClick={() => {
                          const updated = { ...cmsData };
                          updated.breakingTickers.splice(idx, 1);
                          setCmsData(updated);
                        }}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: 8 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    const updated = { ...cmsData };
                    updated.breakingTickers.push('नवीन ब्रेकिंग बातमी येथे टाईप करा...');
                    setCmsData(updated);
                  }}
                  style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: 700, padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem' }}
                >
                  ➕ नवीन टिकर जोडा
                </button>
              </div>

              {/* Nexvarta Shorts Editor */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 14 }}>⚡ Nexvarta Shorts (६ मुख्य कार्डे)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {cmsData.nexvartaShorts.map((short, idx) => (
                    <div key={short.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: '40%' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>टॅग (उदा. AI)</label>
                          <input 
                            type="text" 
                            value={short.tag} 
                            onChange={(e) => {
                              const updated = { ...cmsData };
                              updated.nexvartaShorts[idx].tag = e.target.value;
                              setCmsData(updated);
                            }}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                          />
                        </div>
                        <div style={{ width: '60%' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>बॅकग्राउंड कलर कोड</label>
                          <input 
                            type="color" 
                            value={short.bg} 
                            onChange={(e) => {
                              const updated = { ...cmsData };
                              updated.nexvartaShorts[idx].bg = e.target.value;
                              setCmsData(updated);
                            }}
                            style={{ width: '100%', height: 38, padding: '2px', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>शॉर्ट हेडलाईन</label>
                        <input 
                          type="text" 
                          value={short.title} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            updated.nexvartaShorts[idx].title = e.target.value;
                            setCmsData(updated);
                          }}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: CREATOR VIDEO PACKAGES MANAGER
              ========================================================================= */}
          {activeTab === 'videos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>क्रिएटर व्हिडिओ स्टुडिओ व्यवस्थापन</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>यूट्यूबर्स आणि इन्स्टासाठी 9:16 रील्स आणि 16:9 व्हिडिओ पॅकेजेस व्यवस्थापित करा.</p>
                </div>
                <button 
                  onClick={() => setEditingVideo({
                    isNew: true,
                    title: '',
                    format: '9:16',
                    category: 'Pune News',
                    duration: '0:50 min',
                    resolution: '1080x1920 Full HD',
                    fps: '60 FPS',
                    date: 'Just Now',
                    fileSize: '85.0 MB',
                    thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
                    previewVideo: '/videos/pune-metro-footage.mp4',
                    scriptMarathi: '',
                    scriptEnglish: '',
                  })}
                  style={{ background: '#ea580c', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Plus size={18} /> नवीन व्हिडिओ पॅकेज जोडा
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                {cmsData.creatorVideos.map(vid => (
                  <div key={vid.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18, display: 'flex', gap: 16 }}>
                    <div style={{ width: 120, height: 120, borderRadius: 8, overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                      <img src={vid.thumbnail} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <span style={{ background: '#003884', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                          {vid.format === '9:16' ? '📱 9:16 REEL' : '🖥️ 16:9 4K'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{vid.resolution} • {vid.duration}</span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.3 }}>{vid.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{vid.scriptMarathi}"
                      </p>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          onClick={() => setEditingVideo({ ...vid })}
                          style={{ background: '#f1f5f9', color: '#003884', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Edit3 size={13} /> एडिट पॅकेज
                        </button>
                        <button 
                          onClick={() => handleDeleteVideo(vid.id)}
                          style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Trash2 size={13} /> डिलीट
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: PLANS & PRICING
              ========================================================================= */}
          {activeTab === 'pricing' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>सबस्क्रिप्शन प्लॅन व प्राईसिंग</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 24 }}>All-in-One Creator Pass ची किंमत आणि फिचर्स थेट येथून बदला.</p>

              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, maxWidth: 700 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>मासिक किंमत (Monthly Price)</label>
                    <input 
                      type="number" 
                      value={cmsData.subscriptionPlan.pricing.monthly.price} 
                      onChange={(e) => {
                        const updated = { ...cmsData };
                        const val = parseInt(e.target.value) || 0;
                        updated.subscriptionPlan.pricing.monthly.price = val;
                        updated.subscriptionPlan.pricing.monthly.display = `₹${val}`;
                        setCmsData(updated);
                      }}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>वार्षिक किंमत (Yearly Price)</label>
                    <input 
                      type="number" 
                      value={cmsData.subscriptionPlan.pricing.yearly.price} 
                      onChange={(e) => {
                        const updated = { ...cmsData };
                        const val = parseInt(e.target.value) || 0;
                        updated.subscriptionPlan.pricing.yearly.price = val;
                        updated.subscriptionPlan.pricing.yearly.display = `₹${val.toLocaleString('en-IN')}`;
                        setCmsData(updated);
                      }}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>वार्षिक ऑफर टॅग (Savings Badge)</label>
                  <input 
                    type="text" 
                    value={cmsData.subscriptionPlan.pricing.yearly.savings} 
                    onChange={(e) => {
                      const updated = { ...cmsData };
                      updated.subscriptionPlan.pricing.yearly.savings = e.target.value;
                      setCmsData(updated);
                    }}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 8, display: 'block' }}>समाविष्ट फिचर्स (Bullet Points)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {cmsData.subscriptionPlan.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 10 }}>
                        <input 
                          type="text" 
                          value={feat} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            updated.subscriptionPlan.features[idx] = e.target.value;
                            setCmsData(updated);
                          }}
                          style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' }}
                        />
                        <button 
                          onClick={() => {
                            const updated = { ...cmsData };
                            updated.subscriptionPlan.features.splice(idx, 1);
                            setCmsData(updated);
                          }}
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: 8 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      const updated = { ...cmsData };
                      updated.subscriptionPlan.features.push('नवीन फिचर पॉईंट येथे लिहा...');
                      setCmsData(updated);
                    }}
                    style={{ background: '#f1f5f9', padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, marginTop: 12 }}
                  >
                    ➕ नवीन फिचर जोडा
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: LIVE TV & YOUTUBE VIDEOS CONTROL
              ========================================================================= */}
          {activeTab === 'livetv' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Live TV व YouTube व्हिडिओ व्यवस्थापन</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>२४x७ लाइव्ह ब्रॉडकास्ट आणि मुख्य पानावरील YouTube व्हिडिओ कव्हरेज व्यवस्थापित करा.</p>
                </div>
                <button
                  type="button"
                  onClick={() => saveCmsData(cmsData)}
                  disabled={isSaving}
                  style={{
                    background: '#ea580c',
                    color: '#fff',
                    fontWeight: 800,
                    padding: '10px 22px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
                  }}
                >
                  <Save size={16} /> {isSaving ? 'सेव्ह होत आहे...' : 'सर्व बदल सेव्ह करा'}
                </button>
              </div>

              {/* 1. Live TV Stream Box */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, marginBottom: 28 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tv size={20} color="#dc2626" /> २४x७ Live TV कंट्रोलर (Live Stream)
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: 18 }}>
                  हेडरमधील "Live TV" बटणावर क्लिक केल्यावर सुरू होणारा थेट प्रवाह (YouTube Live, HLS किंवा MP4 लिंक).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>लाइव्ह स्ट्रीम शीर्षक (Stream Title)</label>
                    <input 
                      type="text" 
                      value={cmsData.liveTv?.title || ''} 
                      onChange={(e) => {
                        const updated = { ...cmsData };
                        if (!updated.liveTv) updated.liveTv = {};
                        updated.liveTv.title = e.target.value;
                        setCmsData(updated);
                      }}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>व्हिडिओ MP4 / HLS / YouTube URL</label>
                    <input 
                      type="url" 
                      value={cmsData.liveTv?.videoUrl || ''} 
                      placeholder="उदा. https://www.youtube.com/watch?v=..."
                      onChange={(e) => {
                        const updated = { ...cmsData };
                        if (!updated.liveTv) updated.liveTv = {};
                        updated.liveTv.videoUrl = e.target.value;
                        setCmsData(updated);
                      }}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>दर्शकांची संख्या (Live Viewers Text)</label>
                    <input 
                      type="text" 
                      value={cmsData.liveTv?.viewers || ''} 
                      onChange={(e) => {
                        const updated = { ...cmsData };
                        if (!updated.liveTv) updated.liveTv = {};
                        updated.liveTv.viewers = e.target.value;
                        setCmsData(updated);
                      }}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Homepage Featured YouTube Videos Showcase */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Play size={20} color="#ea580c" /> होमपेज "नेक्सवार्ता व्हिडिओ कव्हरेज" (YouTube Playlist)
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: 4, marginBottom: 0 }}>
                      होमपेजवर ट्रेंडिंग बातमीच्या खाली दिसणारे YouTube व्हिडिओ येथे जोडा, संपादित करा किंवा बदला.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...cmsData };
                      if (!updated.featuredYoutubeVideos) updated.featuredYoutubeVideos = [];
                      updated.featuredYoutubeVideos.push({
                        id: `yt-${Date.now()}`,
                        title: 'नवीन विशेष व्हिडिओ बातमी',
                        url: 'https://www.youtube.com/watch?v=0k2ZzkwbFao',
                        tag: 'ताज्या घडामोडी',
                        duration: '३:३०',
                        views: '१० हजार+'
                      });
                      setCmsData(updated);
                      showToast('✅ नवीन व्हिडिओ जोडला! माहिती भरून सेव्ह करा.');
                    }}
                    style={{
                      background: '#003884',
                      color: '#fff',
                      fontWeight: 700,
                      padding: '8px 16px',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} /> नवीन YouTube व्हिडिओ जोडा
                  </button>
                </div>

                {/* Video List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(cmsData.featuredYoutubeVideos || []).map((video, idx) => {
                    const ytMatch = video.url ? video.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/) : null;
                    const videoId = (ytMatch && ytMatch[2].length === 11) ? ytMatch[2] : null;
                    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400';

                    return (
                      <div 
                        key={video.id || idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '140px 1fr auto',
                          gap: 16,
                          alignItems: 'center',
                          padding: 16,
                          background: '#f8fafc',
                          borderRadius: 10,
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {/* Video Thumbnail */}
                        <div style={{ position: 'relative', width: 140, height: 80, borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                          <img src={thumbUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                              <Play size={12} fill="#fff" />
                            </div>
                          </div>
                        </div>

                        {/* Video Form Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>व्हिडिओ शीर्षक (Title) *</label>
                            <input 
                              type="text" 
                              value={video.title || ''}
                              onChange={(e) => {
                                const updated = { ...cmsData };
                                updated.featuredYoutubeVideos[idx].title = e.target.value;
                                setCmsData(updated);
                              }}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 2 }}
                            />
                          </div>

                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>YouTube URL (उदा. https://www.youtube.com/watch?v=...) *</label>
                            <input 
                              type="url" 
                              value={video.url || ''}
                              onChange={(e) => {
                                const updated = { ...cmsData };
                                updated.featuredYoutubeVideos[idx].url = e.target.value;
                                setCmsData(updated);
                              }}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 2 }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>टॅग (Tag / Category)</label>
                            <input 
                              type="text" 
                              value={video.tag || ''}
                              placeholder="उदा. ऑन-ग्राउंड स्पेशल"
                              onChange={(e) => {
                                const updated = { ...cmsData };
                                updated.featuredYoutubeVideos[idx].tag = e.target.value;
                                setCmsData(updated);
                              }}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 2 }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>कालावधी (Duration)</label>
                            <input 
                              type="text" 
                              value={video.duration || ''}
                              placeholder="उदा. ४:२५"
                              onChange={(e) => {
                                const updated = { ...cmsData };
                                updated.featuredYoutubeVideos[idx].duration = e.target.value;
                                setCmsData(updated);
                              }}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 2 }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>व्ह्यूज (Views Display)</label>
                            <input 
                              type="text" 
                              value={video.views || ''}
                              placeholder="उदा. २५ हजार+"
                              onChange={(e) => {
                                const updated = { ...cmsData };
                                updated.featuredYoutubeVideos[idx].views = e.target.value;
                                setCmsData(updated);
                              }}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 2 }}
                            />
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div>
                          <button
                            type="button"
                            title="व्हिडिओ काढून टाका"
                            onClick={() => {
                              if (confirm('हा YouTube व्हिडिओ काढून टाकायचा आहे का?')) {
                                const updated = { ...cmsData };
                                updated.featuredYoutubeVideos = updated.featuredYoutubeVideos.filter((_, i) => i !== idx);
                                setCmsData(updated);
                                showToast('🗑️ व्हिडिओ काढून टाकला!');
                              }
                            }}
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: 8,
                              borderRadius: 8,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {(!cmsData.featuredYoutubeVideos || cmsData.featuredYoutubeVideos.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                      कोणताही YouTube व्हिडिओ उपलब्ध नाही. वरील <strong>"नवीन YouTube व्हिडिओ जोडा"</strong> बटण दाबून व्हिडिओ जोडा.
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Helpful Info Card: How to embed YouTube videos in news stories */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 18 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  💡 बातमीच्या मजकुरात (News Article) YouTube व्हिडिओ कसा दाखवावा?
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#14532d', lineHeight: 1.6, margin: 0 }}>
                  कोणत्याही बातमीत YouTube व्हिडिओ दाखवण्यासाठी, <strong>"बातम्या व्यवस्थापन"</strong> मध्ये जाऊन बातमीच्या सविस्तर मजकुरात नवीन ओळीवर फक्त YouTube व्हिडिओची लिंक (उदा. <code>https://www.youtube.com/watch?v=aqz-KE-bpKQ</code> किंवा <code>https://youtu.be/...</code>) पेस्ट करा. ती बातमी वाचणाऱ्यांसाठी आपोआप थेट प्ले होणारा YouTube प्लेयर बनेल!
                </p>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: SITE SETTINGS & CONTACT
              ========================================================================= */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>साइट सेटिंग्स, स्टॅट्स व संपर्क</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 24 }}>About मजकूर, स्टॅट्स आकडे, पिंपरी मुख्यालय पत्ता, फोन व ईमेल बदला.</p>

              {/* Site Logo & Header Branding Card */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ImageIcon size={22} color="#ea580c" /> वेबसाइट लोगो (Site Logo & Branding)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                      मुख्य हेडर, फुटर आणि ॲडमिन पॅनेलवर दिसणारा अधिकृत लोगो बदला किंवा नवीन अपलोड करा.
                    </p>
                  </div>
                  {cmsData.siteConfig?.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Trash2 size={14} /> लोगो काढा (Remove Logo)
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
                  {/* Left: Upload & URL Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Option 1: File Upload */}
                    <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 12, padding: '20px 18px', textAlign: 'center' }}>
                      <input 
                        type="file" 
                        id="logoFileInput" 
                        accept="image/png,image/jpeg,image/webp,image/svg+xml" 
                        style={{ display: 'none' }}
                        onClick={(e) => { e.target.value = null; }}
                        onChange={handleLogoUpload}
                        disabled={isLogoUploading}
                      />
                      <label 
                        htmlFor="logoFileInput" 
                        style={{ 
                          cursor: isLogoUploading ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: '#003884',
                          color: '#fff',
                          padding: '10px 20px',
                          borderRadius: 8,
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          boxShadow: '0 2px 8px rgba(0,56,132,0.25)'
                        }}
                      >
                        <UploadCloud size={18} /> {isLogoUploading ? 'अपलोड होत आहे...' : '📁 संगणकावरून नवीन लोगो अपलोड करा'}
                      </label>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '10px 0 0 0' }}>
                        सपोर्टेड फॉरमॅट: PNG, SVG, WEBP, JPG (कमाल 5MB)<br/>
                        <strong>टिप:</strong> पारदर्शक (Transparent Background) असलेला लोगो सर्वोत्तम दिसतो.
                      </p>
                    </div>

                    {/* Option 2: Image URL input */}
                    <div>
                      <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        किंवा थेट लोगो इमेज लिंक (Direct Image URL) प्रविष्ट करा:
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input 
                          type="text" 
                          placeholder="उदा. https://nvnews.in/logo.png किंवा /uploads/logos/..."
                          value={cmsData.siteConfig?.logoUrl || ''} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            if (!updated.siteConfig) updated.siteConfig = {};
                            updated.siteConfig.logoUrl = e.target.value;
                            setCmsData(updated);
                          }}
                          style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.875rem' }}
                        />
                      </div>
                    </div>

                    {/* Display option: Logo only vs Logo + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f1f5f9', padding: '10px 14px', borderRadius: 8 }}>
                      <input 
                        type="checkbox"
                        id="logoOnlyCheckbox"
                        checked={Boolean(cmsData.siteConfig?.logoOnly)}
                        onChange={(e) => {
                          const updated = { ...cmsData };
                          if (!updated.siteConfig) updated.siteConfig = {};
                          updated.siteConfig.logoOnly = e.target.checked;
                          setCmsData(updated);
                        }}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <label htmlFor="logoOnlyCheckbox" style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                        फक्त लोगो दाखवा (ब्रँड नाव व टॅगलाईन लपवा)
                      </label>
                    </div>
                  </div>

                  {/* Right: Live Logo Preview Box */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#475569' }}>लाइव्ह लोगो प्रिव्ह्यू (Live Preview)</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => setLogoPreviewBg('light')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: logoPreviewBg === 'light' ? '#003884' : '#fff',
                            color: logoPreviewBg === 'light' ? '#fff' : '#64748b',
                            cursor: 'pointer'
                          }}
                        >
                          ☀️ पांढरा
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoPreviewBg('dark')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: logoPreviewBg === 'dark' ? '#003884' : '#fff',
                            color: logoPreviewBg === 'dark' ? '#fff' : '#64748b',
                            cursor: 'pointer'
                          }}
                        >
                          🌙 निळा
                        </button>
                      </div>
                    </div>

                    <div style={{
                      height: 120,
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                      background: logoPreviewBg === 'light' ? '#ffffff' : '#002255',
                      backgroundImage: logoPreviewBg === 'light' 
                        ? 'radial-gradient(#e2e8f0 1px, transparent 1px)' 
                        : 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                      transition: 'background 0.2s ease'
                    }}>
                      {cmsData.siteConfig?.logoUrl ? (
                        logoLoadError ? (
                          <div style={{ textAlign: 'center', padding: '10px 14px' }}>
                            <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem', marginBottom: 6 }}>
                              ⚠️ लोगो इमेज ब्राउझरमध्ये लोड झाली नाही (CMYK किंवा अनसपोर्टेड फॉरमॅट असू शकतो).
                            </div>
                            <button
                              type="button"
                              onClick={handleAutoFixLogo}
                              disabled={isLogoUploading}
                              style={{
                                background: '#ea580c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 14px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(234,88,12,0.3)'
                              }}
                            >
                              {isLogoUploading ? 'रूपांतरित होत आहे...' : '🔄 लोगो स्वयंचलित sRGB मध्ये रूपांतरित करा'}
                            </button>
                          </div>
                        ) : (
                          <img 
                            key={cmsData.siteConfig.logoUrl}
                            src={cmsData.siteConfig.logoUrl} 
                            alt="Site Logo Preview" 
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            onError={() => {
                              setLogoLoadError(true);
                            }}
                            onLoad={() => {
                              setLogoLoadError(false);
                            }}
                          />
                        )
                      ) : (
                        <div style={{ textAlign: 'center', color: logoPreviewBg === 'light' ? '#94a3b8' : '#93c5fd' }}>
                          <Tv size={36} style={{ margin: '0 auto 6px', display: 'block' }} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>सध्या डिफॉल्ट टीव्ही आयकॉन वापरात आहे</span>
                        </div>
                      )}
                    </div>

                    {cmsData.siteConfig?.logoUrl && (
                      <div style={{ marginTop: 10, fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={14} /> लोगो सक्रिय आहे: {cmsData.siteConfig.logoUrl}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* About & Brand Info */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>ब्रँडिंग व About Nexvarta</h3>
                  
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>ब्रँड नाव</label>
                    <input 
                      type="text" 
                      value={cmsData.siteConfig.name} 
                      onChange={(e) => {
                        const updated = { ...cmsData };
                        updated.siteConfig.name = e.target.value;
                        setCmsData(updated);
                      }}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                    />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>टॅगलाईन (Tagline)</label>
                    <input 
                      type="text" 
                      value={cmsData.siteConfig.tagline} 
                      onChange={(e) => {
                        const updated = { ...cmsData };
                        updated.siteConfig.tagline = e.target.value;
                        setCmsData(updated);
                      }}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>About Nexvarta सविस्तर माहिती</label>
                    <textarea 
                      rows={4}
                      value={cmsData.siteConfig.about.content} 
                      onChange={(e) => {
                        const updated = { ...cmsData };
                        updated.siteConfig.about.content = e.target.value;
                        setCmsData(updated);
                      }}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                    />
                  </div>
                </div>

                {/* 4 Stats Counters */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>४ मुख्य स्टॅट्स आकडे (Counters)</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {cmsData.siteConfig.stats.map((st, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>आकडा (उदा. 5M+)</label>
                        <input 
                          type="text" 
                          value={st.value} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            updated.siteConfig.stats[idx].value = e.target.value;
                            setCmsData(updated);
                          }}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, marginBottom: 6 }}
                        />
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>लेबल (उदा. Monthly Readers)</label>
                        <input 
                          type="text" 
                          value={st.label} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            updated.siteConfig.stats[idx].label = e.target.value;
                            setCmsData(updated);
                          }}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Us Settings */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        📍 संपर्क माहिती व हेल्पलाईन (Contact Us Settings)
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                        होमपेजवरील 'Contact Us' विभागात दिसणारे सर्व ३ ईमेल आणि ३ फोन नंबर येथून थेट एडिट करा.
                      </p>
                    </div>
                  </div>
                  
                  {/* Headquarters Address */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🏢 मुख्य कार्यालय पत्ता (Headquarters Address)
                    </label>
                    <input 
                      type="text" 
                      value={cmsData.siteConfig?.contact?.address || ''} 
                      onChange={(e) => {
                        const updated = { ...cmsData };
                        if (!updated.siteConfig) updated.siteConfig = {};
                        if (!updated.siteConfig.contact) updated.siteConfig.contact = {};
                        updated.siteConfig.contact.address = e.target.value;
                        setCmsData(updated);
                      }}
                      placeholder="उदा. Nexvarta News network, new delhi"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontSize: '0.9rem' }}
                    />
                  </div>

                  {/* 3 Email Addresses */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      ✉️ अधिकृत ईमेल पत्ते (Email Us - ३ ईमेल):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                      {/* Email 1: Newsroom */}
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          १. वृत्त कक्ष ईमेल (Newsroom / Editorial)
                        </label>
                        <input 
                          type="email" 
                          value={cmsData.siteConfig?.contact?.emails?.[0]?.email || ''} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            if (!updated.siteConfig) updated.siteConfig = {};
                            if (!updated.siteConfig.contact) updated.siteConfig.contact = {};
                            if (!Array.isArray(updated.siteConfig.contact.emails)) updated.siteConfig.contact.emails = [];
                            if (!updated.siteConfig.contact.emails[0]) updated.siteConfig.contact.emails[0] = { label: 'Editorial', email: '' };
                            updated.siteConfig.contact.emails[0].email = e.target.value;
                            setCmsData(updated);
                          }}
                          placeholder="news@nexvarta.in"
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                        />
                      </div>

                      {/* Email 2: Support */}
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          २. मदत कक्ष ईमेल (Support)
                        </label>
                        <input 
                          type="email" 
                          value={cmsData.siteConfig?.contact?.emails?.[1]?.email || ''} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            if (!updated.siteConfig) updated.siteConfig = {};
                            if (!updated.siteConfig.contact) updated.siteConfig.contact = {};
                            if (!Array.isArray(updated.siteConfig.contact.emails)) updated.siteConfig.contact.emails = [];
                            while (updated.siteConfig.contact.emails.length < 2) {
                              updated.siteConfig.contact.emails.push({ label: 'Support', email: '' });
                            }
                            updated.siteConfig.contact.emails[1].email = e.target.value;
                            setCmsData(updated);
                          }}
                          placeholder="support@nexvarta.com"
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                        />
                      </div>

                      {/* Email 3: Advertising */}
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          ३. जाहिरात कक्ष ईमेल (Advertising)
                        </label>
                        <input 
                          type="email" 
                          value={cmsData.siteConfig?.contact?.emails?.[2]?.email || ''} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            if (!updated.siteConfig) updated.siteConfig = {};
                            if (!updated.siteConfig.contact) updated.siteConfig.contact = {};
                            if (!Array.isArray(updated.siteConfig.contact.emails)) updated.siteConfig.contact.emails = [];
                            while (updated.siteConfig.contact.emails.length < 3) {
                              updated.siteConfig.contact.emails.push({ label: 'Advertising', email: '' });
                            }
                            updated.siteConfig.contact.emails[2].email = e.target.value;
                            setCmsData(updated);
                          }}
                          placeholder="advertise@nexvarta.com"
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3 Phone Numbers */}
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      📞 फोन व संपर्क क्रमांक (Call Us - ३ क्रमांक):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                      {/* Phone 1: Newsroom */}
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          १. वृत्त कक्ष थेट फोन (Newsroom Call)
                        </label>
                        <input 
                          type="text" 
                          value={cmsData.siteConfig?.contact?.phones?.[0]?.number || ''} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            if (!updated.siteConfig) updated.siteConfig = {};
                            if (!updated.siteConfig.contact) updated.siteConfig.contact = {};
                            if (!Array.isArray(updated.siteConfig.contact.phones)) updated.siteConfig.contact.phones = [];
                            if (!updated.siteConfig.contact.phones[0]) updated.siteConfig.contact.phones[0] = { label: 'Newsroom', number: '' };
                            updated.siteConfig.contact.phones[0].number = e.target.value;
                            setCmsData(updated);
                          }}
                          placeholder="+91 9226393520"
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                        />
                      </div>

                      {/* Phone 2: WhatsApp Tips */}
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          २. व्हॉट्सॲप बातम्या (WhatsApp Tips)
                        </label>
                        <input 
                          type="text" 
                          value={cmsData.siteConfig?.contact?.phones?.[1]?.number || ''} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            if (!updated.siteConfig) updated.siteConfig = {};
                            if (!updated.siteConfig.contact) updated.siteConfig.contact = {};
                            if (!Array.isArray(updated.siteConfig.contact.phones)) updated.siteConfig.contact.phones = [];
                            while (updated.siteConfig.contact.phones.length < 2) {
                              updated.siteConfig.contact.phones.push({ label: 'WhatsApp Tips', number: '' });
                            }
                            updated.siteConfig.contact.phones[1].number = e.target.value;
                            setCmsData(updated);
                          }}
                          placeholder="+91 98765 43210"
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                        />
                      </div>

                      {/* Phone 3: Toll Free */}
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          ३. टोल फ्री नंबर (Toll Free Helpline)
                        </label>
                        <input 
                          type="text" 
                          value={cmsData.siteConfig?.contact?.phones?.[2]?.number || ''} 
                          onChange={(e) => {
                            const updated = { ...cmsData };
                            if (!updated.siteConfig) updated.siteConfig = {};
                            if (!updated.siteConfig.contact) updated.siteConfig.contact = {};
                            if (!Array.isArray(updated.siteConfig.contact.phones)) updated.siteConfig.contact.phones = [];
                            while (updated.siteConfig.contact.phones.length < 3) {
                              updated.siteConfig.contact.phones.push({ label: 'Toll Free', number: '' });
                            }
                            updated.siteConfig.contact.phones[2].number = e.target.value;
                            setCmsData(updated);
                          }}
                          placeholder="1800 123 4567"
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Links Settings (Follow Us) */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        🌐 सोशल मीडिया हँडल्स (Follow Us - Social Media Links)
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                        होमपेजच्या फूटरमधील 'Follow Us' विभागातील सोशल मीडिया लिंक्स येथून थेट ॲड/एडिट करा.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                    {/* Facebook */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1877f2', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        🔵 Facebook पेज लिंक
                      </label>
                      <input 
                        type="url" 
                        value={cmsData.siteConfig?.socialLinks?.facebook || ''} 
                        onChange={(e) => {
                          const updated = { ...cmsData };
                          if (!updated.siteConfig) updated.siteConfig = {};
                          if (!updated.siteConfig.socialLinks) updated.siteConfig.socialLinks = {};
                          updated.siteConfig.socialLinks.facebook = e.target.value;
                          setCmsData(updated);
                        }}
                        placeholder="https://facebook.com/nexvarta"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* X / Twitter */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        𝕏 X (Twitter) प्रोफाइल लिंक
                      </label>
                      <input 
                        type="url" 
                        value={cmsData.siteConfig?.socialLinks?.twitter || ''} 
                        onChange={(e) => {
                          const updated = { ...cmsData };
                          if (!updated.siteConfig) updated.siteConfig = {};
                          if (!updated.siteConfig.socialLinks) updated.siteConfig.socialLinks = {};
                          updated.siteConfig.socialLinks.twitter = e.target.value;
                          setCmsData(updated);
                        }}
                        placeholder="https://x.com/nexvarta"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* Instagram */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e1306c', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        📷 Instagram प्रोफाइल लिंक
                      </label>
                      <input 
                        type="url" 
                        value={cmsData.siteConfig?.socialLinks?.instagram || ''} 
                        onChange={(e) => {
                          const updated = { ...cmsData };
                          if (!updated.siteConfig) updated.siteConfig = {};
                          if (!updated.siteConfig.socialLinks) updated.siteConfig.socialLinks = {};
                          updated.siteConfig.socialLinks.instagram = e.target.value;
                          setCmsData(updated);
                        }}
                        placeholder="https://instagram.com/nexvarta"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* YouTube */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        ▶️ YouTube चॅनेल लिंक
                      </label>
                      <input 
                        type="url" 
                        value={cmsData.siteConfig?.socialLinks?.youtube || ''} 
                        onChange={(e) => {
                          const updated = { ...cmsData };
                          if (!updated.siteConfig) updated.siteConfig = {};
                          if (!updated.siteConfig.socialLinks) updated.siteConfig.socialLinks = {};
                          updated.siteConfig.socialLinks.youtube = e.target.value;
                          setCmsData(updated);
                        }}
                        placeholder="https://youtube.com/@nexvarta"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* WhatsApp Channel */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        💬 WhatsApp चॅनेल / कम्युनिटी लिंक
                      </label>
                      <input 
                        type="url" 
                        value={cmsData.siteConfig?.socialLinks?.whatsapp || ''} 
                        onChange={(e) => {
                          const updated = { ...cmsData };
                          if (!updated.siteConfig) updated.siteConfig = {};
                          if (!updated.siteConfig.socialLinks) updated.siteConfig.socialLinks = {};
                          updated.siteConfig.socialLinks.whatsapp = e.target.value;
                          setCmsData(updated);
                        }}
                        placeholder="https://whatsapp.com/channel/..."
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 7: LIVE ANALYTICS & TRENDING DASHBOARD
              ========================================================================= */}
          {activeTab === 'analytics' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: 0.5 }}>रियल-टाइम वाचक ट्रॅकर (Live Metrics)</span>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>न्यूजरूम ॲनालिटिक्स व ट्रेंडिंग ट्रॅकर</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>पोर्टलवरील वाचक संख्या, लोकप्रिय कॅटेगरीज, व्हायरल बातम्या आणि सिंडिकेशन डाऊनलोड्सचे थेट आकडे.</p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button 
                    onClick={simulateLiveReaders}
                    style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700, padding: '9px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.825rem' }}
                    title="वाचक संख्या सिम्युलेट करा"
                  >
                    <RefreshCw size={14} className={analyticsLoading ? 'spin' : ''} /> रिफ्रेश आकडे
                  </button>
                  <button 
                    onClick={() => {
                      if (typeof window !== 'undefined') window.print();
                    }}
                    style={{ background: '#003884', color: '#fff', border: 'none', fontWeight: 700, padding: '9px 18px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.825rem' }}
                  >
                    <Printer size={15} /> प्रिंट / रिपोर्ट सेव्ह करा
                  </button>
                </div>
              </div>

              {/* 4 Core KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginBottom: 28 }}>
                {/* Total Views */}
                <div style={{ background: '#fff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>एकूण वाचक व्ह्यूज</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Eye size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                    {analyticsData?.metrics?.totalViews ? (analyticsData.metrics.totalViews).toLocaleString('en-IN') : '7,48,200'}
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} /> +१८.४% कालच्या तुलनेत वाढ
                  </div>
                </div>

                {/* Total Shares */}
                <div style={{ background: '#fff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>सोशल व व्हॉट्सॲप शेअर्स</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Share2 size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                    {analyticsData?.metrics?.totalShares ? (analyticsData.metrics.totalShares).toLocaleString('en-IN') : '38,420'}
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#64748b' }}>
                    सरासरी ५.२% व्हॉट्सॲप शेअर रेट
                  </div>
                </div>

                {/* Video Downloads */}
                <div style={{ background: '#fff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>क्रिएटर व्हिडिओ डाऊनलोड्स</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Download size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                    {analyticsData?.metrics?.totalDownloads ? (analyticsData.metrics.totalDownloads).toLocaleString('en-IN') : '4,890'}
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#ea580c', fontWeight: 700 }}>
                    ९:१६ रील्स आणि 4K ब्रॉडकास्ट फुटेज
                  </div>
                </div>

                {/* Live Readers Right Now */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', padding: 22, borderRadius: 14, boxShadow: '0 4px 14px rgba(15,23,42,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>सध्या थेट लाइव्ह वाचक</span>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 12px #22c55e' }}></span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4ade80', lineHeight: 1.1 }}>
                    {liveReadersCount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#93c5fd' }}>
                    पुणे, मुंबई व महाराष्ट्रातून सक्रिय
                  </div>
                </div>
              </div>

              {/* Category Breakdown & Performance Bars */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, marginBottom: 28, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChart3 size={18} color="#003884" /> विभागीय वाचक विभागणी (Category Readership Distribution)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(analyticsData?.categoryStats || cmsData.newsSections.map(s => ({
                    id: s.id,
                    name: s.name,
                    color: s.color,
                    views: s.articles.reduce((a, b) => a + (typeof b.views === 'number' ? b.views : 22000), 0),
                    percentage: Math.floor(100 / cmsData.newsSections.length)
                  }))).map((cat, idx) => (
                    <div key={cat.id || idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                        <span style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color || '#2563eb' }}></span>
                          {cat.name}
                        </span>
                        <span style={{ color: '#475569' }}>
                          {(cat.views || 45000).toLocaleString('en-IN')} व्ह्यूज ({cat.percentage || 25}%)
                        </span>
                      </div>
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            background: cat.color || '#2563eb', 
                            width: `${cat.percentage || 25}%`,
                            borderRadius: 99,
                            transition: 'width 0.6s ease'
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Leaderboard Table */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      🏆 सर्वाधिक वाचल्या गेलेल्या बातम्या (Top Trending Leaderboard)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>आजच्या दिवसातील सर्वाधिक एंगेजमेंट मिळवलेल्या टॉप बातम्या</p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                        <th style={{ padding: '12px 14px' }}>रँक</th>
                        <th style={{ padding: '12px 14px' }}>बातमी शीर्षक</th>
                        <th style={{ padding: '12px 14px' }}>कॅटेगरी</th>
                        <th style={{ padding: '12px 14px' }}>स्टेटस</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>वाचक (Views)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>शेअर्स</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>कृती</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analyticsData?.trendingArticles || allArticlesList.slice(0, 10)).map((art, rankIdx) => (
                        <tr key={art.id || rankIdx} style={{ borderBottom: '1px solid #f1f5f9', background: rankIdx < 3 ? '#faf5ff' : 'transparent' }}>
                          <td style={{ padding: '14px', fontWeight: 900 }}>
                            {rankIdx === 0 ? '🥇 #1' : rankIdx === 1 ? '🥈 #2' : rankIdx === 2 ? '🥉 #3' : `#${rankIdx + 1}`}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a', maxWidth: 360 }}>
                            <div style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {art.title}
                            </div>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem', color: '#334155' }}>
                              {art.categoryName || art.badge || 'News'}
                            </span>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <span style={{ 
                              background: art.status === 'scheduled' ? '#dbeafe' : art.status === 'review' ? '#ffedd5' : art.status === 'draft' ? '#fef9c3' : '#dcfce7',
                              color: art.status === 'scheduled' ? '#1e40af' : art.status === 'review' ? '#c2410c' : art.status === 'draft' ? '#a16207' : '#15803d',
                              padding: '3px 8px', 
                              borderRadius: 4, 
                              fontWeight: 800, 
                              fontSize: '0.7rem' 
                            }}>
                              {art.status ? art.status.toUpperCase() : 'PUBLISHED'}
                            </span>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right', fontWeight: 800, color: '#003884' }}>
                            {(art.views || 25000).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                            {(art.shares || 850).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <Link 
                              href={`/news/${art.id}`} 
                              target="_blank"
                              style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: 6, textDecoration: 'none', color: '#003884', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <ExternalLink size={12} /> पहा
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODAL: STANDALONE AI MARATHI NEWS ASSISTANT
          ========================================================================= */}
      {isAiModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, maxWidth: 800, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>AI मराठी न्यूजरूम असिस्टंट</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>एका क्लिकवर ३० शब्दांत सारांश, कॅची हेडलाईन्स व रील्स स्क्रिप्ट बनवा</span>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕ बंद करा
              </button>
            </div>

            {/* Quick Demo Topics */}
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: 6 }}>
                ⚡ झटपट चाचणीसाठी तयार विषय निवडा (Quick Demos):
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: '🚇 हिंजवडी-शिवाजीनगर मेट्रो ३ चे लोकार्पण', cat: 'pune', text: 'पुणे मेट्रो मार्ग ३ चे हिंजवडी ते शिवाजीनगर दरम्यान आज लोकार्पण झाले. २३ किलोमीटर अंतराचा हा मार्ग असून यामुळे प्रवाशांचा ९० मिनिटांचा वेळ वाचून अवघ्या १५ मिनिटांत प्रवास शक्य होणार आहे. दररोज २ लाखांहून अधिक प्रवासी याचा लाभ घेतील.' },
                  { label: '💼 हिंजवडी फेज-३ मध्ये ५०००+ आयटी नोकऱ्या', cat: 'pune', text: 'महाराष्ट्र औद्योगिक विकास महामंडळ आणि आयटी कंपन्यांनी पुण्यात ५००० नवीन अभियंत्यांच्या भरतीची घोषणा केली आहे. यामध्ये प्रामुख्याने आर्टिफिशियल इंटेलिजन्स आणि डेटा सायन्स क्षेत्रातील तरुणांना प्राधान्य दिले जाईल.' },
                  { label: '🏛️ महाराष्ट्र नवीन उद्योग धोरण २०२६', cat: 'maharashtra', text: 'महाराष्ट्र शासनाने नवीन औद्योगिक धोरण २०२६ जाहीर केले असून एमएसएमई उद्योगांना ५ लाखांपर्यंत बिनव्याजी सहाय्य आणि १० लाख नव्या रोजगारांचे उद्दिष्ट ठेवण्यात आले आहे.' },
                  { label: '🚔 पुणे पोलिसांचे विशेष कोम्बिंग ऑपरेशन', cat: 'pune', text: 'पुणे शहर पोलिसांनी गणेशोत्सवाच्या पार्श्वभूमीवर शहरात विशेष तपासणी मोहीम राबवून संशयित आरोपींना ताब्यात घेतले असून १२०० हून अधिक एआय कॅमेऱ्यांची नजर शहरावर ठेवण्यात आली आहे.' },
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiInputText(demo.text);
                      setAiCategory(demo.cat);
                    }}
                    style={{ fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', color: '#1e293b' }}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Input Form */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                कच्चा मसुदा, प्रेस रिलीज किंवा इंग्रजी/मराठी मुद्दे पेस्ट करा *
              </label>
              <textarea
                rows={4}
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                placeholder="उदा. पुण्यात आज मेट्रो मार्गाचे काम पूर्ण झाले असून उद्यापासून सर्वसामान्य नागरिकांसाठी वाहतूक सुरू होईल..."
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #cbd5e1', borderRadius: 10, fontSize: '0.9rem', lineHeight: 1.6, boxSizing: 'border-box' }}
              />
            </div>

            {/* Controls Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end', marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>कॅटेगरी विभाग</label>
                <select
                  value={aiCategory}
                  onChange={(e) => setAiCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, background: '#f8fafc', fontWeight: 700 }}
                >
                  {cmsData.newsSections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>बातमीची भाषा व टोन</label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, background: '#f8fafc', fontWeight: 700 }}
                >
                  <option value="breaking">⚡ सुपरफास्ट ब्रेकिंग (High Impact)</option>
                  <option value="analytical">📰 विश्लेषणात्मक व सविस्तर (In-depth)</option>
                  <option value="public">🎯 सर्वसामान्य लोकाभिमुख (Citizen Focus)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleAiGenerate()}
                disabled={isAiGenerating || !aiInputText.trim()}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', border: 'none', fontWeight: 800, padding: '10px 22px', borderRadius: 8, cursor: isAiGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, height: 42 }}
              >
                <Sparkles size={16} /> {isAiGenerating ? 'AI तयार करत आहे...' : '✨ बातमी तयार करा'}
              </button>
            </div>

            {/* Generated Results Area */}
            {aiResult && (
              <div style={{ background: '#f8fafc', border: '2px solid #ddd6fe', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    ✅ AI द्वारे तयार केलेले पॅकेज (Click to Choose)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyAiToForm(aiResult)}
                    style={{ background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, padding: '8px 18px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                  >
                    <CheckCircle2 size={16} /> हे पॅकेज नवीन बातमीमध्ये भरा
                  </button>
                </div>

                {/* 3 Headlines */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                    १. ३ पर्यायी मराठी शीर्षके (शीर्षक निवडण्यासाठी क्लिक करा):
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {aiResult.headlines?.map((h, i) => (
                      <div
                        key={i}
                        onClick={() => setAiResult({ ...aiResult, selectedHeadline: h })}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1.5px solid',
                          borderColor: aiResult.selectedHeadline === h ? '#7c3aed' : '#cbd5e1',
                          background: aiResult.selectedHeadline === h ? '#f5f3ff' : '#fff',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.925rem',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}
                      >
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: aiResult.selectedHeadline === h ? '#7c3aed' : '#e2e8f0', color: aiResult.selectedHeadline === h ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                          {i + 1}
                        </span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 30-word bullet summary */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                    २. ३० शब्दांत ठळक मुद्दे सारांश:
                  </label>
                  <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, fontSize: '0.85rem', lineHeight: 1.6, color: '#1e293b', whiteSpace: 'pre-line' }}>
                    {aiResult.summary30}
                  </div>
                </div>

                {/* 9:16 Reel Script */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                      ३. 🎬 ९:१६ रील्स / शॉर्ट्स व्हॉईस-ओव्हर स्क्रिप्ट (क्रिएटर व अँकर्ससाठी):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(aiResult.reelScript);
                          showToast('📋 रील्स स्क्रिप्ट क्लिपबोर्डवर कॉपी झाली!');
                        }
                      }}
                      style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: 5, fontSize: '0.725rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Copy size={12} style={{ display: 'inline', marginRight: 4 }} /> कॉपी करा
                    </button>
                  </div>
                  <pre style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 8, padding: 14, fontSize: '0.8rem', lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {aiResult.reelScript}
                  </pre>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button 
                type="button" 
                onClick={() => setIsAiModalOpen(false)}
                style={{ background: '#f1f5f9', padding: '10px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT ARTICLE (WITH AI, WORKFLOW, WATERMARK & REELS SCRIPT)
          ========================================================================= */}
      {editingArticle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="admin-modal-card" style={{ background: '#fff', borderRadius: 18, maxWidth: 840, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: 30, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            {/* Modal Header with AI Launcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '2px solid #f1f5f9', paddingBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
                  {editingArticle.isNew ? 'नवीन बातमी जोडा (Add News)' : 'बातमी संपादित करा (Edit News)'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  संपादकीय वर्कफ्लो, ऑटो-वॉटरमार्क इमेज आणि रील्स स्क्रिप्टसह बातमी व्यवस्थापन
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => setIsAiInlineOpen(!isAiInlineOpen)}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)' }}
              >
                <Sparkles size={15} /> {isAiInlineOpen ? 'AI पॅनल बंद करा' : '✨ AI मराठी असिस्टंट वापरा'}
              </button>
            </div>

            {/* Inline AI Quick Assistant Expander */}
            {isAiInlineOpen && (
              <div style={{ background: '#f5f3ff', border: '1.5px dashed #8b5cf6', borderRadius: 12, padding: 18, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Wand2 size={16} /> येथे माहिती पेस्ट करा — शीर्षक, सारांश आणि मजकूर आपोआप भरला जाईल:
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  placeholder="कच्चा मसुदा किंवा प्रेस नोट येथे टाईप करा..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #c4b5fd', borderRadius: 8, fontSize: '0.875rem', background: '#fff', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => handleAiGenerate()}
                    disabled={isAiGenerating || !aiInputText.trim()}
                    style={{ background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 800, padding: '7px 18px', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    {isAiGenerating ? 'जनरेट होत आहे...' : '✨ AI जनरेट करा व फॉर्ममध्ये भरा'}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveArticle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                
                {/* 1. Category Selector */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>कॅटेगरी निवडा (Section) *</label>
                  <select 
                    value={articleCategoryTarget}
                    onChange={(e) => setArticleCategoryTarget(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, background: '#f8fafc', fontWeight: 700, color: '#0f172a' }}
                  >
                    {cmsData.newsSections.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name} (/{sec.slug})</option>
                    ))}
                  </select>
                </div>

                {/* 2. Editorial Workflow Status & Schedule */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>
                    संपादकीय स्टेटस (Editorial Status) *
                  </label>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {[
                      { id: 'published', label: '🟢 Live', bg: '#dcfce7', text: '#15803d' },
                      { id: 'scheduled', label: '🔵 शेड्यूल', bg: '#dbeafe', text: '#1e40af' },
                      { id: 'review', label: '🟠 तपासणी', bg: '#ffedd5', text: '#c2410c' },
                      { id: 'draft', label: '🟡 मसुदा', bg: '#fef9c3', text: '#a16207' },
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setEditingArticle({ ...editingArticle, status: st.id })}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: 6,
                          border: '1.5px solid',
                          borderColor: (editingArticle.status || 'published') === st.id ? st.text : '#e2e8f0',
                          background: (editingArticle.status || 'published') === st.id ? st.bg : '#fff',
                          color: (editingArticle.status || 'published') === st.id ? st.text : '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* If Scheduled: Show DateTime Picker */}
                {editingArticle.status === 'scheduled' && (
                  <div style={{ gridColumn: 'span 2', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CalendarIcon size={16} /> बातमी लाईव्ह होण्याची तारीख व वेळ ठरवा (Schedule Time):
                    </label>
                    <input
                      type="datetime-local"
                      value={editingArticle.scheduledAt || '2026-09-18T07:30'}
                      onChange={(e) => setEditingArticle({ ...editingArticle, scheduledAt: e.target.value })}
                      style={{ marginTop: 6, padding: '8px 12px', border: '1px solid #93c5fd', borderRadius: 6, background: '#fff', fontWeight: 700, fontSize: '0.875rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', marginLeft: 12 }}>
                      ठरलेल्या वेळेपूर्वी ही बातमी मुख्य पोर्टलवर वाचकांना दिसणार नाही.
                    </span>
                  </div>
                )}

                {/* 3. Title */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>बातमी शीर्षक (Headline) *</label>
                  <input 
                    type="text" 
                    required 
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    placeholder="उदा. पुणे मेट्रो: हिंजवडी-शिवाजीनगर मार्ग सुरू, प्रवाशांचा ९० मिनिटांचा वेळ वाचणार"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontWeight: 700, fontSize: '0.95rem' }}
                  />
                </div>

                {/* 3b. Trending Feature Toggle */}
                <div style={{ gridColumn: 'span 2', background: '#fff7ed', border: '1.5px solid #fdba74', borderRadius: 10, padding: '12px 16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingArticle.isTrending || cmsData?.trendingArticleId === editingArticle.id)}
                      onChange={(e) => setEditingArticle({ ...editingArticle, isTrending: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: '#ea580c', cursor: 'pointer' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#c2410c', display: 'flex', alignItems: 'center', gap: 6 }}>
                        🔥 मुख्य 'TRENDING' बातमी म्हणून होमपेजवर दाखवा (Set as Featured Trending News)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9a3412', display: 'block', marginTop: 2 }}>
                        सक्रिय केल्यास ही बातमी होमपेजवर सर्वात मोठ्या Hero Spotlight कार्डमध्ये "TRENDING" बॅजसह दिसेल.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Badge & Color */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>कॅटेगरी बॅज (उदा. TRANSPORT, CRIME, JOBS)</label>
                  <input 
                    type="text" 
                    value={editingArticle.badge}
                    onChange={(e) => setEditingArticle({ ...editingArticle, badge: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>बॅज रंग कोड</label>
                  <input 
                    type="color" 
                    value={editingArticle.badgeColor || '#ea580c'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, badgeColor: e.target.value })}
                    style={{ width: '100%', height: 38, padding: 2, border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                  />
                </div>

                {/* 4. Card Summary (30-words) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>थोडक्यात सारांश (Card Summary / 30 Words) *</label>
                  <textarea 
                    rows={2}
                    required
                    value={editingArticle.summary}
                    onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                    placeholder="वाचकांसाठी मुख्य कार्डवर दिसणारा ३० शब्दांतील संक्षिप्त सारांश..."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontSize: '0.9rem', lineHeight: 1.5 }}
                  />
                </div>

                {/* 5. PHOTO & AUTO-WATERMARK STUDIO */}
                <div style={{ gridColumn: 'span 2', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UploadCloud size={18} color="#003884" /> फोटो अपलोड व "NEXVARTA" ऑटो-वॉटरमार्क स्टुडिओ
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>फोटो अपलोड करताच त्यावर ब्रॉडकास्ट दर्जाचा अधिकृत वॉटरमार्क लोगो आपोआप बसवला जाईल.</span>
                    </div>
                  </div>

                  {/* Watermark Preset Controls */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>वॉटरमार्क टॅग:</span>
                    {[
                      '🌟 अधिकृत लोगो',
                      '🔴 NEXVARTA EXCLUSIVE',
                      '⚡ NEXVARTA SPECIAL',
                      '📍 NEXVARTA PUNE',
                      '❌ विना वॉटरमार्क'
                    ].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleWatermarkTagSelect(tag)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: '1px solid',
                          borderColor: watermarkTag === tag ? '#003884' : '#cbd5e1',
                          background: watermarkTag === tag ? '#003884' : '#fff',
                          color: watermarkTag === tag ? '#fff' : '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Watermark Customization: Location Checkbox & Input + Domain Branding */}
                  {watermarkTag !== '❌ विना वॉटरमार्क' && (
                    <div style={{
                      display: 'flex',
                      gap: 12,
                      marginBottom: 14,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      background: '#f1f5f9',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0'
                    }}>
                      {/* Official Logo Toggle Checkbox */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#003884', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <input
                          type="checkbox"
                          checked={showWatermarkLogo}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setShowWatermarkLogo(checked);
                            triggerWatermarkRefresh({ showLogo: checked });
                          }}
                          style={{ width: 16, height: 16, accentColor: '#003884', cursor: 'pointer' }}
                        />
                        🌟 अधिकृत लोगो
                      </label>

                      {/* Location Checkbox + Editable Input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 240px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <input
                            type="checkbox"
                            checked={showWatermarkLocation}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setShowWatermarkLocation(checked);
                              triggerWatermarkRefresh({ showLocation: checked });
                            }}
                            style={{ width: 16, height: 16, accentColor: '#003884', cursor: 'pointer' }}
                          />
                          📍 लोकेशन:
                        </label>
                        <input
                          type="text"
                          disabled={!showWatermarkLocation}
                          value={watermarkLocation}
                          onChange={(e) => setWatermarkLocation(e.target.value)}
                          onBlur={() => triggerWatermarkRefresh({ locationText: watermarkLocation })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              triggerWatermarkRefresh({ locationText: watermarkLocation });
                            }
                          }}
                          placeholder="उदा. PUNE • MAHARASHTRA किंवा पिंपरी चिंचवड"
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: showWatermarkLocation ? '#fff' : '#f8fafc',
                            color: showWatermarkLocation ? '#0f172a' : '#94a3b8'
                          }}
                        />
                      </div>

                      {/* Domain Branding Checkbox + Editable Input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 200px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <input
                            type="checkbox"
                            checked={showWatermarkDomain}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setShowWatermarkDomain(checked);
                              triggerWatermarkRefresh({ showDomain: checked });
                            }}
                            style={{ width: 16, height: 16, accentColor: '#003884', cursor: 'pointer' }}
                          />
                          🌐 ब्रँड नाव:
                        </label>
                        <input
                          type="text"
                          disabled={!showWatermarkDomain}
                          value={watermarkDomain}
                          onChange={(e) => setWatermarkDomain(e.target.value)}
                          onBlur={() => triggerWatermarkRefresh({ domainText: watermarkDomain })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              triggerWatermarkRefresh({ domainText: watermarkDomain });
                            }
                          }}
                          placeholder="NVNEWS.IN"
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            background: showWatermarkDomain ? '#fff' : '#f8fafc',
                            color: showWatermarkDomain ? '#003884' : '#94a3b8'
                          }}
                        />
                      </div>

                      {/* Quick Apply Button when an image is loaded */}
                      {(rawOriginalImage || editingArticle?.image) && (
                        <button
                          type="button"
                          onClick={() => triggerWatermarkRefresh()}
                          title="बदललेले लोकेशन / नाव तात्काळ फोटोवर वॉटरमार्क करा"
                          style={{
                            padding: '5px 12px',
                            borderRadius: 6,
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          🔄 लागू करा
                        </button>
                      )}
                    </div>
                  )}

                  {/* Drag & Drop Upload Box */}
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleImageFileSelected(e.dataTransfer.files[0]);
                    }}
                    style={{ border: '2px dashed #93c5fd', borderRadius: 10, padding: 20, textAlign: 'center', background: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => document.getElementById('newsImageFileInput')?.click()}
                  >
                    <input 
                      id="newsImageFileInput"
                      type="file" 
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageFileSelected(e.target.files[0]);
                      }}
                    />
                    <UploadCloud size={32} color="#2563eb" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b' }}>
                      {isWatermarking ? '🎨 वॉटरमार्क जोडत आहे...' : 'फोटो येथे Drag & Drop करा किंवा कॉम्प्युटरवरून निवडा'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PNG, JPG, WebP फाइल्स सपोर्टेड (ऑटोमॅटिक वॉटरमार्क ब्रँडिंग)</span>
                  </div>

                  {/* Watermarked Image Live Preview */}
                  {editingArticle.image && (
                    <div style={{ marginTop: 14, display: 'flex', gap: 14, alignItems: 'center', background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1' }}>
                      <div style={{ position: 'relative', width: 140, height: 90, borderRadius: 8, overflow: 'hidden', border: '1px solid #94a3b8', background: '#0f172a' }}>
                        <img 
                          src={editingArticle.image} 
                          alt="Watermarked Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.725rem', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <img 
                              src={cmsData?.siteConfig?.logoUrl || '/uploads/logos/nexvarta_official_logo.png'} 
                              alt="Logo" 
                              style={{ height: 14, width: 'auto', borderRadius: 2 }} 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                            />
                            ✓ वॉटरमार्क तयार आहे
                          </span>
                          <button
                            type="button"
                            onClick={() => triggerWatermarkRefresh()}
                            style={{ fontSize: '0.725rem', color: '#fff', background: '#003884', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                            title="या फोटोवर अधिकृत लोगो वॉटरमार्क लावा किंवा रिफ्रेश करा"
                          >
                            🎨 या फोटोवर वॉटरमार्क लावा
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingArticle({ ...editingArticle, image: '' })}
                            style={{ fontSize: '0.725rem', color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 'auto' }}
                          >
                            फोटो काढून टाका
                          </button>
                        </div>
                        <input
                          type="text"
                          value={editingArticle.image.startsWith('data:') ? 'स्थानिक अपलोड केलेला वॉटरमार्क फोटो (Data URL)' : editingArticle.image}
                          onChange={(e) => setEditingArticle({ ...editingArticle, image: e.target.value })}
                          placeholder="किंवा थेट इमेज URL टाका..."
                          style={{ width: '100%', padding: '6px 10px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 6, color: '#475569' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fallback button if no photo is currently set */}
                  {!editingArticle.image && (
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const defaultLogo = cmsData?.siteConfig?.logoUrl || '/uploads/logos/nexvarta_official_logo.png';
                          setEditingArticle(prev => ({ ...prev, image: defaultLogo }));
                          showToast('✅ डीफॉल्ट लोगो इमेज सेट केली!');
                        }}
                        style={{ fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 10px', color: '#003884', fontWeight: 700, cursor: 'pointer' }}
                      >
                        🖼️ बातमीसाठी डीफॉल्ट लोगो इमेज वापरा
                      </button>
                    </div>
                  )}
                </div>

                {/* 6. Full Story Editor */}
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                      पूर्ण सविस्तर बातमी (Full Story & Rich Formatting) *
                    </label>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <button
                        type="button"
                        onClick={() => setStoryEditorTab('write')}
                        style={{
                          padding: '5px 14px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          background: storyEditorTab === 'write' ? '#fff' : 'transparent',
                          color: storyEditorTab === 'write' ? '#003884' : '#64748b',
                          boxShadow: storyEditorTab === 'write' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        ✍️ मजकूर लिहा (Write)
                      </button>
                      <button
                        type="button"
                        onClick={() => setStoryEditorTab('preview')}
                        style={{
                          padding: '5px 14px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          background: storyEditorTab === 'preview' ? '#fff' : 'transparent',
                          color: storyEditorTab === 'preview' ? '#003884' : '#64748b',
                          boxShadow: storyEditorTab === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        👁️ थेट प्रिव्ह्यू (Live Preview)
                      </button>
                    </div>
                  </div>

                  {storyEditorTab === 'write' ? (
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      {/* Row 1: Formatting Tools */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => insertStoryFormat('**', '**', 'ठळक मजकूर')}
                          title="Bold (ठळक)"
                          style={{ minWidth: 32, height: 30, padding: '0 8px', fontWeight: 900, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, cursor: 'pointer' }}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => insertStoryFormat('*', '*', 'तिरपा मजकूर')}
                          title="Italic (तिरपा)"
                          style={{ minWidth: 32, height: 30, padding: '0 8px', fontStyle: 'italic', fontWeight: 700, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, cursor: 'pointer' }}
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => insertStoryFormat('<u>', '</u>', 'अधोरेखित मजकूर')}
                          title="Underline (अधोरेखित)"
                          style={{ minWidth: 32, height: 30, padding: '0 8px', textDecoration: 'underline', fontWeight: 700, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, cursor: 'pointer' }}
                        >
                          U
                        </button>

                        <div style={{ width: 1, height: 20, background: '#cbd5e1', margin: '0 4px' }}></div>

                        <button
                          type="button"
                          onClick={() => insertStoryFormat('\n\n## ', '\n', 'मुख्य उप-शीर्षक (H2 Heading)')}
                          title="H2 Headline"
                          style={{ height: 30, padding: '0 8px', fontWeight: 800, fontSize: '0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, cursor: 'pointer' }}
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertStoryFormat('\n\n### ', '\n', 'विभाग शीर्षक (H3 Subheading)')}
                          title="H3 Subheading"
                          style={{ height: 30, padding: '0 8px', fontWeight: 800, fontSize: '0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, cursor: 'pointer' }}
                        >
                          H3
                        </button>

                        <div style={{ width: 1, height: 20, background: '#cbd5e1', margin: '0 4px' }}></div>

                        <button
                          type="button"
                          onClick={() => insertStoryFormat('\n• ', '', 'मुद्दा क्रमांक')}
                          title="Bullet List (बुलेट यादी)"
                          style={{ height: 30, padding: '0 8px', fontSize: '0.75rem', fontWeight: 700, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, cursor: 'pointer' }}
                        >
                          • यादी
                        </button>
                        <button
                          type="button"
                          onClick={() => insertStoryFormat('\n1. ', '', 'मुद्दा क्रमांक १')}
                          title="Numbered List (क्रमांक यादी)"
                          style={{ height: 30, padding: '0 8px', fontSize: '0.75rem', fontWeight: 700, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, cursor: 'pointer' }}
                        >
                          1. क्रम
                        </button>
                        <button
                          type="button"
                          onClick={() => insertStoryFormat('\n> "', '" — वक्त्याचे नाव', 'महत्त्वाचे वक्तव्य / कोट')}
                          title="Quote (महत्त्वाचे वक्तव्य)"
                          style={{ height: 30, padding: '0 8px', fontSize: '0.75rem', fontWeight: 700, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, cursor: 'pointer' }}
                        >
                          ❝ कोट
                        </button>

                        <div style={{ width: 1, height: 20, background: '#cbd5e1', margin: '0 4px' }}></div>

                        {/* Inline Image Upload & Link */}
                        <input
                          type="file"
                          id="inlineStoryImageInput"
                          accept="image/*"
                          onChange={handleInlineImageUpload}
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          disabled={isInlineImgUploading}
                          onClick={() => document.getElementById('inlineStoryImageInput')?.click()}
                          title="मजकुरात फोटो अपलोड करून जोडा (Upload Photo)"
                          style={{
                            height: 30,
                            padding: '0 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isInlineImgUploading ? '#e2e8f0' : '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: 5,
                            cursor: isInlineImgUploading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          📷 {isInlineImgUploading ? 'अपलोड होत आहे...' : 'फोटो जोडा'}
                        </button>
                        <button
                          type="button"
                          onClick={handleInsertImageUrl}
                          title="फोटोची लिंक (URL) जोडा"
                          style={{
                            height: 30,
                            padding: '0 8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: '#fff',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            borderRadius: 5,
                            cursor: 'pointer'
                          }}
                        >
                          🔗 फोटो लिंक
                        </button>
                        <button
                          type="button"
                          onClick={handleInsertWebLink}
                          title="वेबसाईट किंवा बातमीची लिंक जोडा (Insert Web Link)"
                          style={{
                            height: 30,
                            padding: '0 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: 5,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          🌐 लिंक जोडा
                        </button>
                        <button
                          type="button"
                          onClick={() => insertStoryFormat('\n\n---\n\n', '', '')}
                          title="रेष (Divider)"
                          style={{
                            height: 30,
                            padding: '0 8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: '#fff',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            borderRadius: 5,
                            cursor: 'pointer'
                          }}
                        >
                          ➖ रेष
                        </button>
                      </div>

                      {/* Row 2: Color Palette */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '6px 10px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>🎨 रंग:</span>
                        {[
                          { label: 'Red', color: '#dc2626' },
                          { label: 'Blue', color: '#2563eb' },
                          { label: 'Green', color: '#16a34a' },
                          { label: 'Orange', color: '#ea580c' },
                          { label: 'Purple', color: '#7c3aed' },
                          { label: 'Dark', color: '#0f172a' },
                        ].map(c => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => insertStoryFormat(`<span style="color: ${c.color}">`, '</span>', 'रंगीत मजकूर')}
                            style={{ width: 22, height: 22, borderRadius: '50%', background: c.color, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', cursor: 'pointer' }}
                          />
                        ))}
                        <div style={{ width: 1, height: 18, background: '#cbd5e1', margin: '0 2px' }}></div>
                        <input 
                          type="color"
                          value={customTextColor}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          title="पसंतीचा रंग निवडा"
                          style={{ width: 26, height: 26, padding: 0, border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
                        />
                        <button
                          type="button"
                          onClick={() => insertStoryFormat(`<span style="color: ${customTextColor}">`, '</span>', 'रंगीत मजकूर')}
                          style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', color: customTextColor }}
                        >
                          रंग लावा
                        </button>
                      </div>

                      {/* Row 3: Link & Markdown Guide Hint */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#eff6ff', borderBottom: '1px solid #dbeafe', fontSize: '0.74rem', color: '#1e40af' }}>
                        <span>🌐</span>
                        <span><strong>बातमीत लिंक कशी टाकावी:</strong> वरील <strong>"🌐 लिंक जोडा"</strong> बटण वापरा किंवा मजकुरात थेट <code>https://...</code> अथवा <code>[लिंक नाव](https://...)</code> टाईप करा. ती बातमीत वाचकांसाठी आपोआप निळी आणि क्लिकेबल (Clickable) दिसेल.</span>
                      </div>

                      <textarea 
                        id="fullStoryTextarea"
                        rows={10}
                        required
                        value={editingArticle.fullContent}
                        onChange={(e) => setEditingArticle({ ...editingArticle, fullContent: e.target.value })}
                        placeholder="येथे बातमीचा संपूर्ण सविस्तर मजकूर टाईप करा..."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          border: 'none',
                          outline: 'none',
                          fontSize: '0.925rem',
                          lineHeight: 1.75,
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ border: '2px dashed #93c5fd', borderRadius: 10, padding: '20px', background: '#f8fafc', minHeight: 180, maxHeight: 300, overflowY: 'auto' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', marginBottom: 10, textTransform: 'uppercase' }}>
                        ● थेट वाचक प्रिव्ह्यू (Live Reader Preview)
                      </div>
                      <div 
                        style={{ fontSize: '1rem', lineHeight: 1.8, color: '#334155' }}
                        dangerouslySetInnerHTML={{ __html: renderRichContent(editingArticle.fullContent || '<em style="color:#94a3b8;">येथे मजकूर टाईप केल्यावर प्रिव्ह्यू दिसेल...</em>') }}
                      />
                    </div>
                  )}
                </div>

                {/* 7. REELS / SHORTS 9:16 VOICE-OVER SCRIPT FIELD */}
                <div style={{ gridColumn: 'span 2', background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#86198f', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🎬 ९:१६ रील्स / शॉर्ट्स व्हॉईस-ओव्हर स्क्रिप्ट (Creator Syndication Script)
                    </label>
                    <span style={{ fontSize: '0.725rem', color: '#a21caf', fontWeight: 700 }}>
                      यूट्यूबर्स आणि इन्स्टाग्राम न्यूज क्रिएटर्ससाठी
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={editingArticle.reelScript || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, reelScript: e.target.value })}
                    placeholder="[Hook 0-5s] नमस्कार, पुण्यातून सर्वात मोठी बातमी... [Facts 5-25s] ... [CTA 25-30s] फॉलो करा @Nexvarta"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #f0abfc', borderRadius: 8, background: '#fff', fontSize: '0.875rem', lineHeight: 1.5, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Author & Date */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>लेखकाचे नाव</label>
                  <input 
                    type="text" 
                    value={editingArticle.author}
                    onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>तारीख (Date)</label>
                  <input 
                    type="text" 
                    value={editingArticle.date}
                    onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4 }}
                  />
                </div>

                {/* 8. Custom Initial Views & Shares Studio */}
                <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14, alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      👁️ सुरुवातीचे व्ह्यूज (Custom Views / वाचक संख्या)
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      value={editingArticle.views !== undefined ? editingArticle.views : 5000}
                      onChange={(e) => setEditingArticle({ ...editingArticle, views: parseInt(e.target.value, 10) || 0 })}
                      placeholder="उदा. 5000 किंवा 12500"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', background: '#fff' }}
                    />
                    <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                      💡 येथे इच्छित सुरुवातीचे व्ह्यूज टाका. त्यानंतर वाचक जसजसे बातमी वाचतील, तसे यात व्ह्यूज आपोआप पुढे वाढत जातील (+१).
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🔗 शेअर्स संख्या (Shares Count)
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      value={editingArticle.shares !== undefined ? editingArticle.shares : 420}
                      onChange={(e) => setEditingArticle({ ...editingArticle, shares: parseInt(e.target.value, 10) || 0 })}
                      placeholder="उदा. 420"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', background: '#fff' }}
                    />
                    <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                      कार्डवर दिसणारी शेअर्स संख्या (पर्यायी).
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
                <button 
                  type="button" 
                  onClick={() => setEditingArticle(null)}
                  style={{ background: '#f1f5f9', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button 
                  type="submit" 
                  style={{ background: '#003884', color: '#fff', padding: '10px 28px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,56,132,0.3)' }}
                >
                  बातमी सेव्ह करा (Save Article)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT VIDEO PACKAGE (GOOGLE DRIVE, R2, LIVE PREVIEW)
          ========================================================================= */}
      {editingVideo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="admin-modal-card" style={{ background: '#fff', borderRadius: 16, maxWidth: 940, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '28px 32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.5rem' }}>🎥</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#002255', margin: 0 }}>
                    {editingVideo.isNew ? 'नवीन व्हिडिओ पॅकेज जोडा (Add Video Package)' : 'व्हिडिओ पॅकेज संपादित करा'}
                  </h3>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>
                  Google Drive, Cloudflare R2 बकेट किंवा थेट CDN द्वारे व्हिडिओ जोडा. यूट्यूब व इन्स्टासाठी 9:16 रील्स व 16:9 पॅकेजेस.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => { setEditingVideo(null); setVideoTestPlaying(false); }}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVideo}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.85fr', gap: 24, alignItems: 'start' }}>
                
                {/* LEFT COLUMN: Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  
                  {/* Title */}
                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e293b' }}>
                      व्हिडिओ शीर्षक (Video Title) *
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="उदा. पुणे मेट्रो ३ लोकार्पण: हिंजवडी प्रवास अवघ्या १५ मिनिटांत"
                      value={editingVideo.title}
                      onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontSize: '0.9rem' }}
                    />
                  </div>

                  {/* Format & Category */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e293b' }}>
                        व्हिडिओ फॉरमॅट (Format) *
                      </label>
                      <select 
                        value={editingVideo.format}
                        onChange={(e) => setEditingVideo({ 
                          ...editingVideo, 
                          format: e.target.value,
                          resolution: e.target.value === '9:16' ? '1080x1920 Full HD' : '3840x2160 4K UHD'
                        })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontSize: '0.85rem', fontWeight: 600, background: '#fff' }}
                      >
                        <option value="9:16">📱 9:16 रील्स / शॉर्ट्स (Vertical)</option>
                        <option value="16:9">🖥️ 16:9 4K ब्रॉडकास्ट (Landscape)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e293b' }}>
                        कॅटेगरी (Category) *
                      </label>
                      <select 
                        value={editingVideo.category}
                        onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontSize: '0.85rem', fontWeight: 600, background: '#fff' }}
                      >
                        <option value="Pune News">पुणे विशेष (Pune News)</option>
                        <option value="Maharashtra News">महाराष्ट्र घडामोडी (Maharashtra)</option>
                        <option value="India News">भारत व राष्ट्रीय (India News)</option>
                        <option value="Tech & AI">तंत्रज्ञान व AI (Tech & AI)</option>
                        <option value="Startup & Business">स्टार्टअप व बिझनेस (Business)</option>
                        <option value="Sports & Cricket">क्रीडा व आयपीएल (Sports)</option>
                        <option value="Culture & Entertainment">संस्कृती व मनोरंजन (Culture)</option>
                      </select>
                    </div>
                  </div>

                  {/* STORAGE SOURCE SELECTOR (Google Drive vs Cloudflare R2 vs Direct) */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#003884', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HardDrive size={15} /> व्हिडिओ स्टोरेज सोर्स (Video Storage Source):
                      </label>
                      <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800 }}>
                        ● ०-सर्व्हर बँडविड्थ खर्च
                      </span>
                    </div>

                    {/* Selector Buttons */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      {[
                        { id: 'drive', label: '📁 Google Drive (शिफारस)', color: '#15803d' },
                        { id: 'r2', label: '☁️ Cloudflare R2', color: '#ea580c' },
                        { id: 'direct', label: '🔗 थेट MP4 URL', color: '#0284c7' },
                      ].map(src => (
                        <button
                          key={src.id}
                          type="button"
                          onClick={() => setVideoStorageType(src.id)}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: 6,
                            fontSize: '0.78rem',
                            fontWeight: videoStorageType === src.id ? 800 : 600,
                            background: videoStorageType === src.id ? src.color : '#ffffff',
                            color: videoStorageType === src.id ? '#ffffff' : '#475569',
                            border: videoStorageType === src.id ? 'none' : '1px solid #cbd5e1',
                            cursor: 'pointer',
                            boxShadow: videoStorageType === src.id ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                            transition: 'all 0.15s'
                          }}
                        >
                          {src.label}
                        </button>
                      ))}
                    </div>

                    {/* Google Drive Option */}
                    {videoStorageType === 'drive' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', marginBottom: 4 }}>
                          <span>Google Drive Shareable Link पेस्ट करा:</span>
                          <span style={{ color: '#15803d', fontWeight: 700 }}>ऑटो-कन्व्हर्ट सपोर्ट</span>
                        </div>
                        <input 
                          type="text" 
                          required 
                          placeholder="उदा. https://drive.google.com/file/d/1A2B3C4D5E.../view?usp=sharing"
                          value={editingVideo.previewVideo}
                          onChange={(e) => setEditingVideo({ ...editingVideo, previewVideo: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                        />
                        {extractGoogleDriveId(editingVideo.previewVideo) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: '#15803d', fontWeight: 700, background: '#ecfdf5', padding: '5px 10px', borderRadius: 4, border: '1px solid #bbf7d0' }}>
                            <CheckCircle2 size={14} />
                            <span>✓ Google Drive File ID ({extractGoogleDriveId(editingVideo.previewVideo)}) अचूक डिटेक्ट झाली! डायरेक्ट स्ट्रीमिंग तयार आहे.</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                            💡 <strong>टीप:</strong> गुगल ड्राईव्हवर व्हिडिओची <strong>"Anyone with the link can view"</strong> परवानगी असल्याची खात्री करा.
                          </span>
                        )}
                      </div>
                    )}

                    {/* Cloudflare R2 Option */}
                    {videoStorageType === 'r2' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c', display: 'flex', alignItems: 'center', gap: 6 }}>
                            ☁️ Cloudflare R2 थेट व्हिडिओ अपलोड (Direct Upload)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              fetchR2Config();
                              setIsR2ConfigModalOpen(true);
                            }}
                            style={{
                              background: '#fff',
                              border: '1px solid #fed7aa',
                              color: '#c2410c',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '4px 9px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            ⚙️ R2 बकेट क्रेडेंशियल्स सेटिंग्स
                          </button>
                        </div>

                        {/* Direct Upload File Drop/Select Area */}
                        <div 
                          style={{
                            border: '2px dashed #fb923c',
                            background: isR2Uploading ? '#fff7ed' : '#ffffff',
                            borderRadius: 10,
                            padding: '16px 14px',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            position: 'relative',
                            boxShadow: '0 1px 3px rgba(234, 88, 12, 0.08)'
                          }}
                        >
                          <input 
                            type="file" 
                            id="r2VideoFileInput"
                            accept="video/mp4,video/webm,video/quicktime,video/mkv,video/*"
                            disabled={isR2Uploading}
                            onChange={handleDirectR2FileUpload}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              opacity: 0,
                              cursor: isR2Uploading ? 'not-allowed' : 'pointer',
                              width: '100%',
                              height: '100%',
                              zIndex: 2
                            }}
                          />

                          {isR2Uploading ? (
                            <div style={{ padding: '8px 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#ea580c', fontWeight: 800, fontSize: '0.88rem' }}>
                                <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid #ea580c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                Cloudflare R2 वर थेट अपलोड होत आहे... ({r2UploadProgress}%)
                              </div>
                              <div style={{ width: '82%', height: 6, background: '#fed7aa', borderRadius: 99, margin: '10px auto 4px auto', overflow: 'hidden' }}>
                                <div style={{ width: `${r2UploadProgress}%`, height: '100%', background: '#ea580c', transition: 'width 0.3s ease' }}></div>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#9a3412' }}>कृपया थांबा, व्हिडिओ R2 बकेटमध्ये ट्रान्सफर होत आहे...</span>
                            </div>
                          ) : (
                            <div>
                              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
                                <Upload size={20} />
                              </div>
                              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#9a3412' }}>
                                📁 येथे व्हिडिओ फाईल निवडा किंवा ड्रॅग करा (Direct R2 Upload)
                              </div>
                              <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '3px 0 8px 0' }}>
                                MP4, WebM, MOV सपोर्टेड • कालावधी, रिझोल्यूशन आणि रेशो ऑटोमॅटिक भरले जाईल
                              </p>
                              <span style={{ display: 'inline-block', background: '#ea580c', color: '#ffffff', padding: '6px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 800, pointerEvents: 'none' }}>
                                📂 संगणकावरून व्हिडिओ निवडा
                              </span>
                            </div>
                          )}
                        </div>

                        {/* R2 Public CDN URL field */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#475569', marginBottom: 3 }}>
                            <span>Cloudflare R2 Public CDN / Direct URL:</span>
                            {editingVideo.previewVideo && (
                              <span style={{ color: '#15803d', fontWeight: 700 }}>✓ व्हिडिओ लिंक सक्रिय आहे</span>
                            )}
                          </div>
                          <input 
                            type="text" 
                            required 
                            placeholder="अपलोड केल्यावर येथे थेट CDN लिंक ऑटोमॅटिक येईल, किंवा येथे लिंक पेस्ट करा"
                            value={editingVideo.previewVideo}
                            onChange={(e) => setEditingVideo({ ...editingVideo, previewVideo: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                          />
                          <span style={{ fontSize: '0.72rem', color: '#ea580c', marginTop: 4, display: 'block' }}>
                            ⚡ Zero Egress Cost: Cloudflare R2 द्वारे अमर्याद वाचकांना 4K बफर-फ्री स्ट्रीमिंग शून्य डाऊनलोड खर्चात मिळते.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Direct URL Option */}
                    {videoStorageType === 'direct' && (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: 4 }}>
                          थेट MP4 / WebM व्हिडिओ URL:
                        </div>
                        <input 
                          type="url" 
                          required 
                          placeholder="उदा. https://commondatastorage.googleapis.com/.../sample.mp4"
                          value={editingVideo.previewVideo}
                          onChange={(e) => setEditingVideo({ ...editingVideo, previewVideo: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Image with Upload Button */}
                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e293b' }}>
                      थंबनेल इमेज (Thumbnail Image) *
                    </label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <input 
                        type="text" 
                        required 
                        placeholder="इमेज URL किंवा खालील बटणाने थेट फोटो निवडा"
                        value={editingVideo.thumbnail}
                        onChange={(e) => setEditingVideo({ ...editingVideo, thumbnail: e.target.value })}
                        style={{ flex: 1, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.85rem' }}
                      />
                      <label style={{ background: '#003884', color: '#fff', padding: '9px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <Upload size={14} /> फोटो निवडा
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleThumbnailFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Technical Specs (Duration, Resolution, FPS, Size) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: '#f1f5f9', padding: 10, borderRadius: 8 }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>कालावधी</label>
                      <input 
                        type="text" 
                        value={editingVideo.duration || '0:50 min'}
                        onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.8rem', marginTop: 2 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>रिझोल्यूशन</label>
                      <input 
                        type="text" 
                        value={editingVideo.resolution || '1080x1920 Full HD'}
                        onChange={(e) => setEditingVideo({ ...editingVideo, resolution: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.8rem', marginTop: 2 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>FPS</label>
                      <input 
                        type="text" 
                        value={editingVideo.fps || '60 FPS'}
                        onChange={(e) => setEditingVideo({ ...editingVideo, fps: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.8rem', marginTop: 2 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>फाईल साईझ</label>
                      <input 
                        type="text" 
                        value={editingVideo.fileSize || '65.0 MB'}
                        onChange={(e) => setEditingVideo({ ...editingVideo, fileSize: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.8rem', marginTop: 2 }}
                      />
                    </div>
                  </div>

                  {/* Marathi Voiceover Script */}
                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e293b' }}>
                      मराठी व्हॉइसओव्हर स्क्रिप्ट (Marathi Script) *
                    </label>
                    <textarea 
                      rows={3} 
                      required 
                      placeholder="[Hook 0-5s] नमस्कार, पुण्यातून सर्वात मोठी बातमी... [Facts 5-25s] मेट्रो ३ सेवा सुरू... [CTA 25-30s] अधिक बातम्यांसाठी फॉलो करा @Nexvarta"
                      value={editingVideo.scriptMarathi}
                      onChange={(e) => setEditingVideo({ ...editingVideo, scriptMarathi: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontSize: '0.85rem', lineHeight: 1.5, fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* English Voiceover Script */}
                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e293b' }}>
                      English Voiceover Script *
                    </label>
                    <textarea 
                      rows={3} 
                      required 
                      placeholder="[Hook 0-5s] Breaking news from Pune... [Facts 5-25s] Pune Metro Line 3 launched today... [CTA 25-30s] Follow @Nexvarta for instant updates"
                      value={editingVideo.scriptEnglish}
                      onChange={(e) => setEditingVideo({ ...editingVideo, scriptEnglish: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontSize: '0.85rem', lineHeight: 1.5, fontFamily: 'inherit' }}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: Interactive Live Preview Card */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 18, position: 'sticky', top: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#003884', textTransform: 'uppercase' }}>
                      👁️ थेट प्रिव्ह्यू (Live Preview)
                    </span>
                    <span style={{ background: '#003884', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                      {editingVideo.format === '9:16' ? '📱 9:16 REEL' : '🖥️ 16:9 4K'}
                    </span>
                  </div>

                  {/* Preview Container */}
                  <div style={{ 
                    position: 'relative', 
                    borderRadius: 10, 
                    overflow: 'hidden', 
                    background: '#0f172a',
                    aspectRatio: editingVideo.format === '9:16' ? '9/14' : '16/9',
                    maxHeight: 320,
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                  }}>
                    {videoTestPlaying ? (
                      extractGoogleDriveId(editingVideo.previewVideo) ? (
                        <iframe 
                          src={`https://drive.google.com/file/d/${extractGoogleDriveId(editingVideo.previewVideo)}/preview`}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="autoplay"
                        />
                      ) : (
                        <video 
                          src={editingVideo.previewVideo} 
                          controls 
                          autoPlay 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                      )
                    ) : (
                      <>
                        <img 
                          src={editingVideo.thumbnail || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'} 
                          alt="Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'; }}
                        />
                        <button
                          type="button"
                          onClick={() => setVideoTestPlaying(true)}
                          style={{ position: 'absolute', background: 'rgba(234, 88, 12, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(234,88,12,0.4)', transition: 'transform 0.2s' }}
                          title="व्हिडिओ प्ले करा"
                        >
                          <Play size={24} fill="#fff" style={{ marginLeft: 3 }} />
                        </button>
                      </>
                    )}
                  </div>

                  {videoTestPlaying && (
                    <button
                      type="button"
                      onClick={() => setVideoTestPlaying(false)}
                      style={{ width: '100%', marginTop: 8, padding: '6px', background: '#e2e8f0', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ⏹️ प्रिव्ह्यू बंद करा
                    </button>
                  )}

                  {/* Metadata readout */}
                  <div style={{ marginTop: 14, background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }}>
                      {editingVideo.title || 'व्हिडिओ शीर्षक येथे दिसेल...'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>कॅटेगरी: <strong>{editingVideo.category}</strong></span>
                      <span>कालावधी: <strong>{editingVideo.duration}</strong></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                      <span>क्वालिटी: <strong>{editingVideo.resolution}</strong></span>
                      <span>FPS: <strong>{editingVideo.fps}</strong></span>
                    </div>
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ ऑल-ॲक्सेस सबस्क्रायबर्सना रॉयल्टी-फ्री डाऊनलोड उपलब्ध
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
                <button 
                  type="button" 
                  onClick={() => { setEditingVideo(null); setVideoTestPlaying(false); }}
                  style={{ background: '#f1f5f9', color: '#475569', padding: '10px 20px', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button 
                  type="submit" 
                  style={{ background: '#ea580c', color: '#fff', padding: '10px 28px', borderRadius: 8, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(234,88,12,0.35)' }}
                >
                  💾 पॅकेज सेव्ह करा (Save Video Package)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* =========================================================================
          MODAL: CREATE / EDIT CATEGORY
          ========================================================================= */}
      {editingCategory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', padding: 28, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              {editingCategory.isNew ? '✨ नवीन कॅटेगरी जोडा (Add Category)' : '✏️ कॅटेगरी संपादित करा (Edit Category)'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 20 }}>
              ही कॅटेगरी मुख्य पोर्टलच्या नेव्हिगेशन बारमध्ये टॅब म्हणून आणि होमपेजवर बातमी विभाग म्हणून लगेच दिसेल.
            </p>

            <form onSubmit={handleSaveCategory}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>कॅटेगरीचे नाव (Category Name) *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="उदा. Technology News, Sports News, राष्ट्रीय बातम्या..."
                    value={editingCategory.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingCategory({
                        ...editingCategory,
                        name: val,
                        slug: editingCategory.isNew ? val.toLowerCase().replace(/[^a-z0-9]/g, '-') : editingCategory.slug
                      });
                    }}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>URL स्लॉग / टॅब कोड (URL Slug) *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="उदा. tech, sports, national"
                    value={editingCategory.slug}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 4, fontSize: '0.95rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3, display: 'block' }}>
                    नेव्हिगेशन लिंक: #{editingCategory.slug || 'category'}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>थीम ॲक्सेंट रंग (Category Theme Color)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <input 
                      type="color" 
                      value={editingCategory.color || '#2563eb'}
                      onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                      style={{ width: 44, height: 44, padding: 2, border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer' }}
                    />
                    <input 
                      type="text" 
                      value={editingCategory.color || '#2563eb'}
                      onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                      style={{ width: 120, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 26 }}>
                <button 
                  type="button" 
                  onClick={() => setEditingCategory(null)}
                  style={{ background: '#f1f5f9', padding: '10px 18px', borderRadius: 8, fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button 
                  type="submit" 
                  style={{ background: '#003884', color: '#fff', padding: '10px 24px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                >
                  {editingCategory.isNew ? 'कॅटेगरी सेव्ह करा' : 'बदल सेव्ह करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CLOUDFLARE R2 CREDENTIALS SETTINGS
          ========================================================================= */}
      {isR2ConfigModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 560, width: '100%', padding: '26px 30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.6rem' }}>☁️</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#002255', margin: 0 }}>
                    Cloudflare R2 बकेट सेटिंग्स
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Zero Egress S3-सुसंगत ऑब्जेक्ट स्टोरेज कॉन्फिगरेशन</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsR2ConfigModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveR2Config} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>
                  Cloudflare Account ID *
                </label>
                <input 
                  type="text" 
                  placeholder="उदा. 4e2c91838d7b3017a9e0483..."
                  value={r2Settings.accountId}
                  onChange={(e) => setR2Settings({ ...r2Settings, accountId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>
                    Access Key ID *
                  </label>
                  <input 
                    type="text" 
                    placeholder="उदा. e0c87... (R2 API Token)"
                    value={r2Settings.accessKeyId}
                    onChange={(e) => setR2Settings({ ...r2Settings, accessKeyId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>
                    Secret Access Key *
                  </label>
                  <input 
                    type="password" 
                    placeholder="नवीन की प्रविष्ट करा किंवा रिकामे ठेवा"
                    value={r2Settings.secretAccessKey}
                    onChange={(e) => setR2Settings({ ...r2Settings, secretAccessKey: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>
                    Bucket Name *
                  </label>
                  <input 
                    type="text" 
                    placeholder="उदा. nexvarta-videos"
                    value={r2Settings.bucketName}
                    onChange={(e) => setR2Settings({ ...r2Settings, bucketName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>
                    Public R2 Domain / Custom CDN
                  </label>
                  <input 
                    type="text" 
                    placeholder="उदा. pub-xxxxxx.r2.dev किंवा cdn.nexvarta.com"
                    value={r2Settings.publicDomain}
                    onChange={(e) => setR2Settings({ ...r2Settings, publicDomain: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 6, marginTop: 4, fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: '0.74rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                💡 <strong>टीप:</strong> Cloudflare R2 डॅशबोर्डमध्ये जावून <em>R2 Object Storage &gt; Manage R2 API Tokens</em> मधून <strong>Object Read &amp; Write</strong> टोकन तयार करा. क्रेडेंशियल्स रिकामी असल्यास व्हिडिओ लोकल <code>public/uploads/videos/</code> मध्ये सुरक्षित सेव्ह केले जातील.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsR2ConfigModalOpen(false)}
                  style={{ background: '#f1f5f9', padding: '9px 16px', borderRadius: 8, fontWeight: 700, color: '#475569', cursor: 'pointer', border: 'none' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ background: '#ea580c', color: '#fff', padding: '9px 24px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', border: 'none' }}
                >
                  ☁️ R2 सेटिंग्स सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
