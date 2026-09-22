'use client';
import { useEffect, useState } from 'react';
import { AD_PLACEMENTS, adStatus, indiaToday } from '../../lib/ads';
import { compressImage } from '../../lib/compressImage';
const blank = () => ({ name: '', placement: 'header', desktopImage: '', mobileImage: '', link: '', startDate: indiaToday(), endDate: indiaToday(new Date(Date.now() + 29 * 86400000)), enabled: true, amount: 0, paid: 0 });
export default function AdsManager() {
  const [store, setStore] = useState({ ads: [], contactPhone: '' });
  const [draft, setDraft] = useState(null);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [preview, setPreview] = useState('desktop');
  const [credentials, setCredentials] = useState({ username: 'admin', password: '' });
  const load = async () => {
    try {
      const res = await fetch('/api/admin/ads', { cache: 'no-store' });
      if (res.status === 401) { setLocked(true); return; }
      if (!res.ok) throw new Error('माहिती लोड झाली नाही.');
      const data = await res.json(); setStore(data); setPhone(data.contactPhone || ''); setLocked(false);
    } catch (error) { setMessage(error.message); }
  };
  useEffect(() => { load(); }, []);
  async function action(body) {
    setBusy(true); setMessage('');
    try {
      const res = await fetch('/api/admin/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { if (res.status === 401) setLocked(true); throw new Error(data.error); }
      if (body.action === 'login') { setCredentials({ username: 'admin', password: '' }); await load(); }
      else { setStore(data); setMessage('बदल सेव्ह झाले.'); if (body.action === 'save') setDraft(null); }
    } catch (error) { setMessage(error.message || 'सेव्ह करता आले नाही.'); }
    finally { setBusy(false); }
  }
  async function upload(file, field) {
    if (!file) return;
    setBusy(true); setMessage('फोटो compress आणि upload होत आहे…');
    try {
      const form = new FormData(); form.append('file', await compressImage(file));
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: form });
      const data = await res.json(); if (!res.ok || !data.url) throw new Error(data.error || 'Upload अयशस्वी.');
      setDraft(value => ({ ...value, [field]: data.url })); setMessage('फोटो तयार आहे. जाहिरात सेव्ह करा.');
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  const field = (name, value) => setDraft(current => ({ ...current, [name]: value }));
  return <section className="ads-manager">
    <h1>जाहिरात व्यवस्थापन</h1><p>स्थानिक व्यवसायांचे बॅनर, कालावधी, पैसे आणि प्रतिसाद.</p>
    {message && <p role="status" className="ads-notice">{message}</p>}
    {locked ? <form className="ads-panel" onSubmit={e => { e.preventDefault(); action({ action: 'login', ...credentials }); }}>
      <h3>जाहिरातींसाठी admin लॉगिन</h3><p>सध्याचा admin आयडी व पासवर्ड वापरा.</p>
      <label>आयडी<input required autoComplete="username" value={credentials.username} onChange={e => setCredentials({ ...credentials, username: e.target.value })} /></label>
      <label>पासवर्ड<input required type="password" autoComplete="current-password" value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} /></label>
      <button disabled={busy}>लॉगिन करा</button>
    </form> : <>
      <div className="ads-sizes">{Object.entries(AD_PLACEMENTS).map(([key, value]) => <div key={key}><strong>{value.label}</strong><span>Desktop: {value.desktop}px</span><span>Mobile: {value.mobile}px</span></div>)}</div>
      <form className="ads-panel ads-contact-form" onSubmit={e => { e.preventDefault(); action({ action: 'contact', contactPhone: phone }); }}>
        <label>जाहिरात चौकशीसाठी WhatsApp नंबर (देश कोडसह)<input type="tel" placeholder="91XXXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} /></label><button disabled={busy}>नंबर सेव्ह करा</button>
      </form>
      <div className="ads-toolbar"><button disabled={busy} onClick={() => { setDraft(blank()); setPreview('desktop'); }}>+ जाहिरात जोडा</button><button disabled={busy} onClick={load}>आकडेवारी अपडेट करा</button></div>
      {draft && <form className="ads-panel" onSubmit={e => { e.preventDefault(); action({ action: 'save', ad: draft }); }}>
        <h2>{draft.id ? 'जाहिरात बदला' : 'नवीन जाहिरात'}</h2>
        <div className="ads-fields">
          <label>व्यवसायाचे नाव<input required maxLength={160} value={draft.name} onChange={e => field('name', e.target.value)} /></label>
          <label>जागा<select value={draft.placement} onChange={e => field('placement', e.target.value)}>{Object.entries(AD_PLACEMENTS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
          <label>Desktop बॅनर — {AD_PLACEMENTS[draft.placement].desktop}px<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => upload(e.target.files?.[0], 'desktopImage')} />{draft.desktopImage && <span>✓ फोटो जोडला</span>}</label>
          <label>Mobile बॅनर — {AD_PLACEMENTS[draft.placement].mobile}px<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => upload(e.target.files?.[0], 'mobileImage')} /><small>पर्यायी; नसल्यास desktop फोटो पूर्ण दिसेल.</small>{draft.mobileImage && <button type="button" onClick={() => field('mobileImage', '')}>Mobile फोटो काढा</button>}</label>
          <label>वेबसाइट / WhatsApp लिंक<input required type="url" placeholder="https://wa.me/91XXXXXXXXXX" value={draft.link} onChange={e => field('link', e.target.value)} /></label>
          <label>पॅकेज<select defaultValue="custom" onChange={e => { if (e.target.value !== 'custom' && draft.startDate) { const date = new Date(`${draft.startDate}T00:00:00+05:30`); date.setTime(date.getTime() + (Number(e.target.value) - 1) * 86400000); field('endDate', indiaToday(date)); } }}><option value="custom">स्वतः तारीख ठरवा</option><option value="7">७ दिवस</option><option value="30">३० दिवस</option></select></label>
          <label>सुरू तारीख (भारतीय वेळ)<input required type="date" value={draft.startDate} onChange={e => field('startDate', e.target.value)} /></label>
          <label>समाप्त तारीख (दिवसअखेर)<input required type="date" min={draft.startDate} value={draft.endDate} onChange={e => field('endDate', e.target.value)} /></label>
          <label>ठरलेली रक्कम ₹<input type="number" min="0" step="0.01" value={draft.amount} onChange={e => field('amount', e.target.value)} /></label>
          <label>मिळालेले पैसे ₹<input type="number" min="0" max={draft.amount} step="0.01" value={draft.paid} onChange={e => field('paid', e.target.value)} /></label>
        </div>
        <label className="ads-toggle"><input type="checkbox" checked={draft.enabled} onChange={e => field('enabled', e.target.checked)} /> जाहिरात चालू ठेवा</label>
        <div className="ads-toolbar"><button type="button" onClick={() => setPreview('desktop')} aria-pressed={preview === 'desktop'}>Desktop preview</button><button type="button" onClick={() => setPreview('mobile')} aria-pressed={preview === 'mobile'}>Mobile preview</button></div>
        {draft.desktopImage && <div className={`ads-preview ${preview} nv-ad-${draft.placement}`}><div className="nv-ad-label">जाहिरात</div><div className="nv-ad-frame"><img src={preview === 'mobile' ? draft.mobileImage || draft.desktopImage : draft.desktopImage} alt={draft.name || 'बॅनर preview'} /></div></div>}
        <div className="ads-toolbar"><button disabled={busy || !draft.desktopImage}>जाहिरात सेव्ह करा</button><button type="button" disabled={busy} onClick={() => setDraft(null)}>रद्द करा</button></div>
      </form>}
      <p className="ads-help">एका जागेवर अनेक सक्रिय जाहिराती असल्यास पान उघडताना एक निवडली जाते. Views / clicks हे अंदाजे आकडे आहेत; प्रत्येक browser मधून ३० मिनिटांत एकदाच मोजले जातात.</p>
      <div className="ads-list">{store.ads.length === 0 && <div className="ads-panel">अजून जाहिराती नाहीत. “जाहिरात जोडा” वापरा.</div>}{store.ads.map(ad => <article className="ads-panel ads-card" key={ad.id}>
        <img src={ad.desktopImage} alt={ad.name} /><div><h3>{ad.name}</h3><p>{AD_PLACEMENTS[ad.placement]?.label} · <strong>{adStatus(ad)}</strong></p><p>{ad.startDate} → {ad.endDate}</p><p>दिसली: {ad.impressions || 0} · Clicks: {ad.clicks || 0}</p><p>एकूण ₹{ad.amount} · जमा ₹{ad.paid} · बाकी ₹{(ad.amount - ad.paid).toFixed(2)}</p><div className="ads-toolbar"><button disabled={busy} onClick={() => setDraft({ ...ad })}>बदला</button><button disabled={busy} onClick={() => action({ action: 'save', ad: { ...ad, enabled: !ad.enabled } })}>{ad.enabled ? 'बंद करा' : 'चालू करा'}</button><button disabled={busy} onClick={() => { if (confirm(`“${ad.name}” जाहिरात काढायची?`)) action({ action: 'delete', id: ad.id }); }}>काढा</button></div></div>
      </article>)}</div>
    </>}
  </section>;
}
