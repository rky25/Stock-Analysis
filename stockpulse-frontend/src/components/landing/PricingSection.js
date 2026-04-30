'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: { monthly: '₹0', yearly: '₹0' },
    desc: 'Perfect for getting started',
    features: ['5 stock signals/day', 'Basic charts', '15-min delayed data', 'Community access'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: { monthly: '₹999', yearly: '₹799' },
    desc: 'For serious traders',
    features: ['Unlimited signals', 'Real-time data', 'AI Trading Advisor', 'Technical gauges', 'Backtesting engine', 'Paper trading', 'Priority support'],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: '₹2,999', yearly: '₹2,399' },
    desc: 'For institutions & teams',
    features: ['Everything in Pro', 'API access', 'Custom alerts', 'Multi-user dashboard', 'Dedicated support', 'White-label option'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" style={{ padding: '100px 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <h2>Simple, Transparent <span className="text-gradient">Pricing</span></h2>
          <p>Start free. Upgrade when you need more power.</p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-card)', borderRadius: 'var(--radius-full)',
            padding: '4px', marginTop: 24, border: '1px solid var(--border)',
          }}>
            <button
              onClick={() => setYearly(false)}
              style={{
                padding: '8px 20px', borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem', fontWeight: 600,
                background: !yearly ? 'var(--accent)' : 'transparent',
                color: !yearly ? 'white' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >Monthly</button>
            <button
              onClick={() => setYearly(true)}
              style={{
                padding: '8px 20px', borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem', fontWeight: 600,
                background: yearly ? 'var(--accent)' : 'transparent',
                color: yearly ? 'white' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >Yearly <span style={{ color: 'var(--green)', fontSize: '0.75rem' }}>-20%</span></button>
          </div>
        </div>

        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {plans.map((plan, i) => (
            <div key={i} style={{
              background: plan.popular ? 'linear-gradient(135deg, rgba(41,98,255,0.1), rgba(0,188,212,0.08))' : 'var(--bg-card)',
              border: plan.popular ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '36px 28px',
              position: 'relative',
              transition: 'all 0.25s ease',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 16px', borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-gradient)', fontSize: '0.75rem',
                  fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Sparkles size={12} /> Most Popular
                </div>
              )}

              <h3 style={{ fontSize: '1.3rem', marginBottom: 4 }}>{plan.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>{plan.desc}</p>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  {yearly ? plan.price.yearly : plan.price.monthly}
                </span>
                {plan.price.monthly !== '₹0' && (
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/mo</span>
                )}
              </div>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <Check size={16} style={{ color: 'var(--green)', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={plan.popular ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
