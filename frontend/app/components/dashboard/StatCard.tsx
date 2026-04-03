"use client";

import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./StatCard.module.css";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  color?: string;
  href?: string;
  description?: string;
}

export function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  color = "#6366f1",
  href,
  description,
}: StatCardProps) {
  const trendDirection = trend || (change && change > 0 ? "up" : change && change < 0 ? "down" : "neutral");
  const TrendIcon = trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus;

  const content = (
    <>
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`${styles.trend} ${styles[trendDirection]}`}>
            <TrendIcon size={12} />
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {href && (
        <div className={styles.footer}>
          <span className={styles.viewMore}>
            View details
            <ArrowRight size={12} />
          </span>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.card}>
        {content}
      </Link>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
