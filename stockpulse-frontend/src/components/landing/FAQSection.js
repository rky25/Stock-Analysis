'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'What stocks are covered?', a: 'StockPulse covers all NIFTY 50 stocks plus popular mid-cap and sector stocks on NSE. We continuously add more based on user demand.' },
  { q: 'How accurate are the trading signals?', a: 'Our signal engine achieves 85%+ confidence on backtested data. Signals combine RSI, MACD, ADX, volume analysis, and AI scoring. However, past performance does not guarantee future results.' },
  { q: 'Is my data safe and secure?', a: 'Absolutely. We use encrypted connections, secure JWT authentication, and never store your financial data. Your analysis sessions are private and not shared.' },
  { q: 'Can I use StockPulse on my phone?', a: 'Yes! StockPulse is fully responsive and works beautifully on all screen sizes — phones, tablets, and desktops. No app download needed.' },
  { q: 'What\'s included in the free plan?', a: 'The free plan includes 5 stock signals per day, basic candlestick charts with 15-minute delayed data, and community access. Upgrade to Pro for real-time data and AI advisor.' },
  { q: 'How does the AI Trading Advisor work?', a: 'Our AI advisor is powered by Llama 3.1 70B. It analyzes your selected stock\'s technical data in real-time and provides context-aware insights, answering any trading question you have.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" style={{ padding: '100px 0', background: 'var(--bg-surface)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="section-header">
          <h2>Frequently Asked <span className="text-gradient">Questions</span></h2>
          <p>Got questions? We have answers.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid',
                borderColor: open === i ? 'var(--border-accent)' : 'var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
              >
                {faq.q}
                <ChevronDown
                  size={18}
                  style={{
                    color: 'var(--text-muted)',
                    transition: 'transform 0.3s',
                    transform: open === i ? 'rotate(180deg)' : 'rotate(0)',
                    flexShrink: 0,
                    marginLeft: 12,
                  }}
                />
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '0 22px 18px',
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.7,
                    }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
