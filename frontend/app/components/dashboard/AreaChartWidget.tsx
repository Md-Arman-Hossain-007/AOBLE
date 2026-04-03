"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import styles from "./ChartWidgets.module.css";

interface AreaChartWidgetProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string | string[];
  xAxisKey: string;
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  gradient?: boolean;
  comparisonData?: any[];
  comparisonKey?: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
  icon?: React.ReactNode;
}

const defaultColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function AreaChartWidget({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey,
  colors = defaultColors,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  gradient = true,
  comparisonData,
  comparisonKey,
  period,
  onPeriodChange,
  icon,
}: AreaChartWidgetProps) {
  const periods = ["24h", "7d", "30d", "90d", "1y"];
  const keys = Array.isArray(dataKey) ? dataKey : [dataKey];

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <div className={styles.titleSection}>
          {icon && <span className={styles.widgetIcon}>{icon}</span>}
          <div>
            <h3 className={styles.widgetTitle}>{title}</h3>
            {subtitle && <p className={styles.widgetSubtitle}>{subtitle}</p>}
          </div>
        </div>
        {onPeriodChange && (
          <div className={styles.periodSelector}>
            {periods.map((p) => (
              <button
                key={p}
                className={`${styles.periodBtn} ${period === p ? styles.active : ""}`}
                onClick={() => onPeriodChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.chartContainer} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {keys.map((key, index) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                </linearGradient>
              ))}
              {comparisonKey && (
                <linearGradient id="gradient-comparison" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            )}
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--secondary)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--secondary)", fontSize: 12 }}
              dx={-10}
            />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ color: "var(--foreground)" }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              />
            )}
            {showLegend && (
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                iconSize={8}
              />
            )}
            {comparisonData && comparisonKey && (
              <Area
                type="monotone"
                dataKey={comparisonKey}
                stroke="#94a3b8"
                fill="url(#gradient-comparison)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
            {keys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={gradient ? `url(#gradient-${key})` : colors[index % colors.length]}
                fillOpacity={gradient ? 1 : 0.1}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, fill: "var(--surface)" }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
