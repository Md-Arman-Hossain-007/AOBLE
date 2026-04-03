"use client";

import styles from "./ChartWidgets.module.css";
import "./ProgressRing.css";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 160,
  strokeWidth = 12,
  label,
  sublabel,
  color = "#6366f1",
  bgColor = "var(--border)",
  showValue = true,
  formatValue,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const displayValue = formatValue ? formatValue(value) : `${value}${max !== 100 ? `/${max}` : ""}`;

  // Determine color based on percentage thresholds
  const getColor = () => {
    if (color !== "#6366f1") return color;
    if (percentage >= 90) return "#10b981";
    if (percentage >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const ringColor = getColor();

  return (
    <div className={styles.progressRingContainer}>
      <svg width={size} height={size} className="progress-ring">
        {/* Background circle */}
        <circle
          className="progress-ring-bg"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="progress-ring-progress"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showValue && (
        <div className={styles.progressRingValue}>
          <span className="progress-ring-value" style={{ color: ringColor }}>
            {displayValue}
          </span>
          {label && <span className={styles.progressRingLabel}>{label}</span>}
          {sublabel && <span className={styles.centerSubtext}>{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
