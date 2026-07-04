"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "Home",    href: "/" },
  { label: "About",   href: "/about" },
  { label: "Gallery", href: "/gallery" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Only show the transparent-at-top behaviour on the homepage
  const isHome = pathname === "/";

  useEffect(() => {
    const threshold = isHome ? window.innerHeight * 0.1 : 1;

    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll(); // set initial state
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const glassy = scrolled || !isHome;

  return (
    <header className={`${styles.header} ${glassy ? styles.glassy : styles.transparent}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          MAT<span>CON</span> <em>2026</em>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]) && href.split("#")[0] !== "/";
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {label}
              </Link>
            );
          })}
          <Link href="/register" className={styles.ctaBtn}>
            Register Now
          </Link>
        </nav>

        {/* Mobile burger */}
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`} aria-hidden={!menuOpen}>
        <nav className={styles.drawerNav}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={styles.drawerLink}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link href="/register" className={styles.drawerCta} onClick={() => setMenuOpen(false)}>
            Register Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
