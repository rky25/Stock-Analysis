'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section style={{
      padding: '100px 0',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(41,98,255,0.12) 0%, transparent 70%)',
        top: '-20%', left: '-10%', borderRadius: '50%',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,188,212,0.1) 0%, transparent 70%)',
        bottom: '-20%', right: '-5%', borderRadius: '50%',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            background: 'rgba(41,98,255,0.08)', border: '1px solid rgba(41,98,255,0.15)',
            fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-light)',
            marginBottom: 24,
          }}>
            <Sparkles size={14} /> Join 500+ Indian Traders
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 16 }}>
            Ready to Trade{' '}
            <span className="text-gradient">Smarter?</span>
          </h2>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.7 }}>
            Stop guessing. Start analyzing with institutional-grade tools built for 
            the Indian stock market. Create your free account today.
          </p>

          <Link href="/signup" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
