"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield,
  Activity,
  User,
  Building2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Clock,
  Search,
  Filter,
  Plus
} from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import Link from "next/link";
import styles from "./page.module.css";

interface MonitoredEntity {
  id: string;
  customer_ref: string;
  entity_id?: string;
  query_name: string;
  last_risk_level: string;
  last_screened_at: string;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function WatchlistCenterPage() {
  const [entities, setEntities] = useState<MonitoredEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEntities = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/monitoring/entities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEntities(data);
      }
    } catch (err) {
      console.error("Failed to fetch monitored entities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to stop monitoring this entity?")) return;
    
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/monitoring/entities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEntities(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredEntities = entities.filter(e => 
    e.query_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.customer_ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskClass = (risk: string) => {
    switch(risk.toUpperCase()) {
      case 'HIGH': return styles.riskHigh;
      case 'MEDIUM': return styles.riskMedium;
      default: return styles.riskLow;
    }
  };

  const stats = {
    total: entities.length,
    highRisk: entities.filter(e => e.last_risk_level === 'HIGH').length,
    active: entities.filter(e => e.status === 'active').length,
    lastScanned: entities.length > 0 
      ? new Date(Math.max(...entities.map(e => new Date(e.last_screened_at).getTime()))).toLocaleDateString() 
      : 'N/A'
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Watchlist Center</h1>
          <p className={styles.subtitle}>Continuous monitoring and lifecycle management for your portfolio.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
             <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Filtered by name or reference..." 
                  className={styles.searchBar}
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 12px 10px 36px',
                    color: '#fff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    width: '280px'
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button style={{
               backgroundColor: '#4F46E5',
               color: '#fff',
               border: 'none',
               borderRadius: '10px',
               padding: '10px 16px',
               fontSize: '0.875rem',
               fontWeight: 600,
               display: 'flex',
               alignItems: 'center',
               gap: '8px',
               cursor: 'pointer'
             }}>
                <Plus size={18} /> Add Entity
             </button>
        </div>
      </header>

      <section className={styles.statsRibbon}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Monitored</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>High Risk Hits</span>
          <span className={styles.statValue} style={{ color: '#F87171' }}>{stats.highRisk}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Subscriptions</span>
          <span className={styles.statValue} style={{ color: '#4ADE80' }}>{stats.active}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Last Global Sync</span>
          <span className={styles.statValue} style={{ color: '#818CF8' }}>{stats.lastScanned}</span>
        </div>
      </section>

      <section className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Entity Profile</th>
              <th className={styles.th}>Reference ID</th>
              <th className={styles.th}>Last Risk Level</th>
              <th className={styles.th}>Last Screened</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
                  <LoadingSpinner />
                </td>
              </tr>
            ) : filteredEntities.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  No entities are currently enrolled for continuous monitoring.
                </td>
              </tr>
            ) : (
              filteredEntities.map((entity) => (
                <tr key={entity.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.entityInfo}>
                      <span className={styles.entityName}>{entity.query_name}</span>
                      <span className={styles.entityRef}>{entity.entity_id ? `OS ID: ${entity.entity_id.slice(0, 15)}...` : 'Manual Entry'}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span style={{ fontFamily: 'monospace' }}>{entity.customer_ref}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.riskBadge} ${getRiskClass(entity.last_risk_level)}`}>
                      {entity.last_risk_level}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                      <Clock size={14} />
                      {new Date(entity.last_screened_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.statusBadge}>
                      <div className={styles.statusDot}></div>
                      Active
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <Link href={`/screenings/entity/${entity.entity_id}`} className={styles.actionBtn}>
                        <ExternalLink size={14} />
                      </Link>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleRemove(entity.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
