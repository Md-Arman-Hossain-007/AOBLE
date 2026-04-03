"use client";

import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import styles from "./KPICard.module.css";

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  trendData?: { value: number }[];
  color?: string;
  icon?: React.ReactNode;
  format?: "number" | "percent" | "currency" | "time";
  status?: "success" | "warning" | "danger" | "info";
  subtitle?: string;
}

export function KPICard({
  label,
  value,
  change,
  changeLabel = "vs last period",
  trend,
  trendData,
  color = "#6366f1",
  icon,
  format = "number",
  status,
  subtitle,
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;
    if (format === "percent") return `${val.toFixed(1)}%`;
    if (format === "currency") return `$${val.toLocaleString()}`;
    if (format === "time") return val.toFixed(1) + "h";
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
    if (val >= 1000) return (val / 1000).toFixed(1) + "K";
    return val.toLocaleString();
  };

  const trendDirection = trend || (change && change > 0 ? "up" : change && change < 0 ? "down" : "neutral");
  const TrendIcon = trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus;

  return (
    <div className={`${styles.card} ${status ? styles[status] : ""}`}>
      <div className={styles.header}>
        <div className={styles.labelRow}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.label}>{label}</span>
        </div>
        {status && (
          <span className={`${styles.statusBadge} ${styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`]}`}>
            {status}
          </span>
        )}
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>{formatValue(value)}</span>
        {trendData && trendData.length > 0 && (
          <div className={styles.sparkline}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className={styles.changeRow}>
          <span className={`${styles.change} ${styles[trendDirection]}`}>
            {trendDirection === "up" ? <ArrowUpRight size={14} /> : trendDirection === "down" ? <ArrowDownRight size={14} /> : <Minus size={14} />}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className={styles.changeLabel}>{changeLabel}</span>
        </div>
      )}

      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
