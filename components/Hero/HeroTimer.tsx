"use client";

import React, { useEffect, useState } from "react";
import styles from "./HeroTimer.module.css";

const TARGET = new Date(2026, 11, 15, 0, 0, 0); // Dec 15, 2026 (Month is 11 for Dec in JS Date)

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

export default function HeroTimer() {
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

  const displayTime = mounted ? time : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <div
      className={styles.timerContainer}
      aria-label="Conference countdown timer"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      <div className={styles.header}>
        <span className={styles.pulseDot} />
        <span className={styles.tMinus}>T-MINUS TO CONFERENCE</span>
      </div>

      <div className={styles.timeGroup}>
        <div className={styles.unit}>
          <span className={styles.value} suppressHydrationWarning>{pad(displayTime.days)}</span>
          <span className={styles.label}>Days</span>
        </div>
        
        <span className={styles.separator}>:</span>

        <div className={styles.unit}>
          <span className={styles.value} suppressHydrationWarning>{pad(displayTime.hours)}</span>
          <span className={styles.label}>Hours</span>
        </div>

        <span className={styles.separator}>:</span>

        <div className={styles.unit}>
          <span className={styles.value} suppressHydrationWarning>{pad(displayTime.minutes)}</span>
          <span className={styles.label}>Mins</span>
        </div>

        <span className={styles.separator}>:</span>

        <div className={styles.unit}>
          <span className={styles.value} suppressHydrationWarning>{pad(displayTime.seconds)}</span>
          <span className={styles.label}>Secs</span>
        </div>
      </div>
    </div>
  );
}
