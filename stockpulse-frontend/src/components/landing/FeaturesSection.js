'use client';

import { motion } from 'framer-motion';
import {
  Activity, BarChart3, Brain, Target, LineChart, Search
} from 'lucide-react';
import styles from './FeaturesSection.module.css';

const features = [
  {
    icon: <Activity size={24} />,
    title: 'Real-Time Signals',
    desc: 'AI-powered BUY/SELL signals with 85%+ confidence scoring. Get instant entry, stop-loss, and target levels for every trade.',
  },
  {
    icon: <LineChart size={24} />,
    title: 'Live Candlestick Charts',
    desc: 'TradingView-powered interactive charts with 1-minute to monthly timeframes. Draw, annotate, and analyze price action.',
  },
  {
    icon: <Brain size={24} />,
    title: 'AI Trading Advisor',
    desc: 'Ask questions, get context-aware analysis powered by Llama 3.1 70B. Your personal institutional-grade research assistant.',
  },
  {
    icon: <Target size={24} />,
    title: 'Smart Backtesting',
    desc: 'Validate your strategies on historical data before risking real capital. Test across multiple stocks and timeframes.',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Technical Gauges',
    desc: 'TradingView-style oscillator and moving average gauges showing Strong Buy to Strong Sell verdicts at a glance.',
  },
  {
    icon: <Search size={24} />,
    title: 'Multi-Stock Scanner',
    desc: 'Scan NIFTY 50 and sector stocks for breakout opportunities. Momentum, volume, and volatility strategies built-in.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className={styles.features}>
      <div className="container">
        <div className="section-header">
          <h2>
            Everything You Need to{' '}
            <span className="text-gradient">Trade Smarter</span>
          </h2>
          <p>
            Institutional-grade tools built for Indian markets. From signal generation 
            to AI-powered analysis — all in one platform.
          </p>
        </div>

        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {features.map((f, i) => (
            <motion.div key={i} className={styles.featureCard} variants={itemVariants}>
              <div className={styles.iconWrap}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
