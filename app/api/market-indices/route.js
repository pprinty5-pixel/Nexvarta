import { NextResponse } from 'next/server';

const indices = [
  { key: 'sensex', name: 'SENSEX', symbol: '^BSESN' },
  { key: 'nifty', name: 'NIFTY 50', symbol: '^NSEI' },
];

export async function GET() {
  try {
    const results = await Promise.all(indices.map(async (index) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(index.symbol)}?range=1d&interval=1m`;
      const response = await fetch(url, { headers: { 'User-Agent': 'Nexvarta/1.0' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`Market provider returned ${response.status}`);

      const result = (await response.json())?.chart?.result?.[0];
      const meta = result?.meta;
      const price = Number(meta?.regularMarketPrice ?? meta?.previousClose);
      const previousClose = Number(meta?.previousClose ?? meta?.chartPreviousClose);
      if (!Number.isFinite(price) || !Number.isFinite(previousClose)) throw new Error('Invalid market data');

      const change = price - previousClose;
      return { key: index.key, name: index.name, value: price, change, changePercent: (change / previousClose) * 100 };
    }));

    return NextResponse.json({ indices: results, updatedAt: new Date().toISOString() }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Market indices fetch failed:', error);
    return NextResponse.json({ indices: [], error: 'Market data unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
