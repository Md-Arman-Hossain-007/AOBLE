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
  UserSearch,
  CheckCheck
} from "lucide-react";
import Link from "next/link";
import styles from "./NotificationModal.module.css";

function LoadingSpinner() {
  return (
    <div className={styles.spinning} style={{
      width: 32,
      height: 32,
      border: '3px solid var(--border)',
      borderTop: '3px solid var(--primary)',
      borderRadius: '50%',
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

const API_BASE = "/api/v1";

export function NotificationModal({
  isOpen,
  onClose,
  initialUnreadCount,
  onUnreadCountChange
}: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const getToken = () => localStorage.getItem("amltab_token");

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        const unread = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
        onUnreadCountChange(unread);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

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
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        const newUnread = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnread);
        onUnreadCountChange(newUnread);
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

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Recalculate unread if necessary
        const isUnread = notifications.find(n => n.id === id)?.is_read === false;
        if (isUnread) {
          const newUnread = Math.max(0, unreadCount - 1);
          setUnreadCount(newUnread);
          onUnreadCountChange(newUnread);
        }
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'risk_alert':
      case 'high_risk':
        return <ShieldAlert size={20} />;
      case 'success':
      case 'resolved':
        return <CheckCircle2 size={20} />;
      case 'monitoring':
        return <ShieldCheck size={20} />;
      case 'screening':
        return <UserSearch size={20} />;
      case 'security':
        return <AlertTriangle size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const getIconColorClass = (type: string) => {
    switch(type) {
      case 'risk_alert':
      case 'high_risk':
        return styles.iconColor_risk;
      case 'monitoring':
      case 'screening':
        return styles.iconColor_monitoring;
      case 'security':
        return styles.iconColor_security;
      case 'success':
      case 'resolved':
        return styles.iconColor_info;
      default:
        return styles.iconColor_screening;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    // Ensure the date string is treated as UTC if it lacks timezone info
    const utcStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    const date = new Date(utcStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1 || diffMins < 0) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(n => !n.is_read);

  // Group notifications
  const newNotifications = filteredNotifications.filter(n => {
    const diff = new Date().getTime() - new Date(n.created_at).getTime();
    return diff < 86400000; // Last 24 hours
  });
  const earlierNotifications = filteredNotifications.filter(n => {
    const diff = new Date().getTime() - new Date(n.created_at).getTime();
    return diff >= 86400000;
  });

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      
      <div className={styles.modal}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleWrapper}>
              <h2 className={styles.title}>Activity Center</h2>
              {unreadCount > 0 && (
                <span className={styles.unreadBadge}>{unreadCount} New</span>
              )}
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ""}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'unread' ? styles.activeTab : ""}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Global Actions */}
        {unreadCount > 0 && (
          <div className={styles.actionsRow}>
            <button className={styles.markAllBtn} onClick={markAllRead}>
              <CheckCheck size={14} />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notification List Body */}
        <div className={styles.notificationList}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
              <p style={{ marginTop: 16, fontWeight: 500 }}>Fetching activities...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                <Bell size={40} />
              </div>
              <p className={styles.emptyTitle}>
                {activeTab === 'unread' ? "You're all caught up!" : "No activities yet"}
              </p>
              <p className={styles.emptyText}>
                {activeTab === 'unread' 
                  ? "Check back later for new alerts and updates." 
                  : "Start screening entities to see activity logs here."}
              </p>
            </div>
          ) : (
            <>
              {newNotifications.length > 0 && (
                <div className={styles.sectionHeader}>New</div>
              )}
              {newNotifications.map(n => (
                <NotificationCard 
                  key={n.id} 
                  n={n} 
                  onMarkRead={markAsRead} 
                  onDelete={deleteNotification}
                  onClose={onClose}
                  formatTimestamp={formatTimestamp}
                  getIcon={getIcon}
                  getIconColorClass={getIconColorClass}
                />
              ))}

              {earlierNotifications.length > 0 && (
                <div className={styles.sectionHeader}>Earlier</div>
              )}
              {earlierNotifications.map(n => (
                <NotificationCard 
                  key={n.id} 
                  n={n} 
                  onMarkRead={markAsRead} 
                  onDelete={deleteNotification}
                  onClose={onClose}
                  formatTimestamp={formatTimestamp}
                  getIcon={getIcon}
                  getIconColorClass={getIconColorClass}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Link href="/activity" className={styles.viewAllBtn} onClick={onClose}>
            View All Activity
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </>
  );
}

function NotificationCard({ 
  n, 
  onMarkRead, 
  onDelete, 
  onClose,
  formatTimestamp,
  getIcon,
  getIconColorClass
}: any) {
  return (
    <div 
      className={`${styles.notificationCard} ${!n.is_read ? styles.notificationUnread : ""}`}
      onClick={() => !n.is_read && onMarkRead(n.id)}
    >
      {!n.is_read && <div className={styles.unreadDot} />}
      
      <div className={`${styles.iconContainer} ${getIconColorClass(n.type)}`}>
        {getIcon(n.type)}
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <h3 className={styles.itemTitle}>{n.title}</h3>
          <span className={styles.itemTime}>{formatTimestamp(n.created_at)}</span>
        </div>
        <p className={styles.itemMessage}>{n.message}</p>
        
        <div className={styles.itemActions}>
          {n.link && (
            <Link 
              href={n.link} 
              className={styles.actionCircle}
              onClick={onClose}
              title="View Detail"
            >
              <ExternalLink size={14} />
            </Link>
          )}
          {!n.is_read && (
            <button 
              className={styles.actionCircle}
              onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
              title="Mark as Read"
            >
              <Check size={14} />
            </button>
          )}
          <button 
            className={`${styles.actionCircle} ${styles.deleteAction}`}
            onClick={(e) => onDelete(n.id, e)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
