"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from "recharts";
import styles from "./ChartWidgets.module.css";

interface BarChartWidgetProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  layout?: "horizontal" | "vertical";
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  threshold?: number;
  thresholdLabel?: string;
  icon?: React.ReactNode;
}

const defaultColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export function BarChartWidget({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey,
  layout = "horizontal",
  colors = defaultColors,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showValues = true,
  valueFormatter,
  threshold,
  thresholdLabel,
  icon,
}: BarChartWidgetProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <p className={styles.tooltipValue}>
            {valueFormatter ? valueFormatter(value) : value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (value: number, index: number) => {
    if (threshold && value >= threshold) return "#ef4444";
    if (threshold && value >= threshold * 0.8) return "#f59e0b";
    return colors[index % colors.length];
  };

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
        {thresholdLabel && (
          <div className={styles.thresholdBadge}>
            <span className={styles.thresholdDot} />
            {thresholdLabel}
          </div>
        )}
      </div>

      <div className={styles.chartContainer} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={layout}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={layout === "vertical"}
                horizontal={layout === "horizontal"}
                stroke="var(--border)"
                opacity={0.5}
              />
            )}
            {layout === "horizontal" ? (
              <>
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
              </>
            ) : (
              <>
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--secondary)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  type="category"
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--secondary)", fontSize: 12 }}
                  width={100}
                />
              </>
            )}
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {threshold && (
              <ReferenceLine
                x={threshold}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: "Threshold", position: "top", fill: "#ef4444", fontSize: 11 }}
              />
            )}
            <Bar
              dataKey={dataKey}
              radius={layout === "horizontal" ? [0, 6, 6, 0] : [6, 6, 0, 0]}
              maxBarSize={50}
              label={showValues ? {
                position: layout === "horizontal" ? "right" : "top",
                fill: "#64748b",
                fontSize: 11,
              } : false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry[dataKey], index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
