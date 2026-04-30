'use client';

import { motion } from 'framer-motion';
import { UserPlus, Search, TrendingUp } from 'lucide-react';

const steps = [
  { icon: <UserPlus size={28} />, title: 'Create Account', desc: 'Sign up free in 30 seconds with Google or email. No credit card required.' },
  { icon: <Search size={28} />, title: 'Pick a Stock', desc: 'Search any NSE stock — NIFTY 50, sectors, or mid-caps. Instant data loading.' },
  { icon: <TrendingUp size={28} />, title: 'Get Analysis', desc: 'See AI-backed signals, technical gauges, entry/SL/target levels — all in one view.' },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '100px 0', background: 'var(--bg-surface)' }}>
      <div className="container">
        <div className="section-header">
          <h2>How It <span className="text-gradient">Works</span></h2>
          <p>From sign-up to your first signal in under 60 seconds.</p>
        </div>

        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', position: 'relative' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {steps.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center',
              padding: '36px 24px',
              position: 'relative',
            }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--accent-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 700,
                boxShadow: '0 4px 20px var(--accent-glow)',
              }}>
                {s.icon}
              </div>
              <div style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--bg-card)', border: '2px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-light)',
              }}>
                {i + 1}
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
