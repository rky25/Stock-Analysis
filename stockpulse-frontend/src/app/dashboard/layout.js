'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, LayoutDashboard, Search, BarChart3,
  Briefcase, Star, Settings, Menu, X, User
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
    { href: '/dashboard/stock/RELIANCE.NS', icon: <BarChart3 size={18} />, label: 'Terminal' },
    { href: '/dashboard', icon: <Star size={18} />, label: 'Watchlist' },
    { href: '/dashboard', icon: <Briefcase size={18} />, label: 'Portfolio' },
    { href: '/dashboard', icon: <Settings size={18} />, label: 'Settings' },
  ];

  const isMarketOpen = () => {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    const day = now.getDay();
    return day >= 1 && day <= 5 && ((h === 9 && m >= 15) || (h > 9 && h < 15) || (h === 15 && m <= 30));
  };

  return (
    <div className={styles.dashboard}>
      {/* Mobile overlay */}
      <div
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.show : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Link href="/" className={styles.sidebarLogo}>
          <div className={styles.sidebarLogoIcon}>
            <Activity size={18} color="white" />
          </div>
          Stock<span className="text-gradient">Pulse</span>
        </Link>

        <nav className={styles.sidebarNav}>
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${styles.sidebarLink} ${pathname === link.href ? styles.sidebarLinkActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarUser}>
            <div className={styles.userAvatar}>R</div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Rajesh</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Free Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <div className={styles.topbar}>
          <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className={styles.searchBox}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input placeholder="Search stocks... (e.g. RELIANCE, TCS)" />
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.marketStatus}>
              <div className={`${styles.statusDot} ${isMarketOpen() ? styles.statusOpen : styles.statusClosed}`} />
              {isMarketOpen() ? 'Market Open' : 'Market Closed'}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
