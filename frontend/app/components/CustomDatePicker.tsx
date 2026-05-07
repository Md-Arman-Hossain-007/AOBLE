"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, ChevronDown } from "lucide-react";
import styles from "./CustomDatePicker.module.css";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const yearGridRef = useRef<HTMLDivElement>(null);

  // Parse value string to Date object
  const selectedDate = value ? new Date(value) : null;

  // Calendar logic helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format as YYYY-MM-DD
    const formatted = newDate.toISOString().split("T")[0];
    onChange(formatted);
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    setShowYearPicker(false);
  };

  const handleToday = () => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    onChange(formatted);
    setViewDate(today);
    setIsOpen(false);
    setShowYearPicker(false);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync viewDate with value when it changes externally
  useEffect(() => {
    if (value && !isOpen) {
      setViewDate(new Date(value));
    }
  }, [value, isOpen]);

  // Scroll active year into view when picker opens
  useEffect(() => {
    if (showYearPicker && yearGridRef.current) {
      const activeYear = yearGridRef.current.querySelector(`.${styles.active}`);
      if (activeYear) {
        activeYear.scrollIntoView({ block: "center", behavior: "auto" });
      }
    }
  }, [showYearPicker]);

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.empty}`} />);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
    const isSelected = selectedDate && selectedDate.toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
    
    days.push(
      <div
        key={day}
        className={`${styles.dayCell} ${isToday ? styles.today : ""} ${isSelected ? styles.selected : ""}`}
        onClick={() => handleDateSelect(day)}
      >
        {day}
      </div>
    );
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate years (from 1900 to current year + 10)
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear + 5; y >= 1900; y--) {
    years.push(y);
  }

  return (
    <div className={styles.datePickerContainer} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <CalendarIcon size={16} className={styles.calendarIcon} />
        <input
          type="text"
          readOnly
          placeholder={placeholder}
          value={value ? new Date(value).toLocaleDateString() : ""}
          onClick={() => setIsOpen(!isOpen)}
          className={`${styles.dateInput} ${isOpen ? styles.active : ""}`}
        />
        {value && (
          <button 
            className={styles.clearInputBtn} 
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            aria-label="Clear date"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.calendarDropdown}>
          <div className={styles.calendarHeader}>
            <div 
              className={styles.currentMonth} 
              onClick={() => setShowYearPicker(!showYearPicker)}
              title="Select Year"
            >
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              <ChevronDown size={14} className={`${styles.chevron} ${showYearPicker ? styles.up : ""}`} />
            </div>
            <div className={styles.navButtons}>
              <button className={styles.navBtn} onClick={handlePrevYear} title="Previous Year">
                <ChevronsLeft size={18} />
              </button>
              <button className={styles.navBtn} onClick={handlePrevMonth} title="Previous Month">
                <ChevronLeft size={18} />
              </button>
              <button className={styles.navBtn} onClick={handleNextMonth} title="Next Month">
                <ChevronRight size={18} />
              </button>
              <button className={styles.navBtn} onClick={handleNextYear} title="Next Year">
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>

          {showYearPicker ? (
            <div className={styles.selectorOverlay} ref={yearGridRef}>
              {years.map(y => (
                <div 
                  key={y} 
                  className={`${styles.selectorItem} ${viewDate.getFullYear() === y ? styles.active : ""}`}
                  onClick={() => handleYearSelect(y)}
                >
                  {y}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className={styles.weekDays}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} className={styles.weekDay}>{d}</div>
                ))}
              </div>

              <div className={styles.daysGrid}>
                {days}
              </div>
            </>
          )}

          <div className={styles.calendarFooter}>
            <button className={`${styles.footerBtn} ${styles.clearBtn}`} onClick={handleClear}>
              Clear
            </button>
            <button className={`${styles.footerBtn} ${styles.todayBtn}`} onClick={handleToday}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
