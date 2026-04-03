"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";
import { LoadingSpinner } from "../../components/LoadingSpinner";

interface Notification {
  id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  details?: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function NotificationsCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'risk_alert': return <ShieldAlert size={20} />;
      case 'success': return <CheckCircle2 size={20} />;
      case 'info': return <Info size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getIconClass = (type: string) => {
    switch(type) {
      case 'risk_alert': return styles.iconRisk;
      case 'success': return styles.iconSuccess;
      default: return styles.iconSystem;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Notifications Center</h1>
        <div className={styles.controls}>
          <button className={styles.markReadBtn} onClick={markAllRead}>
            Mark all as read
          </button>
        </div>
      </header>

      <section className={styles.alertList}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#64748b', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px' }}>
            <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.1 }} />
            <p>Your compliance inbox is currently empty.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`${styles.alertCard} ${!n.is_read ? styles.alertUnread : ""}`}>
              <div className={`${styles.iconWrapper} ${getIconClass(n.type)}`}>
                {getIcon(n.type)}
              </div>
              <div className={styles.content}>
                <p className={styles.message}>{n.message}</p>
                <span className={styles.timestamp}>
                   <Clock size={12} />
                   {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <div className={styles.actions}>
                {!n.is_read && (
                  <button 
                    className={styles.actionBtn} 
                    onClick={() => markAsRead(n.id)}
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                {n.details?.screening_id && (
                  <Link href={`/screenings/${n.details.screening_id}`} className={styles.actionBtn}>
                    <ExternalLink size={16} />
                  </Link>
                )}
                <button 
                  className={styles.actionBtn} 
                  onClick={() => deleteNotification(n.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
