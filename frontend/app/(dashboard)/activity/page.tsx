"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  BellOff,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  UserSearch,
  CheckCheck
} from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";
import { LoadingSpinner } from "../../components/LoadingSpinner";

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

type FilterType = "all" | "unread" | "risk_alert" | "success" | "info" | "screening" | "monitoring";

const API_BASE = "/api";

export default function NotificationsCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("amltab_token");

  const fetchNotifications = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError(null);
    
    const token = getToken();
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      let url = `${API_BASE}/notifications?limit=100`;
      
      if (filter === "unread") {
        url += "&is_read=false";
      } else if (filter !== "all") {
        url += `&type=${filter}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notifications/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id: string) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        fetchUnreadCount();
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllRead = async () => {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        fetchUnreadCount();
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'risk_alert': 
      case 'high_risk':
        return <ShieldAlert size={24} />;
      case 'success':
      case 'resolved':
        return <CheckCircle2 size={24} />;
      case 'monitoring':
        return <ShieldCheck size={24} />;
      case 'screening':
        return <UserSearch size={24} />;
      case 'security':
        return <AlertTriangle size={24} />;
      default: 
        return <Bell size={24} />;
    }
  };

  const getIconClass = (type: string) => {
    switch(type) {
      case 'risk_alert':
      case 'high_risk':
        return styles.iconRisk;
      case 'success':
      case 'resolved':
        return styles.iconSuccess;
      case 'monitoring':
        return styles.iconMonitoring;
      case 'screening':
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Grouping logic
  const groupedNotifications: { [key: string]: Notification[] } = {
    "Today": [],
    "Yesterday": [],
    "Earlier": []
  };

  notifications.forEach(n => {
    const date = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      groupedNotifications["Today"].push(n);
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupedNotifications["Yesterday"].push(n);
    } else {
      groupedNotifications["Earlier"].push(n);
    }
  });

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All Events", icon: <Bell size={14} /> },
    { key: "unread", label: "Pending", icon: <BellOff size={14} /> },
    { key: "risk_alert", label: "Risk Alerts", icon: <AlertTriangle size={14} /> },
    { key: "screening", label: "Screening", icon: <UserSearch size={14} /> },
    { key: "monitoring", label: "Monitoring", icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Activity Center</h1>
          <p className={styles.subtitle}>
            {unreadCount > 0 
              ? `You have ${unreadCount} pending compliance updates across your organization.` 
              : "Your organization's compliance activities are all clear."}
          </p>
        </div>
        
        <div className={styles.controls}>
          <button 
            className={styles.iconControlBtn} 
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            title="Refresh Feed"
          >
            <RefreshCw size={20} className={refreshing ? styles.spinning : ""} />
          </button>
          {unreadCount > 0 && (
            <button className={styles.markReadBtn} onClick={markAllRead}>
              <CheckCheck size={18} />
              Mark all as read
            </button>
          )}
        </div>
      </header>

      {/* Filter Tabs */}
      <div className={styles.filterBar}>
        {filters.map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <section className={styles.notificationList}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <p style={{ marginTop: 16 }}>Synchronizing activity logs...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <AlertTriangle size={48} className={styles.errorIcon} />
            <p className={styles.errorText}>{error}</p>
            <button className={styles.retryBtn} onClick={() => fetchNotifications(true)}>
              Retry Connection
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <BellOff size={40} />
            </div>
            <h3 className={styles.emptyTitle}>
              {filter === "unread" ? "All Clear!" : "Desk is Clean"}
            </h3>
            <p className={styles.emptyText}>
              {filter === "unread" 
                ? "No unread alerts. Your investigative work is fully up to date." 
                : "No screening or monitoring activities have been logged yet."}
            </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([section, items]) => (
            items.length > 0 && (
              <div key={section} className={styles.dateSection}>
                <div className={styles.sectionHeader}>{section}</div>
                {items.map((n) => (
                  <div 
                    key={n.id} 
                    className={`${styles.notificationCard} ${!n.is_read ? styles.notificationUnread : ""}`}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                  >
                    <div className={`${styles.iconWrapper} ${getIconClass(n.type)}`}>
                      {getIcon(n.type)}
                    </div>
                    
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationHeader}>
                        <h3 className={styles.notificationTitle}>{n.title}</h3>
                        <div className={styles.notificationMeta}>
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
                          onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                          title="Mark as read"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      
                      {n.link && (
                        <Link 
                          href={n.link} 
                          className={styles.actionBtn}
                          title="View Intelligence"
                        >
                          <ArrowRight size={18} />
                        </Link>
                      )}
                      
                      {n.metadata_json?.screening_id && (
                        <Link 
                          href={`/screenings/${n.metadata_json.screening_id}`} 
                          className={styles.actionBtn}
                          title="Screening Report"
                        >
                          <ExternalLink size={18} />
                        </Link>
                      )}
                      
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                        title="Delete Log"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ))
        )}
      </section>
    </div>
  );
}
