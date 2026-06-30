"use client";

import React, { useState, useEffect } from "react";
import styles from "./GalleryModal.module.css";

const GALLERY_IMAGES = [
  "/gallery/IMG-20260701-WA0030.webp",
  "/gallery/IMG-20260701-WA0033.webp",
  "/gallery/IMG-20260701-WA0038.webp",
  "/gallery/IMG-20260701-WA0039.webp",
  "/gallery/IMG-20260701-WA0043.webp",
  "/gallery/IMG-20260701-WA00451.webp",
  "/gallery/IMG-20260701-WA0048.webp",
  "/gallery/IMG-20260701-WA0049.webp",
  "/gallery/IMG-20260701-WA0051.webp",
  "/gallery/IMG-20260701-WA0053.webp",
  "/gallery/IMG-20260701-WA00541.webp",
  "/gallery/IMG-20260701-WA0055.webp",
  "/gallery/IMG-20260701-WA0056.webp",
  "/gallery/IMG-20260701-WA0057.webp",
  "/gallery/IMG-20260701-WA0058.webp",
  "/gallery/IMG-20260701-WA0059.webp",
  "/gallery/IMG-20260701-WA0061.webp",
];

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryModal({ isOpen, onClose }: GalleryModalProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activeIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveIdx(null);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIdx]);

  if (!isOpen) return null;

  const handlePrev = () => {
    setActiveIdx((prev) => (prev !== null ? (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length : null));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev !== null ? (prev + 1) % GALLERY_IMAGES.length : null));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleWrapper}>
            <span className={styles.glitchTitle}>GALLERY</span>
            <span className={styles.subTitle}>PREVIOUS MATCON VISUALS</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close gallery">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Image Grid */}
        <div className={styles.gridContainer}>
          <div className={styles.imageGrid}>
            {GALLERY_IMAGES.map((imgSrc, idx) => (
              <div
                key={imgSrc}
                className={styles.gridItem}
                onClick={() => setActiveIdx(idx)}
              >
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={`MATCON 2026 Gallery Image ${idx + 1}`}
                    className={styles.gridImage}
                    loading="lazy"
                  />
                  <div className={styles.hoverOverlay}>
                    <span className={styles.viewLabel}>VIEW IMAGE</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox / Fullscreen View */}
        {activeIdx !== null && (
          <div className={styles.lightbox} onClick={() => setActiveIdx(null)}>
            <button
              className={styles.lightboxClose}
              onClick={() => setActiveIdx(null)}
              aria-label="Close preview"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <button
              className={`${styles.navBtn} ${styles.prevBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={GALLERY_IMAGES[activeIdx]}
                alt={`MATCON 2026 Gallery Image ${activeIdx + 1}`}
                className={styles.lightboxImage}
              />
              <span className={styles.counter}>
                {activeIdx + 1} / {GALLERY_IMAGES.length}
              </span>
            </div>

            <button
              className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
