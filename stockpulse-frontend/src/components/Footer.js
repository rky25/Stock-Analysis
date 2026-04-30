import Link from 'next/link';
import { Activity, Globe, Mail, ExternalLink, Play } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Activity size={18} color="white" />
              </div>
              Stock<span className={styles.logoAccent}>Pulse</span>
            </Link>
            <p>
              Professional-grade stock analysis with AI-powered signals, real-time charts, and institutional tools for Indian markets.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Website"><Globe size={16} /></a>
              <a href="#" className={styles.socialLink} aria-label="Email"><Mail size={16} /></a>
              <a href="#" className={styles.socialLink} aria-label="Links"><ExternalLink size={16} /></a>
              <a href="#" className={styles.socialLink} aria-label="YouTube"><Play size={16} /></a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#markets">Markets</a></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Disclaimer</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} StockPulse. All rights reserved.</p>
          <div className={styles.footerBottomLinks}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
