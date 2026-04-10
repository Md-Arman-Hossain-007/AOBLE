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
  UserSearch
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

// Use Next.js API proxy instead of direct backend calls
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
    console.log('🔔 Fetching notifications, token exists:', !!token);
    
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

      console.log('🔗 Fetching from URL:', url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📡 Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Received', data.length, 'notifications');
        setNotifications(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        setError(errorData.detail || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
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
        const updated = await res.json();
        setNotifications(prev => prev.map(n => n.id === id ? updated : n));
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
        return <ShieldAlert size={20} />;
      case 'success':
      case 'resolved':
        return <CheckCircle2 size={20} />;
      case 'monitoring':
        return <ShieldCheck size={20} />;
      case 'screening':
        return <UserSearch size={20} />;
      case 'info':
      case 'system':
        return <Info size={20} />;
      case 'security':
        return <AlertTriangle size={20} />;
      default: 
        return <Bell size={20} />;
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

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <Bell size={14} /> },
    { key: "unread", label: "Unread", icon: <BellOff size={14} /> },
    { key: "risk_alert", label: "Risk", icon: <AlertTriangle size={14} /> },
    { key: "success", label: "Success", icon: <CheckCircle2 size={14} /> },
    { key: "monitoring", label: "Monitoring", icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
              : "All caught up!"}
          </p>
        </div>
        
        <div className={styles.controls}>
          <button 
            className={styles.iconControlBtn} 
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? styles.spinning : ""} />
          </button>
          {unreadCount > 0 && (
            <button className={styles.markReadBtn} onClick={markAllRead}>
              <Check size={14} />
              Mark all read
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
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <AlertTriangle size={48} className={styles.errorIcon} />
            <p className={styles.errorText}>{error}</p>
            <button 
              className={styles.retryBtn}
              onClick={() => fetchNotifications(true)}
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {filter === "unread" ? <BellOff size={64} /> : <Bell size={64} />}
            </div>
            <h3 className={styles.emptyTitle}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className={styles.emptyText}>
              {filter === "unread" 
                ? "You're all caught up! New notifications will appear here." 
                : "We'll notify you when there are updates to your compliance screenings."}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
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
                    <Check size={16} />
                  </button>
                )}
                
                {n.link && (
                  <Link 
                    href={n.link} 
                    className={styles.actionBtn}
                    title="View details"
                  >
                    <ArrowRight size={16} />
                  </Link>
                )}
                
                {n.metadata_json?.screening_id && (
                  <Link 
                    href={`/screenings/${n.metadata_json.screening_id}`} 
                    className={styles.actionBtn}
                    title="View screening"
                  >
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
