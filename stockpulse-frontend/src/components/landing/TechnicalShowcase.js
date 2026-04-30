'use client';

import { motion } from 'framer-motion';
import styles from './TechnicalShowcase.module.css';

function GaugeSVG({ value, size = 180 }) {
  // value: 0 (Strong Sell) to 100 (Strong Buy), 50 = Neutral
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size / 2 - 16;
  const startAngle = Math.PI;
  const endAngle = 0;
  const needleAngle = startAngle - (value / 100) * Math.PI;

  const arcPath = (startA, endA) => {
    const x1 = cx + r * Math.cos(startA);
    const y1 = cy - r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA);
    const y2 = cy - r * Math.sin(endA);
    const large = endA - startA > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`;
  };

  // 5 zones: Strong Sell, Sell, Neutral, Buy, Strong Buy
  const zones = [
    { start: Math.PI, end: Math.PI * 0.8, color: '#FF1744' },
    { start: Math.PI * 0.8, end: Math.PI * 0.6, color: '#FF5252' },
    { start: Math.PI * 0.6, end: Math.PI * 0.4, color: '#9E9E9E' },
    { start: Math.PI * 0.4, end: Math.PI * 0.2, color: '#448AFF' },
    { start: Math.PI * 0.2, end: 0.01, color: '#2962FF' },
  ];

  const needleLen = r - 20;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  return (
    <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`} className={styles.gaugeSvg}>
      {zones.map((z, i) => (
        <path
          key={i}
          d={arcPath(z.start, z.end)}
          fill="none"
          stroke={z.color}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill="white" />
      {/* Zone labels */}
      <text x={12} y={cy - 10} fill="#9E9E9E" fontSize="8" fontFamily="Inter">Strong sell</text>
      <text x={20} y={20} fill="#9E9E9E" fontSize="8" fontFamily="Inter">Sell</text>
      <text x={cx - 12} y={10} fill="#9E9E9E" fontSize="8" fontFamily="Inter">Neutral</text>
      <text x={size - 42} y={20} fill="#9E9E9E" fontSize="8" fontFamily="Inter">Buy</text>
      <text x={size - 68} y={cy - 10} fill="#9E9E9E" fontSize="8" fontFamily="Inter">Strong buy</text>
    </svg>
  );
}

const gauges = [
  {
    title: 'Oscillators',
    value: 72,
    verdict: 'Buy',
    verdictClass: 'verdictBuy',
    sell: 1, neutral: 7, buy: 3,
  },
  {
    title: 'Summary',
    value: 75,
    verdict: 'Buy',
    verdictClass: 'verdictBuy',
    sell: 3, neutral: 8, buy: 15,
  },
  {
    title: 'Moving Averages',
    value: 90,
    verdict: 'Strong Buy',
    verdictClass: 'verdictStrongBuy',
    sell: 2, neutral: 1, buy: 12,
  },
];

export default function TechnicalShowcase() {
  return (
    <section className={styles.showcase}>
      <div className="container">
        <div className="section-header">
          <h2>
            TradingView-Style{' '}
            <span className="text-gradient">Technical Analysis</span>
          </h2>
          <p>
            See at a glance whether to buy, sell, or hold. Our gauges aggregate 
            oscillators and moving averages into clear, actionable verdicts.
          </p>
        </div>

        <motion.div
          className={styles.gaugeRow}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          {gauges.map((g, i) => (
            <div key={i} className={styles.gaugeCard}>
              <div className={styles.gaugeTitle}>{g.title}</div>
              <GaugeSVG value={g.value} />
              <div className={`${styles.gaugeVerdict} ${styles[g.verdictClass]}`}>
                {g.verdict}
              </div>
              <div className={styles.gaugeCounts}>
                <div className={styles.countItem}>
                  <div className={styles.countLabel}>Sell</div>
                  <div className={`${styles.countValue} ${styles.countSell}`}>{g.sell}</div>
                </div>
                <div className={styles.countItem}>
                  <div className={styles.countLabel}>Neutral</div>
                  <div className={`${styles.countValue} ${styles.countNeutral}`}>{g.neutral}</div>
                </div>
                <div className={styles.countItem}>
                  <div className={styles.countLabel}>Buy</div>
                  <div className={`${styles.countValue} ${styles.countBuy}`}>{g.buy}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
