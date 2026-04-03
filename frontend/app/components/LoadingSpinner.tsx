"use client";

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
  const spinnerContent = (
    <div className={`${styles.spinnerContainer} ${styles[size]}`}>
      <div className={styles.logoWrapper}>
        <Image 
          src="/logo_brand_v1.png" 
          alt="AMLTAB Logo" 
          width={size === "small" ? 40 : size === "large" ? 80 : 64}
          height={size === "small" ? 40 : size === "large" ? 80 : 64}
          className={`${styles.logo} pulsate`}
          priority
        />
      </div>
      {text && <p className={styles.text}>{text}</p>}
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
          src="/logo_brand_v1.png" 
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
