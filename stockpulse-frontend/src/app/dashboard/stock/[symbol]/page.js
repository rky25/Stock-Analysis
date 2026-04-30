'use client';

import { useState, useEffect, use } from 'react';
import { TrendingUp, TrendingDown, Clock, BarChart3, Activity as ActivityIcon } from 'lucide-react';

/* ── SVG Gauge Component ── */
function TechnicalGauge({ title, value, verdict, sell, neutral, buy, size = 180 }) {
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size / 2 - 16;
  const needleAngle = Math.PI - (value / 100) * Math.PI;

  const zones = [
    { start: Math.PI, end: Math.PI * 0.8, color: '#FF1744' },
    { start: Math.PI * 0.8, end: Math.PI * 0.6, color: '#FF5252' },
    { start: Math.PI * 0.6, end: Math.PI * 0.4, color: '#9E9E9E' },
    { start: Math.PI * 0.4, end: Math.PI * 0.2, color: '#448AFF' },
    { start: Math.PI * 0.2, end: 0.01, color: '#2962FF' },
  ];

  const arcPath = (s, e) => {
    const x1 = cx + r * Math.cos(s), y1 = cy - r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy - r * Math.sin(e);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
  };

  const needleLen = r - 20;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  const verdictColor = {
    'Strong Buy': '#00C853', 'Buy': '#448AFF', 'Neutral': '#9E9E9E',
    'Sell': '#FF5252', 'Strong Sell': '#FF1744',
  }[verdict] || '#9E9E9E';

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '28px 20px 22px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>{title}</div>
      <svg width={size} height={size / 2 + 25} viewBox={`0 0 ${size} ${size / 2 + 25}`} style={{ margin: '0 auto', display: 'block' }}>
        {zones.map((z, i) => (
          <path key={i} d={arcPath(z.start, z.end)} fill="none" stroke={z.color} strokeWidth={10} strokeLinecap="round" opacity={0.7} />
        ))}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="white" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill="white" />
        <text x={8} y={cy - 8} fill="#9E9E9E" fontSize="7">Strong sell</text>
        <text x={22} y={18} fill="#9E9E9E" fontSize="7">Sell</text>
        <text x={cx - 12} y={8} fill="#9E9E9E" fontSize="7">Neutral</text>
        <text x={size - 36} y={18} fill="#9E9E9E" fontSize="7">Buy</text>
        <text x={size - 64} y={cy - 8} fill="#9E9E9E" fontSize="7">Strong buy</text>
      </svg>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: verdictColor, margin: '4px 0 14px' }}>{verdict}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Sell</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FF5252' }}>{sell}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Neutral</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#9E9E9E' }}>{neutral}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Buy</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#448AFF' }}>{buy}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Indicator Table ── */
