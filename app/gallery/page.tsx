"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./gallery.module.css";

const GALLERY_IMAGES = [
  { src: "/gallery/1.webp",  label: "MATCON Highlights" },
  { src: "/gallery/2.webp",  label: "Research Presentations" },
  { src: "/gallery/3.webp",  label: "Conference Session" },
  { src: "/gallery/4.webp",  label: "Keynote Address" },
  { src: "/gallery/5.webp",  label: "Award Ceremony" },
  { src: "/gallery/6.webp",  label: "Networking" },
  { src: "/gallery/7.webp",  label: "Poster Session" },
  { src: "/gallery/9.webp",  label: "Workshop" },
  { src: "/gallery/10.webp", label: "Panel Discussion" },
  { src: "/gallery/11.webp", label: "Lab Tour" },
  { src: "/gallery/12.webp", label: "Cultural Evening" },
  { src: "/gallery/13.webp", label: "Inauguration" },
  { src: "/gallery/14.webp", label: "Valedictory" },
  { src: "/gallery/15.webp", label: "Group Photo" },
  { src: "/gallery/16.webp", label: "Exhibition" },
  { src: "/gallery/17.webp", label: "Seminar" },
  { src: "/gallery/18.webp", label: "Special Session" },
];

export default function GalleryPage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) =>
      prev !== null ? (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length : null
    );
  }, []);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) =>
      prev !== null ? (prev + 1) % GALLERY_IMAGES.length : null
    );
  }, []);

  useEffect(() => {
    if (activeIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIdx(null);
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIdx, handleNext, handlePrev]);

  useEffect(() => {
    document.body.style.overflow = activeIdx !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeIdx]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* ── Title Block ── */}
        <div className={styles.titleBlock}>
          <div className={styles.ghostTitle}>GALLERY</div>
          <h1 className={styles.pageTitle}>Photo Gallery</h1>
          <p className={styles.pageSubtitle}>
            Visual highlights from previous MATCON editions
          </p>
          <div className={styles.titleDecoration}>
            <span className={styles.decorLine} />
            <span className={styles.decorDot} />
            <span className={styles.decorLine} />
          </div>
          <p className={styles.imageCount}>
            <span className={styles.accentNum}>{GALLERY_IMAGES.length}</span> images · Click any photo to enlarge
          </p>
        </div>

        {/* ── Masonry Grid ── */}
        <div className={styles.grid}>
          {GALLERY_IMAGES.map((img, idx) => (
            <div
              key={img.src}
              className={styles.gridItem}
              onClick={() => setActiveIdx(idx)}
              role="button"
              tabIndex={0}
              aria-label={`View ${img.label}`}
              onKeyDown={(e) => e.key === "Enter" && setActiveIdx(idx)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.label}
                className={styles.gridImage}
                loading="lazy"
              />
              <div className={styles.overlay}>
                <span className={styles.overlayLabel}>{img.label}</span>
                <ZoomIcon />
              </div>
              <span className={styles.idxBadge}>{String(idx + 1).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
      </main>

      {/* ── Lightbox ── */}
      {activeIdx !== null && (
        <div
          className={styles.lightbox}
          onClick={() => setActiveIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close */}
          <button
            className={styles.lightboxClose}
            onClick={() => setActiveIdx(null)}
            aria-label="Close"
          >
            <CloseIcon />
          </button>

          {/* Counter */}
          <div className={styles.lightboxCounter}>
            {activeIdx + 1} <span>/</span> {GALLERY_IMAGES.length}
          </div>

          {/* Prev */}
          <button
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            aria-label="Previous image"
          >
            <ChevronLeftIcon />
          </button>

          {/* Image */}
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GALLERY_IMAGES[activeIdx].src}
              alt={GALLERY_IMAGES[activeIdx].label}
              className={styles.lightboxImage}
            />
            <p className={styles.lightboxCaption}>{GALLERY_IMAGES[activeIdx].label}</p>
          </div>

          {/* Next */}
          <button
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            aria-label="Next image"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}

    </div>
  );
}

// ── Icons ──
const ZoomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
