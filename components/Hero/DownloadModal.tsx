"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "./DownloadModal.module.css";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DownloadStatus = "idle" | "downloading" | "completed" | "error";

export default function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [progress, setProgress] = useState(0);

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

  const triggerBlobSave = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "MATCON_2026_Brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const startDownload = useCallback(async () => {
    setStatus("downloading");
    setProgress(0);
    try {
      const response = await fetch("/gallery/MATCON_2026-3.pdf");
      if (!response.ok) throw new Error("Network response was not ok");

      const contentLength = response.headers.get("content-length");
      if (!contentLength) {
        // Fallback if content-length is not present
        const blob = await response.blob();
        triggerBlobSave(blob);
        setStatus("completed");
        return;
      }

      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        // Fallback if streams are not supported
        const blob = await response.blob();
        triggerBlobSave(blob);
        setStatus("completed");
        return;
      }

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          setProgress(Math.min(99, Math.round((loaded / total) * 100)));
        }
      }

      const blob = new Blob(chunks as any, { type: "application/pdf" });
      triggerBlobSave(blob);
      setProgress(100);
      setStatus("completed");
    } catch (err) {
      console.error("Fetch download failed, falling back to direct anchor download", err);
      // Fallback: Direct download
      const link = document.createElement("a");
      link.href = "/gallery/MATCON_2026-3.pdf";
      link.download = "MATCON_2026_Brochure.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Artificial delay for success screen in fallback
      setProgress(100);
      setStatus("completed");
    }
  }, [triggerBlobSave]);

  // Automatically start download when modal is opened
  useEffect(() => {
    if (isOpen) {
      startDownload();
    } else {
      // Reset state on close
      setStatus("idle");
      setProgress(0);
    }
  }, [isOpen, startDownload]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={status === "completed" ? onClose : undefined}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        {status === "completed" && (
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        {/* Content States */}
        {status === "downloading" && (
          <div className={styles.body}>
            <div className={styles.spinnerWrapper}>
              <div className={styles.glowRing} />
              <div className={styles.spinner} />
              <span className={styles.progressText}>{progress}%</span>
            </div>
            <h3 className={styles.title}>Downloading Brochure</h3>
            <p className={styles.description}>
              Retrieving MATCON 2026 official brochure. Please hold on a moment...
            </p>
            <div className={styles.barContainer}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {status === "completed" && (
          <div className={styles.body}>
            <div className={styles.successIconWrapper}>
              <svg className={styles.successCheck} viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <div className={styles.successRing} />
            </div>
            <h3 className={styles.titleSuccess}>Download Complete</h3>
            <p className={styles.description}>
              The MATCON 2026 conference brochure has been successfully downloaded to your device.
            </p>
            <button className={styles.actionBtn} onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