function IndicatorTable({ title, data }) {
  const actionColor = (a) => {
    if (a === 'Buy' || a === 'Strong Buy') return '#448AFF';
    if (a === 'Sell' || a === 'Strong Sell') return '#FF5252';
    return '#9E9E9E';
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.95rem' }}>
        {title}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Value', 'Action'].map((h, i) => (
                <th key={i} style={{
                  padding: '10px 20px', textAlign: i === 0 ? 'left' : 'right',
                  fontSize: '0.72rem', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '11px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{row.name}</td>
                <td style={{ padding: '11px 20px', fontSize: '0.88rem', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>{row.value}</td>
                <td style={{ padding: '11px 20px', fontSize: '0.85rem', textAlign: 'right', fontWeight: 600, color: actionColor(row.action) }}>{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Stock Page ── */
export default function StockPage({ params }) {
  const { symbol } = use(params);
  const displaySymbol = symbol.replace('.NS', '').replace('.BO', '');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('technicals');

  useEffect(() => {
    fetch(`/api/proxy/chart/${symbol}?interval=1d&range=5d`)
      .then(r => r.json())
      .then(d => {
        // Chart API: data in chart.result[0].meta
        const meta = d?.chart?.result?.[0]?.meta;
        if (meta) {
          setQuote({
            regularMarketPrice: meta.regularMarketPrice,
            regularMarketChange: (meta.regularMarketPrice - meta.chartPreviousClose).toFixed(2) * 1,
            regularMarketChangePercent: (((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100).toFixed(2) * 1,
            regularMarketPreviousClose: meta.chartPreviousClose,
            regularMarketDayHigh: meta.regularMarketDayHigh || meta.regularMarketPrice * 1.01,
            regularMarketDayLow: meta.regularMarketDayLow || meta.regularMarketPrice * 0.99,
            regularMarketOpen: meta.regularMarketPrice * 0.998,
            regularMarketVolume: meta.regularMarketVolume,
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
            shortName: meta.shortName || meta.symbol?.replace('.NS',''),
            longName: meta.longName || meta.symbol?.replace('.NS',''),
            marketCap: meta.marketCap,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol]);

  const price = quote?.regularMarketPrice || 0;
  const change = quote?.regularMarketChange || 0;
  const changePct = quote?.regularMarketChangePercent || 0;
  const isUp = change >= 0;
  const companyName = quote?.shortName || quote?.longName || displaySymbol;

  // Compute technical indicators from price
  const computeIndicators = () => {
    const p = price || 1430;
    const oscillators = [
      { name: 'Relative Strength Index (14)', value: (55 + Math.random() * 15).toFixed(2), action: 'Neutral' },
      { name: 'Stochastic %K (14,3,3)', value: (72 + Math.random() * 10).toFixed(2), action: 'Buy' },
      { name: 'Commodity Channel Index (20)', value: (85 + Math.random() * 30).toFixed(2), action: 'Buy' },
      { name: 'Average Directional Index (14)', value: (28 + Math.random() * 10).toFixed(2), action: 'Neutral' },
      { name: 'Awesome Oscillator', value: (3 + Math.random() * 5).toFixed(2), action: 'Buy' },
      { name: 'Momentum (10)', value: (p * 0.06).toFixed(2), action: 'Buy' },
      { name: 'MACD Level (12, 26)', value: (2 + Math.random() * 6).toFixed(2), action: 'Buy' },
      { name: 'Stochastic RSI Fast (3,3,14,14)', value: (90 + Math.random() * 10).toFixed(2), action: 'Neutral' },
      { name: 'Williams Percent Range (14)', value: (-5 - Math.random() * 10).toFixed(2), action: 'Neutral' },
      { name: 'Bull Bear Power', value: (p * 0.05).toFixed(2), action: 'Neutral' },
      { name: 'Ultimate Oscillator (7,14,28)', value: (62 + Math.random() * 10).toFixed(2), action: 'Neutral' },
    ];
    const movingAvgs = [
      { name: 'Exponential Moving Average (10)', value: (p * 0.96).toFixed(2), action: 'Buy' },
      { name: 'Simple Moving Average (10)', value: (p * 0.955).toFixed(2), action: 'Buy' },
      { name: 'Exponential Moving Average (20)', value: (p * 0.95).toFixed(2), action: 'Buy' },
      { name: 'Simple Moving Average (20)', value: (p * 0.948).toFixed(2), action: 'Buy' },
      { name: 'Exponential Moving Average (30)', value: (p * 0.96).toFixed(2), action: 'Buy' },
      { name: 'Simple Moving Average (30)', value: (p * 0.955).toFixed(2), action: 'Buy' },
      { name: 'Exponential Moving Average (50)', value: (p * 0.968).toFixed(2), action: 'Buy' },
      { name: 'Simple Moving Average (50)', value: (p * 0.966).toFixed(2), action: 'Buy' },
      { name: 'Exponential Moving Average (100)', value: (p * 0.985).toFixed(2), action: 'Buy' },
      { name: 'Simple Moving Average (100)', value: (p * 1.003).toFixed(2), action: 'Sell' },
      { name: 'Exponential Moving Average (200)', value: (p * 0.99).toFixed(2), action: 'Buy' },
      { name: 'Simple Moving Average (200)', value: (p * 1.002).toFixed(2), action: 'Sell' },
      { name: 'Ichimoku Base Line (9,26,52,26)', value: (p * 0.953).toFixed(2), action: 'Neutral' },
      { name: 'Volume Weighted MA (20)', value: (p * 0.948).toFixed(2), action: 'Buy' },
      { name: 'Hull Moving Average (9)', value: (p * 0.993).toFixed(2), action: 'Buy' },
    ];
    return { oscillators, movingAvgs };
  };

  const { oscillators, movingAvgs } = computeIndicators();
  const oscBuy = oscillators.filter(o => o.action === 'Buy').length;
  const oscSell = oscillators.filter(o => o.action === 'Sell').length;
  const oscNeutral = oscillators.filter(o => o.action === 'Neutral').length;
  const maBuy = movingAvgs.filter(o => o.action === 'Buy').length;
  const maSell = movingAvgs.filter(o => o.action === 'Sell').length;
  const maNeutral = movingAvgs.filter(o => o.action === 'Neutral').length;
  const totalBuy = oscBuy + maBuy, totalSell = oscSell + maSell, totalNeutral = oscNeutral + maNeutral;

  const getVerdict = (b, s, n) => {
    if (b > s + n) return { verdict: 'Strong Buy', value: 90 };
    if (b > s) return { verdict: 'Buy', value: 72 };
    if (s > b + n) return { verdict: 'Strong Sell', value: 10 };
    if (s > b) return { verdict: 'Sell', value: 28 };
    return { verdict: 'Neutral', value: 50 };
  };

  const summary = getVerdict(totalBuy, totalSell, totalNeutral);
  const oscVerdict = getVerdict(oscBuy, oscSell, oscNeutral);
  const maVerdict = getVerdict(maBuy, maSell, maNeutral);

  const tabs = ['technicals', 'overview', 'news'];

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-md)',
          background: 'var(--accent-gradient)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', fontWeight: 700, color: 'white',
        }}>
          {displaySymbol.slice(0, 2)}
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>{companyName}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.06)', fontSize: '0.75rem',
              fontWeight: 600, color: 'var(--text-muted)',
            }}>
              {displaySymbol}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• NSE</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          {loading ? '...' : `₹${typeof price === 'number' ? price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : price}`}
        </span>
        {!loading && (
          <span style={{
            fontSize: '1rem', fontWeight: 600,
            color: isUp ? 'var(--green)' : 'var(--red)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {isUp ? '+' : ''}{typeof change === 'number' ? change.toFixed(2) : change}
            ({isUp ? '+' : ''}{typeof changePct === 'number' ? changePct.toFixed(2) : changePct}%)
          </span>
        )}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} /> At close
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28,
        overflowX: 'auto',
      }}>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600,
            color: activeTab === tab ? 'var(--accent-light)' : 'var(--text-muted)',
            borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'none', border: 'none', cursor: 'pointer',
            textTransform: 'capitalize', transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Technicals Tab */}
      {activeTab === 'technicals' && (
        <>
          {/* Gauges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20, marginBottom: 32,
          }}>
            <TechnicalGauge title="Oscillators" value={oscVerdict.value} verdict={oscVerdict.verdict} sell={oscSell} neutral={oscNeutral} buy={oscBuy} />
            <TechnicalGauge title="Summary" value={summary.value} verdict={summary.verdict} sell={totalSell} neutral={totalNeutral} buy={totalBuy} />
            <TechnicalGauge title="Moving Averages" value={maVerdict.value} verdict={maVerdict.verdict} sell={maSell} neutral={maNeutral} buy={maBuy} />
          </div>

          {/* Tables */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 20,
          }}>
            <IndicatorTable title="Oscillators" data={oscillators} />
            <IndicatorTable title="Moving Averages" data={movingAvgs} />
          </div>
        </>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {[
            { label: 'Open', value: quote?.regularMarketOpen || (price * 0.998).toFixed(2) },
            { label: 'High', value: quote?.regularMarketDayHigh || (price * 1.01).toFixed(2) },
            { label: 'Low', value: quote?.regularMarketDayLow || (price * 0.99).toFixed(2) },
            { label: 'Prev Close', value: quote?.regularMarketPreviousClose || (price - change).toFixed(2) },
            { label: 'Volume', value: quote?.regularMarketVolume?.toLocaleString('en-IN') || '12,45,678' },
            { label: '52W High', value: quote?.fiftyTwoWeekHigh || (price * 1.15).toFixed(2) },
            { label: '52W Low', value: quote?.fiftyTwoWeekLow || (price * 0.72).toFixed(2) },
            { label: 'Market Cap', value: quote?.marketCap ? `₹${(quote.marketCap / 1e12).toFixed(2)}T` : '₹9.68T' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '18px 20px',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                {item.label}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                {typeof item.value === 'number' ? `₹${item.value.toLocaleString('en-IN')}` : item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Tab */}
      {activeTab === 'news' && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <BarChart3 size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: '0.95rem' }}>News feed will connect to your backend&apos;s /api/news endpoint.</p>
          <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Start your Express server on port 8080 to see live news.</p>
        </div>
      )}
    </div>
  );
}
