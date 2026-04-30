'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, Shield, Zap, TrendingUp } from 'lucide-react';
import styles from './HeroSection.module.css';

const words = ['AI-Powered Signals', 'Real-Time Charts', 'Technical Analysis', 'Smart Trading'];

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 40);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex]);

  const barHeights = [30, 55, 40, 70, 50, 85, 60, 75, 90, 65, 80, 55, 70, 45, 60];

  return (
    <section className={styles.hero}>
      <div className={styles.heroBg}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className="container">
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className={styles.heroBadge}>
            <span className={styles.liveDot} />
            Live Market Data • NSE & BSE
          </div>

          <h1 className={styles.heroTitle}>
            Track. Analyze.{' '}
            <br />
            <span className="text-gradient">{displayed}</span>
            <span style={{ opacity: 0.4 }}>|</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Professional-grade stock analysis for Indian markets. Real-time signals, 
            TradingView-style technical gauges, and AI-powered insights — all in one 
            beautiful terminal.
          </p>

          <div className={styles.heroCTAs}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Free <TrendingUp size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Explore Features
            </a>
          </div>

          <div className={styles.trustRow}>
            <span className={styles.trustItem}>
              <BarChart3 size={16} className={styles.trustIcon} />
              50+ NSE Stocks
            </span>
            <span className={styles.trustItem}>
              <Zap size={16} className={styles.trustIcon} />
              3-Sec Updates
            </span>
            <span className={styles.trustItem}>
              <Shield size={16} className={styles.trustIcon} />
              85%+ Confidence
            </span>
          </div>

          <motion.div
            className={styles.heroPreview}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          >
            <div className={styles.previewFrame}>
              <div className={styles.previewBar}>
                <div className={styles.previewDot} style={{ background: '#FF5F57' }} />
                <div className={styles.previewDot} style={{ background: '#FEBC2E' }} />
                <div className={styles.previewDot} style={{ background: '#28C840' }} />
                <span style={{ marginLeft: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  StockPulse Terminal — RELIANCE.NS
                </span>
              </div>
              <div className={styles.previewContent}>
                <div className={styles.miniCard}>
                  <div className={styles.miniCardLabel}>RELIANCE</div>
                  <div className={styles.miniCardValue}>₹1,430.80</div>
                  <div className={`${styles.miniCardChange} ${styles.changeUp}`}>+0.38%</div>
                  <div className={styles.miniChart}>
                    {barHeights.map((h, i) => (
                      <div key={i} className={styles.miniBar} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className={styles.miniCard}>
                  <div className={styles.miniCardLabel}>TCS</div>
                  <div className={styles.miniCardValue}>₹3,842.15</div>
                  <div className={`${styles.miniCardChange} ${styles.changeUp}`}>+1.24%</div>
                  <div className={styles.miniChart}>
                    {barHeights.slice().reverse().map((h, i) => (
                      <div key={i} className={styles.miniBar} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className={styles.miniCard}>
                  <div className={styles.miniCardLabel}>INFY</div>
                  <div className={styles.miniCardValue}>₹1,567.90</div>
                  <div className={`${styles.miniCardChange} ${styles.changeDown}`}>-0.52%</div>
                  <div className={styles.miniChart}>
                    {barHeights.map((h, i) => (
                      <div key={i} className={styles.miniBar} style={{ height: `${(h + i * 3) % 100}%`, background: 'rgba(255,23,68,0.3)' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
