'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '../../data/newsData';

export default function AboutPage() {
  const [config, setConfig] = useState(siteConfig);

  useEffect(() => {
    fetch('/api/admin/cms', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => { if (data.siteConfig) setConfig(data.siteConfig); })
      .catch(() => {});
  }, []);

  const about = config.about || siteConfig.about;
  const contact = config.contact || siteConfig.contact;

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <div style={{ background: '#003884', color: '#fff', padding: '14px 20px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 900, fontSize: '1.25rem' }}>{config.name || 'NEXVARTA'}</Link>
          <Link href="/" style={{ color: '#dbeafe', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}><ArrowLeft size={16} /> मुख्य पान</Link>
        </div>
      </div>

      <section className="container" style={{ paddingTop: 42, paddingBottom: 42 }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: '42px clamp(22px, 6vw, 80px)', boxShadow: '0 8px 30px rgba(15,23,42,0.07)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#ea580c', fontWeight: 800, marginBottom: 8 }}>{about.tagline || config.tagline}</div>
          <h1 style={{ color: '#003884', fontSize: 'clamp(2rem, 5vw, 3.4rem)', margin: '0 0 22px', fontWeight: 900 }}>{about.title || 'About Us'}</h1>
          <div style={{ whiteSpace: 'pre-line', color: '#475569', fontSize: '1.08rem', lineHeight: 1.9 }}>{about.content || config.description}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 22 }}>
          <div style={{ background: '#fff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0' }}><MapPin color="#ea580c" /><h3>मुख्यालय</h3><p>{contact.address}</p></div>
          <div style={{ background: '#fff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0' }}><Mail color="#ea580c" /><h3>ईमेल</h3><p>{(contact.emails || []).map((item) => item.email).join(' • ')}</p></div>
          <div style={{ background: '#fff', padding: 22, borderRadius: 14, border: '1px solid #e2e8f0' }}><Phone color="#ea580c" /><h3>संपर्क</h3><p>{(contact.phones || []).map((item) => item.number).join(' • ')}</p></div>
        </div>
      </section>
    </main>
  );
}
