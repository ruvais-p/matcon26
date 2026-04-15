"use client";

import { useEffect, useState } from "react";
import styles from "./Countdown.module.css";

// Set date parts individually for maximum cross-browser compatibility
const TARGET = new Date(2026, 11, 15, 0, 0, 0); // Dec 15, 2026 (Month is 0-indexed)

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    // Initial calculation
    setTime(getTimeLeft());

    const id = setInterval(() => {
      setTime(getTimeLeft());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  // Use all zeros for the server-side and initial client-side render
  const displayTime = mounted ? time : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <section className={styles.countdown} aria-label="Conference Countdown">
      <div className={styles.inner} style={{ opacity: mounted ? 1 : 0.7, transition: 'opacity 0.6s ease' }}>
        
        <span className={styles.label}>
          // T_MINUS &mdash; CONFERENCE OPENS
        </span>

        <div className={styles.tagline}>
          <h2>
            BE PART OF THE <span>FUTURE</span>
          </h2>
          <p>
            Join world-leading researchers, scientists, and industrialists at
            MATCON&nbsp;2026 — an international forum shaping the next chapter
            of materials science.
          </p>
        </div>

        <div
          className={styles.timer}
          aria-live="polite"
          aria-label="Countdown timer"
        >
          <div className={styles.unit}>
            <span className={styles.value} suppressHydrationWarning>{pad(displayTime.days)}</span>
            <span className={styles.unitLabel}>Days</span>
          </div>

          <span className={styles.sep}>:</span>

          <div className={styles.unit}>
            <span className={styles.value} suppressHydrationWarning>{pad(displayTime.hours)}</span>
            <span className={styles.unitLabel}>Hours</span>
          </div>

          <span className={styles.sep}>:</span>

          <div className={styles.unit}>
            <span className={styles.value} suppressHydrationWarning>{pad(displayTime.minutes)}</span>
            <span className={styles.unitLabel}>Minutes</span>
          </div>

          <span className={styles.sep}>:</span>

          <div className={styles.unit}>
            <span className={styles.value} suppressHydrationWarning>{pad(displayTime.seconds)}</span>
            <span className={styles.unitLabel}>Seconds</span>
          </div>
        </div>

        <div className={styles.cta}>
          <a href="#" className={styles.applyBtn} id="apply-now-btn">
            Apply Now
          </a>
          <span className={styles.deadline}>
            15 • 16 • 17 December 2026 — CUSAT, Kochi
          </span>
        </div>

      </div>
    </section>
  );
}