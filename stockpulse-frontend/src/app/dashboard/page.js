'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, BarChart3, ArrowRight } from 'lucide-react';

const watchlist = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹1,430.80', change: '+0.38%', up: true },
  { symbol: 'TCS', name: 'Tata Consultancy', price: '₹3,842.15', change: '+1.24%', up: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: '₹1,678.50', change: '-0.15%', up: false },
  { symbol: 'INFY', name: 'Infosys', price: '₹1,567.90', change: '-0.52%', up: false },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: '₹1,245.30', change: '+0.89%', up: true },
  { symbol: 'SBIN', name: 'State Bank of India', price: '₹812.45', change: '+1.12%', up: true },
];

export default function DashboardPage() {
  return (
    <div style={{ padding: '28px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.95rem' }}>
        Welcome back! Here&apos;s your market overview.
      </p>

      {/* Market Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 36,
      }}>
        {[
          { label: 'NIFTY 50', value: '23,997.55', change: '-0.74%', up: false },
          { label: 'SENSEX', value: '76,913.50', change: '-0.75%', up: false },
          { label: 'NIFTY BANK', value: '52,145.20', change: '+0.32%', up: true },
          { label: 'INDIA VIX', value: '14.82', change: '-2.15%', up: false },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              {item.value}
            </div>
            <div style={{
              fontSize: '0.85rem', fontWeight: 600, marginTop: 4,
              color: item.up ? 'var(--green)' : 'var(--red)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {item.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {item.change}
            </div>
          </div>
        ))}
      </div>

      {/* Watchlist */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
            <BarChart3 size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Watchlist
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {watchlist.length} stocks
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Symbol', 'Company', 'Price', 'Change', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 20px', textAlign: 'left',
                    fontSize: '0.75rem', color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {watchlist.map((s, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: '0.9rem' }}>
                    {s.symbol}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {s.name}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                    {s.price}
                  </td>
                  <td style={{
                    padding: '14px 20px', fontWeight: 600, fontSize: '0.85rem',
                    color: s.up ? 'var(--green)' : 'var(--red)',
                  }}>
                    {s.change}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <Link
                      href={`/dashboard/stock/${s.symbol}.NS`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: '0.8rem', color: 'var(--accent-light)', fontWeight: 500,
                      }}
                    >
                      Analyze <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
