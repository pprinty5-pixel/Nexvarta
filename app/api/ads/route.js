import { NextResponse } from 'next/server';
import { readAds, writeAds } from '../../../lib/adsStore';
import { adStatus } from '../../../lib/ads';
export const dynamic = 'force-dynamic';
export async function GET() {
  const store = readAds();
  return NextResponse.json({ contactPhone: store.contactPhone, ads: store.ads.filter(ad => adStatus(ad) === 'सक्रिय').map(({ id, name, placement, desktopImage, mobileImage, link, startDate, endDate }) => ({ id, name, placement, desktopImage, mobileImage, link, startDate, endDate, enabled: true })) }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request) {
  try {
    const { id, event } = await request.json();
    if (!['impression', 'click'].includes(event)) return new NextResponse(null, { status: 400 });
    const store = readAds();
    const ad = store.ads.find(item => item.id === id && adStatus(item) === 'सक्रिय');
    if (!ad) return new NextResponse(null, { status: 404 });
    // Limit each browser's counters to once per ad/event in a 30-minute window.
    const cookie = `nv_ad_${event}_${id}`;
    if (!request.cookies.has(cookie)) {
      const field = event === 'click' ? 'clicks' : 'impressions';
      ad[field] = (ad[field] || 0) + 1;
      writeAds(store);
    }
    const response = new NextResponse(null, { status: 204 });
    response.cookies.set(cookie, '1', { httpOnly: true, sameSite: 'lax', path: '/api/ads', maxAge: 1800 });
    return response;
  } catch { return new NextResponse(null, { status: 400 }); }
}
