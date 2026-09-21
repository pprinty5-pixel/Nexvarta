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

    // 2. If a non-Marathi language was previously saved, trigger translation once combo is ready
    const savedLang = getSavedLanguage();
    if (savedLang && savedLang !== 'mr') {
      let checkCount = 0;
      const checkTimer = setInterval(() => {
        checkCount++;
        if (triggerGoogleTranslateCombo(savedLang) || checkCount > 35) {
          clearInterval(checkTimer);
        }
      }, 150);
    }
  }, []);

  return null;
}
