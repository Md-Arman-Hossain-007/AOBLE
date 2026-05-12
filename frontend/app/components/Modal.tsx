"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "small" | "medium" | "large";
  // Confirmation modal props (alternative to children/footer)
  onConfirm?: (note: string) => Promise<void>;
  message?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger" | "success";
  placeholder?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
  onConfirm,
  message,
  confirmLabel,
  confirmVariant = "primary",
  placeholder
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      setNote("");
      setProcessing(false);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!onConfirm || !note.trim() || processing) return;
    setProcessing(true);
    try {
      await onConfirm(note.trim());
      onClose();
    } catch (err) {
      console.error("Confirmation error:", err);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !mounted) return null;

  // Confirmation modal mode
  const isConfirmMode = onConfirm !== undefined;

  const getButtonClass = () => {
    switch(confirmVariant) {
      case 'danger': return styles.btnDanger;
      case 'success': return styles.btnSuccess;
      default: return styles.btnPrimary;
    }
  };

  const modalContent = (
    <div 
      ref={overlayRef}
      className={styles.overlay} 
      onClick={handleOverlayClick}
    >
      <div className={`${styles.modal} ${styles[`modal${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        {isConfirmMode ? (
          <>
            <div className={styles.content}>
              {message && (
                <p className={styles.messageText}>
                  {message}
                </p>
              )}
              <div className={styles.formGroup}>
                <label className={styles.label}>Justification Note</label>
                <textarea
                  className={styles.textarea}
                  placeholder={placeholder || "Enter note..."}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
                <p className={styles.helperText}>This will be recorded in the audit trail</p>
              </div>
            </div>
            <div className={styles.footer}>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onClose}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className={`${styles.btn} ${getButtonClass()}`}
                onClick={handleConfirm}
                disabled={!note.trim() || processing}
              >
                {processing ? "Processing..." : confirmLabel || "Confirm"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.content}>
              {children}
            </div>
            {footer && (
              <div className={styles.footer}>
                {footer}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
