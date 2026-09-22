'use client';
import { useEffect, useRef, useState } from 'react';
import { adStatus, safeAdLink } from '../../lib/ads';
let cached;
let fetchedAt = 0;
function fetchAds() {
  if (!cached || Date.now() - fetchedAt > 15000) {
    fetchedAt = Date.now();
    cached = fetch('/api/ads', { cache: 'no-store' }).then(res => { if (!res.ok) throw new Error(); return res.json(); }).catch(() => { cached = null; return { ads: [] }; });
  }
  return cached;
}
function track(id, event) {
  fetch('/api/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, event }), keepalive: true }).catch(() => {});
}
export default function AdSlot({ placement, contact = false }) {
  const [data, setData] = useState({ ads: [] });
  const [choice, setChoice] = useState(0);
  const ref = useRef(null);
  const [loaded, setLoaded] = useState('');
  useEffect(() => {
    let mounted = true;
    const refresh = () => fetchAds().then(value => { if (mounted) setData(value); });
    setChoice(Math.random());
    refresh();
    const timer = setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { mounted = false; clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  const ads = data.ads.filter(ad => ad.placement === placement && adStatus(ad) === 'सक्रिय');
  const ad = ads[Math.floor(choice * ads.length)];
  useEffect(() => {
    if (!ad || loaded !== ad.id || !ref.current || typeof IntersectionObserver === 'undefined') return;
    let sent = false;
    const observer = new IntersectionObserver(entries => {
      if (!sent && entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5)) { sent = true; track(ad.id, 'impression'); observer.disconnect(); }
    }, { threshold: 0.5 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ad?.id, loaded]);
  const phone = String(data.contactPhone || '').replace(/\D/g, '');
  if (!ad && !(contact && phone)) return null;
  return <div className={`nv-ad nv-ad-${placement}`}>
    {ad && <><div className="nv-ad-label">जाहिरात</div><a ref={ref} className="nv-ad-frame" href={safeAdLink(ad.link)} target="_blank" rel="sponsored noopener noreferrer" onClick={() => track(ad.id, 'click')} aria-label={`${ad.name} — जाहिरात`}>
      <picture><source media="(max-width: 767px)" srcSet={ad.mobileImage || ad.desktopImage} /><img key={ad.id} src={ad.desktopImage} alt={ad.name} loading={placement === 'header' ? 'eager' : 'lazy'} onLoad={() => setLoaded(ad.id)} /></picture>
    </a></>}
    {contact && phone && <a className="nv-ad-contact" href={`https://wa.me/${phone}?text=${encodeURIComponent('नमस्कार, Nexvarta वर जाहिरात द्यायची आहे. कृपया दर व माहिती पाठवा.')}`} target="_blank" rel="noopener noreferrer">जाहिरात देण्यासाठी संपर्क करा ↗</a>}
  </div>;
}
