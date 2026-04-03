"use client";

import React from "react";
import { Building2, Search, Filter, Download, ExternalLink } from "lucide-react";
import styles from "../history.module.css";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

export default function EntityHistoryPage() {
  const [loading, setLoading] = React.useState(false);
  
  const dummyHistory = [
    { name: "Cellbunq Tech Ltd", date: "2026-04-03 09:45", status: "MATCHED", operator: "Analyst" },
    { name: "Global Trade Corp", date: "2026-04-01 11:30", status: "CLEARED", operator: "System" },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Retrieving archives..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Audit Trail: Entity History</h1>
          <p className={styles.subtitle}>Institutional compliance logs and corporate screening archives.</p>
        </div>
        <button className={styles.iconBtn} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Download size={16} /> Export CSV
        </button>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search entities..." 
            className={styles.searchInput}
          />
        </div>
        <button className={styles.iconBtn} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {["Corporate Entity", "Timestamp", "Status", "Operator", "Actions"].map(head => (
                <th key={head} className={styles.th}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dummyHistory.map((item, i) => (
              <tr key={i} className={styles.tr}>
                <td className={styles.td} style={{ fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={14} style={{ color: "#fbbf24" }} />
                    {item.name}
                  </div>
                </td>
                <td className={styles.td} style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>{item.date}</td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${item.status === 'CLEARED' ? styles.badgeClear : styles.badgeMatched}`}>
                    {item.status}
                  </span>
                </td>
                <td className={styles.td} style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>{item.operator}</td>
                <td className={styles.td}>
                  <button className={styles.iconBtn}><ExternalLink size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
