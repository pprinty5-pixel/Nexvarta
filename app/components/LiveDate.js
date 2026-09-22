'use client';

import { useEffect, useState } from 'react';
import { getLiveDateDisplay } from '../../lib/i18n';

export default function LiveDate({ language = 'mr' }) {
  const [date, setDate] = useState('');

  useEffect(() => {
    let timer;
    const refresh = () => {
      const now = Date.now();
      setDate(getLiveDateDisplay(language, new Date(now)));
      clearTimeout(timer);
      // Refresh at the next midnight in India, even if the page stays open.
      const day = 24 * 60 * 60 * 1000;
      timer = setTimeout(refresh, day - ((now + 330 * 60 * 1000) % day));
    };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [language]);

  return <span className="notranslate" translate="no">{date}</span>;
}
