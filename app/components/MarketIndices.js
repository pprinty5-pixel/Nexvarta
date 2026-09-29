'use client';

import { useEffect, useState } from 'react';

const formatNumber = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);

export default function MarketIndices() {
  const [indices, setIndices] = useState([]);

  useEffect(() => {
    let active = true;
    const load = () => fetch('/api/market-indices', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => { if (active && Array.isArray(data.indices)) setIndices(data.indices); })
      .catch(() => {});
    load();
    const timer = setInterval(load, 60_000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  return (
    <div className="market-indices" aria-label="Live market indices">
      {indices.length ? indices.map((index) => {
        const up = index.change >= 0;
        return (
          <div className="market-index-card" key={index.key}>
            <span className="market-index-name"><span className="market-live-dot" />{index.name}</span>
            <strong>{formatNumber(index.value)}</strong>
            <span className={up ? 'market-change up' : 'market-change down'}>
              {up ? '▲' : '▼'} {Math.abs(index.change).toFixed(2)} ({Math.abs(index.changePercent).toFixed(2)}%)
            </span>
          </div>
        );
      }) : <div className="market-loading">Market data loading…</div>}
    </div>
  );
}
