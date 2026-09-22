import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { readAds, writeAds, isAdAdmin, createAdSession } from '../../../../lib/adsStore';
import { AD_PLACEMENTS, safeAdLink, validAdImage } from '../../../../lib/ads';
export const dynamic = 'force-dynamic';
const json = (data, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET(request) {
  if (!isAdAdmin(request)) return json({ error: 'जाहिरात व्यवस्थापनासाठी पुन्हा लॉगिन करा.' }, 401);
  return json(readAds());
}
export async function POST(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin && new URL(origin).host !== request.headers.get('host')) return json({ error: 'Invalid origin' }, 403);
  try {
    const body = await request.json();
    if (body.action === 'logout') {
      const response = json({ success: true });
      response.cookies.set('nv_ads_admin', '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
      return response;
    }
    if (body.action === 'login') {
      const users = process.env.ADMIN_USERNAME ? [process.env.ADMIN_USERNAME.toLowerCase()] : ['admin', 'nexvarta', 'avinashcommercial01@gmail.com'];
      const passwords = process.env.ADMIN_PASSWORD ? [process.env.ADMIN_PASSWORD] : ['Nexvarta@2026', 'admin123'];
      if (!users.includes(String(body.username || '').trim().toLowerCase()) || !passwords.includes(body.password)) return json({ error: 'लॉगिन माहिती चुकीची आहे.' }, 401);
      const response = json({ success: true });
      response.cookies.set('nv_ads_admin', createAdSession(), { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'strict', path: '/', maxAge: 86400 });
      return response;
    }
    if (!isAdAdmin(request)) return json({ error: 'पुन्हा लॉगिन करा.' }, 401);
    const store = readAds();
    if (body.action === 'contact') {
      const phone = String(body.contactPhone || '').replace(/\D/g, '');
      if (phone && !/^\d{10,15}$/.test(phone)) return json({ error: 'देश कोडसह योग्य WhatsApp नंबर द्या.' }, 400);
      store.contactPhone = phone;
    } else if (body.action === 'delete') {
      store.ads = store.ads.filter(ad => ad.id !== body.id);
    } else if (body.action === 'save') {
      const ad = body.ad || {};
      const dateValid = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
      if (!String(ad.name || '').trim() || !AD_PLACEMENTS[ad.placement] || !validAdImage(ad.desktopImage) || (ad.mobileImage && !validAdImage(ad.mobileImage)) || !safeAdLink(ad.link) || !dateValid(ad.startDate) || !dateValid(ad.endDate) || ad.startDate > ad.endDate) return json({ error: 'नाव, फोटो, लिंक व कालावधी तपासा.' }, 400);
      const amount = Number(ad.amount || 0), paid = Number(ad.paid || 0);
      if (!Number.isFinite(amount) || !Number.isFinite(paid) || amount < 0 || paid < 0 || paid > amount) return json({ error: 'रक्कम तपासा; जमा रक्कम एकूण रकमेपेक्षा जास्त नसावी.' }, 400);
      const existing = store.ads.find(item => item.id === ad.id);
      const saved = { id: existing?.id || randomUUID(), name: String(ad.name).trim().slice(0, 160), placement: ad.placement, desktopImage: ad.desktopImage, mobileImage: ad.mobileImage || '', link: safeAdLink(ad.link), startDate: ad.startDate, endDate: ad.endDate, enabled: Boolean(ad.enabled), amount, paid, impressions: existing?.impressions || 0, clicks: existing?.clicks || 0 };
      store.ads = existing ? store.ads.map(item => item.id === saved.id ? saved : item) : [...store.ads, saved];
    } else return json({ error: 'Invalid action' }, 400);
    writeAds(store);
    return json(store);
  } catch { return json({ error: 'जाहिरात सेव्ह करता आली नाही.' }, 500); }
}
