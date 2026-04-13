"use client";

import React from "react";
import styles from "./Hero.module.css";
import Ballpit from "../Ballpit";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="MATCON 2026 Hero Section">
      {/* Ballpit Background */}
      <div className={styles.backgroundContainer}>
        <Ballpit
          count={100}
          gravity={0.1}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={false}
        />
      </div>

      {/* Centered Content Overlay */}
      <div className={styles.content}>
        <p className={styles.tagline}>
          International Conference on Materials for a Sustainable Future
        </p>

        <h1 className={styles.title}>
          MATCON
          <br />
          2026
        </h1>

        <p className={styles.dates}>15, 16, 17 December 2026</p>

        <a href="#" className={styles.btn}>
          Download Brochure
        </a>
      </div>

      {/* Decorative Bottom Transition */}
      <div className={styles.bottomTransition}>
        <div className={styles.divider}></div>
      </div>
    </section>
  );
}
