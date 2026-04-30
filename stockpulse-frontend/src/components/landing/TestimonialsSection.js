'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Arjun M.',
    role: 'Swing Trader, Mumbai',
    quote: 'StockPulse changed how I approach the markets. The technical gauges give me confidence before every trade. The AI advisor is like having a research analyst on call.',
    metric: '₹2.4L+',
    metricLabel: 'Paper Trading Profit',
    stars: 5,
  },
  {
    name: 'Priya S.',
    role: 'Options Trader, Bangalore',
    quote: 'The signal engine is remarkably accurate. I love how it shows oscillators, moving averages, and a summary verdict — just like TradingView but focused on NSE.',
    metric: '89%',
    metricLabel: 'Win Rate (3 months)',
    stars: 5,
  },
  {
    name: 'Rahul K.',
    role: 'Day Trader, Delhi',
    quote: 'Finally a platform built for Indian markets! Real-time NIFTY data, clean charts, and the multi-stock scanner is a game-changer for finding breakout opportunities.',
    metric: '50+',
    metricLabel: 'Stocks Analyzed Daily',
    stars: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[current];

  return (
    <section style={{ padding: '100px 0', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="section-header">
          <h2>Loved by <span className="text-gradient">Traders</span></h2>
          <p>See what traders across India are saying about StockPulse.</p>
        </div>

        <div style={{ position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '40px 36px',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 4,
              }}>
                {t.metric}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.metricLabel}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
                {Array(t.stars).fill(0).map((_, i) => (
                  <Star key={i} size={16} fill="#FFD740" color="#FFD740" />
                ))}
              </div>

              <p style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                fontStyle: 'italic',
                marginBottom: 24,
                maxWidth: 600,
                margin: '0 auto 24px',
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{t.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.role}</div>
            </motion.div>
          </AnimatePresence>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: 16, marginTop: 28, alignItems: 'center',
          }}>
            <button onClick={prev} style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
              <ChevronLeft size={18} />
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    width: current === i ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: current === i ? 'var(--accent)' : 'var(--border-light)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>

            <button onClick={next} style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
