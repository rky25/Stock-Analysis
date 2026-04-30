'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Markets', href: '#markets' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Activity size={20} color="white" />
            </div>
            Stock<span className={styles.logoAccent}>Pulse</span>
          </Link>

          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={styles.navLink}>
                {item.label}
              </a>
            ))}
          </div>

          <div className={styles.navActions}>
            <Link href="/signin" className={styles.signInBtn}>
              Log In
            </Link>
            <Link href="/signup" className={styles.getStartedBtn}>
              Get Started
            </Link>
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}>
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={styles.navLink}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <Link href="/signin" className={styles.navLink} onClick={() => setMobileOpen(false)}>
          Log In
        </Link>
        <Link href="/signup" className={styles.getStartedBtn} onClick={() => setMobileOpen(false)}>
          Get Started Free
        </Link>
      </div>
    </>
  );
}
