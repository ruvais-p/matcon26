"use client";

import React from "react";
import styles from "./SponsorBanner.module.css";

interface SponsorBannerProps {
  className?: string;
  variant?: "hero" | "compact" | "standalone";
}

export default function SponsorBanner({ className = "", variant = "hero" }: SponsorBannerProps) {
  return (
    <div className={`${styles.banner} ${styles[variant]} ${className}`} aria-label="Best Poster and Oral Prize Sponsors">
      <div className={styles.inner}>
        <div className={styles.badgeGroup}>
          <span className={styles.awardIcon}></span>
          <span className={styles.bannerText}>
            For Best Poster and Oral Prizes are sponsored  by :
          </span>
        </div>

        <div className={styles.logosGroup}>
          <div className={styles.logoCard} title="American Chemical Society (ACS)">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/acs_logo.jpg"
              alt="American Chemical Society"
              className={styles.logoImg}
            />
          </div>
          <span className={styles.connector}>&amp;</span>
          <div className={styles.logoCard} title="Royal Society of Chemistry (RSC)">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/rsc_logo.jpg"
              alt="Royal Society of Chemistry"
              className={styles.logoImg}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
