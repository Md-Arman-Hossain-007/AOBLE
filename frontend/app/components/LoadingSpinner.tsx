"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ 
  size = "medium", 
  text,
  fullPage = false 
}: LoadingSpinnerProps) {
  const statuses = [
    "Synthesizing Dossier",
    "Scanning Watchlists",
    "Neural Fraud Scoring",
    "Biometric Verification",
    "Jurisdictional Logic Sync",
    "Generating Audit Trail"
  ];

  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    if (!text) {
      const interval = setInterval(() => {
        setStatusIdx((prev) => (prev + 1) % statuses.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [text, statuses.length]);

  const spinnerContent = (
    <div className={`${styles.spinnerContainer} ${styles[size]}`}>
      <div className={styles.logoWrapper}>
        <Image 
          src="/logo_transparent.png" 
          alt="AMLTAB Logo" 
          width={size === "small" ? 24 : size === "large" ? 96 : 72}
          height={size === "small" ? 24 : size === "large" ? 96 : 72}
          className={styles.logo}
          priority
        />
      </div>
      {(size !== "small") && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p className={styles.text}>{text || "AMLTAB SECURE RETRIEVAL"}</p>
          {!text && <p className={styles.statusSub}>{statuses[statusIdx]}...</p>}
        </div>
      )}
      {size === "small" && (
        <p className={styles.smallText}>{text || "Searching..."}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export function ErrorState({ 
  message = "Something went wrong", 
  onRetry,
  fullPage = false 
}: ErrorStateProps) {
  return (
    <div className={`${styles.errorContainer} ${fullPage ? styles.fullPage : ""}`}>
      <div className={styles.logoWrapper}>
        <Image 
          src="/logo_transparent.png" 
          alt="AMLTAB Logo" 
          width={64}
          height={64}
          className={styles.logo}
        />
      </div>
      <div className={styles.errorContent}>
        <h3 className={styles.errorTitle}>Error</h3>
        <p className={styles.errorMessage}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className={styles.retryButton}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
