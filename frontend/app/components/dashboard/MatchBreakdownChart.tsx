'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';

interface MatchBreakdownData {
  label: string;
  value: number;
  color?: string; // Optional: custom color per category
}

interface MatchBreakdownChartProps {
  data: MatchBreakdownData[];
  height?: number;
  colors?: Record<string, string>; // Category-specific colors
}

interface TooltipState {
  visible: boolean;
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
}

// Default color scheme for different match types
const DEFAULT_COLORS: Record<string, string> = {
  'PEP': '#6366f1',        // Indigo
  'Sanctions': '#f43f5e',  // Rose/Red
  'Others': '#f59e0b',     // Amber/Orange
  'Clear': '#10b981',      // Emerald/Green
};

const MatchBreakdownChart: React.FC<MatchBreakdownChartProps> = ({
  data = [],
  height = 280,
  colors = DEFAULT_COLORS
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    label: '',
    value: 0,
    color: '',
    x: 0,
    y: 0
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => d.value), 1);
  }, [data]);

  // Calculate nice round max for axis
  const axisMax = useMemo(() => {
    if (maxValue <= 0) return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const normalized = maxValue / magnitude;
    
    let niceMax;
    if (normalized <= 1) niceMax = 1;
    else if (normalized <= 2) niceMax = 2;
    else if (normalized <= 5) niceMax = 5;
    else niceMax = 10;
    
    return niceMax * magnitude;
  }, [maxValue]);

  // Generate axis ticks
  const ticks = useMemo(() => {
    const tickCount = 5;
    const step = axisMax / tickCount;
    return Array.from({ length: tickCount + 1 }, (_, i) => Math.round(i * step));
  }, [axisMax]);

  const chartHeight = height - 60; // Leave room for labels and axis
  const barHeight = Math.min(32, (chartHeight / data.length) * 0.6);
  const barGap = (chartHeight - barHeight * data.length) / (data.length + 1);

  // Get color for a specific category
  const getBarColor = (label: string, customColor?: string): string => {
    if (customColor) return customColor;
    return colors[label] || colors['Others'] || '#6366f1';
  };

  // Calculate percentage of this bar's value
  const getPercentage = (value: number): string => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return '0%';
    const pct = ((value / total) * 100).toFixed(1);
    return `${pct}%`;
  };

  // Hover handlers
  const handleMouseEnter = useCallback((index: number, event: React.MouseEvent) => {
    const item = data[index];
    const barColor = getBarColor(item.label, item.color);
    
    setTooltip({
      visible: true,
      label: item.label,
      value: item.value,
      color: barColor,
      x: 0, // Will be positioned by CSS
      y: index
    });
  }, [data, colors]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            top: `${20 + tooltip.y * (barHeight + barGap) + barHeight / 2 - 20}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px 12px',
            zIndex: 1000,
            pointerEvents: 'none',
            minWidth: '140px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.15s ease-in-out'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: tooltip.color
            }} />
            <span style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              fontWeight: '500',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {tooltip.label}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px'
          }}>
            <span style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {tooltip.value}
            </span>
            <span style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '12px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              matches ({getPercentage(tooltip.value)})
            </span>
          </div>
        </div>
      )}

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 400 ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {/* Background grid lines */}
        {ticks.map((tick, i) => {
          const x = 120 + (i / ticks.length) * 260;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={20}
                x2={x}
                y2={height - 40}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={x}
                y={height - 20}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.4)"
                fontSize="12"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Bars and labels */}
        {data.map((item, index) => {
          const y = 20 + index * (barHeight + barGap);
          const barWidth = (item.value / axisMax) * 260;
          const barColor = getBarColor(item.label, item.color);
          
          return (
            <g key={index}>
              {/* Label */}
              <text
                x={110}
                y={y + barHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="14"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="400"
              >
                {item.label}
              </text>

              {/* Bar (with hover area) */}
              <g
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer' }}
              >
                {/* Invisible hit area for easier hovering */}
                <rect
                  x={120}
                  y={y - 4}
                  width={Math.max(barWidth, 2)}
                  height={barHeight + 8}
                  fill="transparent"
                />
                {/* Visible bar */}
                <rect
                  x={120}
                  y={y}
                  width={Math.max(barWidth, 2)}
                  height={barHeight}
                  rx={6}
                  ry={6}
                  fill={barColor}
                  opacity={item.value > 0 ? 1 : 0.3}
                  style={{
                    transition: 'all 0.2s ease',
                    filter: tooltip.visible && tooltip.label === item.label ? 'brightness(1.2)' : 'none'
                  }}
                />
              </g>

              {/* Value label above bar */}
              {item.value > 0 && (
                <text
                  x={120 + barWidth}
                  y={y - 6}
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize="12"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="500"
                >
                  {item.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MatchBreakdownChart;
