'use client';

import { useEffect } from 'react';
import { getSavedLanguage, triggerGoogleTranslateCombo } from '../../lib/translator';

export default function GoogleTranslator() {
  useEffect(() => {
    // 1. React DOM Safety Patch: Protect against Google Translate wrapping text nodes in <font>
    if (typeof Node === 'function' && Node.prototype) {
      const origRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function(child) {
        if (child.parentNode !== this) {
          return child;
        }
        return origRemoveChild.apply(this, arguments);
      };

      const origInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function(newNode, refNode) {
        if (refNode && refNode.parentNode !== this) {
          return newNode;
        }
        return origInsertBefore.apply(this, arguments);
      };
    }

    // 2. Define googleTranslateElementInit callback
    window.googleTranslateElementInit = function() {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'mr',
            includedLanguages: 'mr,en,hi',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );

        // If a language other than 'mr' was selected, apply it once initialized
        const savedLang = getSavedLanguage();
        if (savedLang && savedLang !== 'mr') {
          let checkCount = 0;
          const checkTimer = setInterval(() => {
            checkCount++;
            if (triggerGoogleTranslateCombo(savedLang) || checkCount > 30) {
              clearInterval(checkTimer);
            }
          }, 150);
        }
      }
    };

    // 3. Inject Google Translate script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div 
      id="google_translate_element" 
      style={{ display: 'none', position: 'absolute', top: -9999, left: -9999 }} 
      aria-hidden="true" 
    />
  );
}
