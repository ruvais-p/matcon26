"use client";

import React, { useState } from "react";
import styles from "./Hero.module.css";
import Link from "next/link";
import Ballpit from "../Ballpit";
import HeroTimer from "./HeroTimer";
import DownloadModal from "./DownloadModal";

export default function Hero() {
  const [showBallpit, setShowBallpit] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 425px)");
    
    // Initial check
    const mobile = mql.matches;
    setIsMobile(mobile);
    setShowBallpit(!mobile);

    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      setShowBallpit(!e.matches);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <section className={styles.hero} aria-label="MATCON 2026 Hero Section">
      {/* Ballpit Background — hidden on mobile */}
      {!isMobile && (
        <div className={styles.backgroundContainer}>
          <Ballpit
            count={125}
            gravity={0.1}
            friction={0.9975}
            wallBounce={0.95}
            followCursor={false}
          />
        </div>
      )}

      {/* Video Background — shown only on mobile (≤425px) via CSS */}
      <div className={styles.videoContainer}>
        <video
          className={styles.bgVideo}
          src="/hero/ballpits_hero_video.mp4"
          autoPlay
          loop
          muted
          playsInline
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

        <p className={styles.dates}>15 to 17 December 2026</p>
        <p className={styles.venue}>Venue: Seminar Complex, CUSAT</p>

        <HeroTimer />
        
        <div className={styles.actions}>
          <Link
            href="/register"
            className={styles.btn}
          >
            Register
          </Link>
          <a
            href="/template/MATCON Abstract.docx"
            download="MATCON Abstract.docx"
            className={styles.btn}
            style={{ cursor: "pointer" }}
          >
            Abstract template
          </a>
          <button
            onClick={() => setShowDownloadModal(true)}
            className={styles.btnSecondary}
            style={{ cursor: "pointer" }}
          >
            Download Brochure
          </button>
        </div>
      </div>

      {/* Decorative Bottom Transition */}
      <div className={styles.bottomTransition}>
        <div className={styles.divider}></div>
      </div>

      {/* Themed Download Progress Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </section>
  );
}
