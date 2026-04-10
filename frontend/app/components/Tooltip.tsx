"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./Tooltip.module.css";
import { Info } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const gap = 10;
    
    let top = 0;
    let left = 0;
    
    switch(position) {
      case 'top':
        top = rect.top - gap;
        left = rect.left + (rect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + (rect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2);
        left = rect.left - gap;
        break;
      case 'right':
        top = rect.top + (rect.height / 2);
        left = rect.right + gap;
        break;
    }
    
    setTooltipStyle({
      top: `${top}px`,
      left: `${left}px`,
      transform: position === 'top' || position === 'bottom' 
        ? 'translate(-50%, -100%)' 
        : position === 'left' 
          ? 'translate(-100%, -50%)' 
          : 'translate(0, -50%)'
    });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, position]);

  return (
    <div 
      ref={containerRef}
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <Info size={14} className={styles.tooltipIcon} />
      )}
      {isVisible && (
        <div 
          className={styles.tooltipBox}
          style={tooltipStyle}
        >
          {content}
        </div>
      )}
    </div>
  );
}
