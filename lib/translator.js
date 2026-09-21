// Centralized Language & Translation Utility for Nexvarta

export const SUPPORTED_LANGUAGES = ['mr', 'en', 'hi'];

/**
 * Sets the googtrans cookie across root path and domain variants
 */
export function setTranslateCookie(lang) {
  if (typeof window === 'undefined') return;

  const host = window.location.hostname;
  const isOriginal = lang === 'mr';
  const cookieVal = isOriginal ? '' : `/mr/${lang}`;
  const expires = isOriginal 
    ? 'expires=Thu, 01 Jan 1970 00:00:00 UTC;' 
    : 'expires=Fri, 31 Dec 2030 23:59:59 GMT;';

  // Path /
  document.cookie = `googtrans=${cookieVal}; ${expires} path=/;`;
  document.cookie = `googtrans=${cookieVal}; ${expires} path=/; domain=${host};`;

  // Domain variants for subdomains / naked domain
  const hostParts = host.split('.');
  if (hostParts.length > 1) {
    const rootDomain = '.' + hostParts.slice(-2).join('.');
    document.cookie = `googtrans=${cookieVal}; ${expires} path=/; domain=${rootDomain};`;
  }
}

/**
 * Triggers Google Translate element combo box
 */
export function triggerGoogleTranslateCombo(lang) {
  if (typeof window === 'undefined') return false;

  const select = document.querySelector('select.goog-te-combo') || 
                 document.querySelector('#google_translate_element select');

  if (select) {
    if (lang === 'mr') {
      select.value = '';
      select.dispatchEvent(new Event('change'));
    } else {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    }
    return true;
  }
  return false;
}

/**
 * Restores original Marathi text cleanly
 */
export function restoreOriginalMarathi() {
  if (typeof window === 'undefined') return;

  setTranslateCookie('mr');
  try {
    localStorage.setItem('nexvarta_lang', 'mr');
  } catch (e) {}

  let restored = false;
  try {
    const bannerIframe = document.querySelector('iframe.goog-te-banner-frame');
    if (bannerIframe) {
      const doc = bannerIframe.contentDocument || bannerIframe.contentWindow?.document;
      const restoreBtn = doc?.querySelector('#\\:1\\.restore, button[id*="restore"], .goog-te-banner-action-restore');
      if (restoreBtn) {
        restoreBtn.click();
        restored = true;
      }
    }
  } catch (e) {}

  const select = document.querySelector('select.goog-te-combo') || 
                 document.querySelector('#google_translate_element select');
  if (select) {
    select.value = '';
    select.dispatchEvent(new Event('change'));
  }

  // If page was already translated and DOM font tags exist, reload to cleanly restore original text
  setTimeout(() => {
    const isTranslated = document.querySelector('font[class*="goog"]') || 
                         document.documentElement.classList.contains('translated-ltr') ||
                         document.documentElement.classList.contains('translated-rtl');
    if (isTranslated) {
      window.location.reload();
    }
  }, 350);
}

/**
 * Main function to switch language across the application
 */
export function applyLanguage(lang) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('nexvarta_lang', lang);
  } catch (e) {}

  if (lang === 'mr') {
    restoreOriginalMarathi();
  } else {
    setTranslateCookie(lang);
    
    // Try triggering immediately
    const triggered = triggerGoogleTranslateCombo(lang);
    if (!triggered) {
      // If combo is not yet loaded, poll for up to 3 seconds
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (triggerGoogleTranslateCombo(lang) || attempts > 30) {
          clearInterval(interval);
          if (attempts > 30) {
            // As fallback, reload with cookie set
            window.location.reload();
          }
        }
      }, 100);
    }
  }

  // Notify components
  window.dispatchEvent(new CustomEvent('nexvarta-lang-change', { detail: lang }));
}

/**
 * Returns currently saved language or 'mr' by default
 */
export function getSavedLanguage() {
  if (typeof window === 'undefined') return 'mr';
  try {
    const saved = localStorage.getItem('nexvarta_lang');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return 'mr';
}
