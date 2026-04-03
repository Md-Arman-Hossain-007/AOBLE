"use client";

import React, { useState, useEffect } from "react";
import { 
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  User,
  Users,
  ShieldAlert,
  Plus
} from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";
import { LoadingSpinner } from "../../components/LoadingSpinner";

interface Case {
  id: string;
  title: string;
  status: string;
  priority: string;
  case_type: string;
  assigned_to?: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function CaseInboxPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      const [casesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/compliance/cases/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/compliance/cases/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (casesRes.ok && statsRes.ok) {
        setCases(await casesRes.json());
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch compliance cases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPriorityClass = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      default: return styles.priorityLow;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return styles.statusPending;
      case 'under_review': return styles.statusReview;
      case 'resolved': return styles.statusResolved;
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Compliance Inbox</h1>
        <button style={{
          backgroundColor: '#4F46E5',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }}>
          <Plus size={20} /> Create New Case
        </button>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Cases</span>
          <span className={styles.statValue}>{stats?.total_cases || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Awaiting Review</span>
          <span className={styles.statValue} style={{ color: '#F59E0B' }}>{stats?.pending_cases || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>High Priority</span>
          <span className={styles.statValue} style={{ color: '#F87171' }}>{stats?.priorities?.high || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Duration</span>
          <span className={styles.statValue} style={{ color: '#818CF8' }}>{stats?.avg_resolution_time || 0}h</span>
        </div>
      </section>

      <section className={styles.inboxContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Priority</th>
              <th className={styles.th}>Case Title</th>
              <th className={styles.th}>State</th>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>Assigned To</th>
              <th className={styles.th}>Opened</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '80px' }}>
                  <LoadingSpinner />
                </td>
              </tr>
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
                   <Inbox size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                   <p>No active cases in your queue.</p>
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr key={c.id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={`${styles.priorityBadge} ${getPriorityClass(c.priority)}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{c.title}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${getStatusClass(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {c.case_type}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.assignee}>
                      <div className={styles.avatar}>
                        {c.assigned_to?.slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <span>{c.assigned_to || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                      <Clock size={14} />
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={styles.td} style={{ textAlign: 'right' }}>
                    <Link href={`/cases/${c.id}`} style={{ color: '#4F46E5' }}>
                      <ArrowRight size={20} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
