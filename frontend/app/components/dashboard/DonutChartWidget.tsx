"use client";

import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import styles from "./ChartWidgets.module.css";

interface DonutChartWidgetProps {
  title: string;
  subtitle?: string;
  data: { name: string; value: number; color?: string }[];
  centerLabel?: string;
  centerValue?: string | number;
  centerSubtext?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showPercentage?: boolean;
  icon?: React.ReactNode;
}

const defaultColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export function DonutChartWidget({
  title,
  subtitle,
  data,
  centerLabel,
  centerValue,
  centerSubtext,
  height = 280,
  innerRadius = 70,
  outerRadius = 110,
  showLegend = true,
  showTooltip = true,
  showPercentage = true,
  icon,
}: DonutChartWidgetProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{item.name}</p>
          <p className={styles.tooltipValue}>
            {item.value.toLocaleString()} <span>({percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
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
      </div>

      <div className={styles.donutContainer} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || defaultColors[index % defaultColors.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                  style={{
                    filter: activeIndex === index ? "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))" : "none",
                    transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Content */}
        <div className={styles.donutCenter}>
          {centerValue !== undefined && (
            <span className={styles.centerValue}>{centerValue}</span>
          )}
          {centerLabel && <span className={styles.centerLabel}>{centerLabel}</span>}
          {centerSubtext && <span className={styles.centerSubtext}>{centerSubtext}</span>}
        </div>
      </div>

      {showLegend && (
        <div className={styles.donutLegend}>
          {data.map((entry, index) => {
            const percentage = ((entry.value / total) * 100).toFixed(1);
            return (
              <div key={index} className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: entry.color || defaultColors[index % defaultColors.length] }} />
                <span className={styles.legendLabel}>{entry.name}</span>
                {showPercentage && <span className={styles.legendValue}>{percentage}%</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
