"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink,
  UserSearch
} from "lucide-react";
import Link from "next/link";
import styles from "./NotificationModal.module.css";

function LoadingSpinner() {
  return (
    <div style={{
      width: 24,
      height: 24,
      border: '2px solid var(--border)',
      borderTop: '2px solid var(--primary)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  );
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  link: string | null;
  metadata_json?: any;
  created_at: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUnreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

const API_BASE = "/api";

export function NotificationModal({
  isOpen,
  onClose,
  initialUnreadCount,
  onUnreadCountChange
}: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const getToken = () => localStorage.getItem("amltab_token");

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        const unread = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const markAsRead = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllRead = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        onUnreadCountChange(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'risk_alert':
      case 'high_risk':
        return <ShieldAlert size={18} />;
      case 'success':
      case 'resolved':
        return <CheckCircle2 size={18} />;
      case 'monitoring':
        return <ShieldCheck size={18} />;
      case 'screening':
        return <UserSearch size={18} />;
      case 'info':
      case 'system':
        return <Info size={18} />;
      case 'security':
        return <AlertTriangle size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const getIconClass = (type: string, priority: string) => {
    if (priority === 'urgent' || priority === 'high') return styles.iconUrgent;
    switch(type) {
      case 'risk_alert':
      case 'high_risk':
        return styles.iconRisk;
      case 'success':
      case 'resolved':
        return styles.iconSuccess;
      case 'monitoring':
      case 'screening':
        return styles.iconMonitoring;
      case 'info':
      case 'system':
        return styles.iconSystem;
      case 'security':
        return styles.iconSecurity;
      default:
        return styles.iconSystem;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      urgent: { label: "Urgent", className: styles.priorityUrgent },
      high: { label: "High", className: styles.priorityHigh },
      normal: { label: "Normal", className: styles.priorityNormal },
      low: { label: "Low", className: styles.priorityLow },
    };
    
    const config = priorityMap[priority] || priorityMap.normal;
    return <span className={config.className}>{config.label}</span>;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Modal */}
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Notifications</h2>
            <p className={styles.subtitle}>
              {unreadCount > 0 
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
                : "All caught up!"}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className={styles.actions}>
            <button className={styles.markAllBtn} onClick={markAllRead}>
              <Check size={14} />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className={styles.notificationList}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
              <p>Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <Bell size={48} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>No notifications yet</p>
              <p className={styles.emptyText}>
                We'll notify you when there are updates.
              </p>
            </div>
          ) : (
            <>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.notificationCard} ${!n.is_read ? styles.notificationUnread : ""}`}
                >
                  <div className={`${styles.iconWrapper} ${getIconClass(n.type, n.priority)}`}>
                    {getIcon(n.type)}
                  </div>

                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h3 className={styles.notificationTitle}>{n.title}</h3>
                      <div className={styles.notificationMeta}>
                        {getPriorityBadge(n.priority)}
                        <span className={styles.timestamp}>
                          <Clock size={12} />
                          {formatTimestamp(n.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className={styles.notificationMessage}>{n.message}</p>
                  </div>

                  <div className={styles.notificationActions}>
                    {!n.is_read && (
                      <button
                        className={styles.actionBtn}
                        onClick={() => markAsRead(n.id)}
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    
                    {n.link && (
                      <Link 
                        href={n.link} 
                        className={styles.actionBtn}
                        title="View details"
                        onClick={onClose}
                      >
                        <ArrowRight size={14} />
                      </Link>
                    )}
                    
                    {n.metadata_json?.screening_id && (
                      <Link 
                        href={`/screenings/${n.metadata_json.screening_id}`} 
                        className={styles.actionBtn}
                        title="View screening"
                        onClick={onClose}
                      >
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    
                    <button
                      className={styles.actionBtn}
                      onClick={() => deleteNotification(n.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* View All Button */}
              <Link 
                href="/activity" 
                className={styles.viewAllBtn}
                onClick={onClose}
              >
                View All Notifications
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
