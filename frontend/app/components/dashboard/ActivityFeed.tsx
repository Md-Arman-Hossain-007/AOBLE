"use client";

import Link from "next/link";
import { ArrowUpRight, AlertTriangle, CheckCircle, Clock, User, Building2, FileText, Bell, Info } from "lucide-react";
import styles from "./ActivityFeed.module.css";

interface ActivityItem {
  id: string;
  type: "screening" | "match" | "alert" | "case" | "user" | "system";
  title: string;
  description?: string;
  timestamp: string;
  status?: "success" | "warning" | "danger" | "info";
  metadata?: Record<string, string | number>;
  link?: string;
}

interface ActivityFeedProps {
  title?: string;
  activities: ActivityItem[];
  maxItems?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  loading?: boolean;
}

const typeIcons = {
  screening: User,
  match: AlertTriangle,
  alert: Bell,
  case: FileText,
  user: User,
  system: Info,
  entity: Building2,
};

const statusColors = {
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#6366f1",
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString();
}

export function ActivityFeed({
  title = "Recent Activity",
  activities,
  maxItems = 10,
  showViewAll = true,
  viewAllLink = "/activity",
  loading = false,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <div className={styles.feed}>
        <div className={styles.feedHeader}>
          <h3 className={styles.feedTitle}>{title}</h3>
        </div>
        <div className={styles.loadingState}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} style={{ width: "70%" }} />
                <div className={styles.skeletonLine} style={{ width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      <div className={styles.feedHeader}>
        <h3 className={styles.feedTitle}>{title}</h3>
        <span className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          Live
        </span>
      </div>

      <div className={styles.feedList}>
        {displayActivities.length === 0 ? (
          <div className={styles.emptyState}>
            <Clock size={32} />
            <p>No recent activity</p>
          </div>
        ) : (
          displayActivities.map((activity, index) => {
            const Icon = typeIcons[activity.type] || Info;
            const color = activity.status ? statusColors[activity.status] : "#6366f1";

            return (
              <div
                key={activity.id}
                className={styles.feedItem}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15`, color }}>
                  <Icon size={16} />
                </div>

                <div className={styles.content}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemTitle}>
                      {activity.link ? (
                        <Link href={activity.link}>{activity.title}</Link>
                      ) : (
                        activity.title
                      )}
                    </span>
                    <span className={styles.timestamp}>{formatTimeAgo(activity.timestamp)}</span>
                  </div>

                  {activity.description && (
                    <p className={styles.description}>{activity.description}</p>
                  )}

                  {activity.metadata && (
                    <div className={styles.metadata}>
                      {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
                        <span key={key} className={styles.metaTag}>
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {activity.link && (
                  <Link href={activity.link} className={styles.linkIcon}>
                    <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>

      {showViewAll && displayActivities.length > 0 && (
        <Link href={viewAllLink} className={styles.viewAll}>
          View all activity
          <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
}
