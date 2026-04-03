"use client";

import React from "react";
import { History, List, Search, Filter, Download, User, Building2, ExternalLink } from "lucide-react";
import styles from "../history.module.css";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

import { useRouter } from "next/navigation";

export default function AllHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [screenings, setScreenings] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("amltab_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/screen/?limit=100`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setScreenings(data);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = screenings.filter(item => {
    const searchStr = searchQuery.toLowerCase();
    const name = (item.company_name || `${item.first_name || ""} ${item.last_name || ""}`).toLowerCase();
    return name.includes(searchStr) || item.id.toLowerCase().includes(searchStr);
  });

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Retrieving screening history archive..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Audit Trail: All Histories</h1>
          <p className={styles.subtitle}>Complete chronological record of all screening events.</p>
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
            placeholder="Search by name, ID, or reference..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              {["Type", "Entity/Subject", "Timestamp", "Status", "Operator", "Actions"].map(head => (
                <th key={head} className={styles.th}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((item) => (
              <tr key={item.id} className={styles.tr}>
                <td className={styles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 700 }}>
                    {item.company_name ? <Building2 size={14} style={{ color: "#fbbf24" }} /> : <User size={14} style={{ color: "var(--primary)" }} />}
                    {item.company_name ? "Entity" : "Individual"}
                  </div>
                </td>
                <td className={styles.td} style={{ fontWeight: 600 }}>
                  {item.company_name || `${item.first_name || ""} ${item.last_name || ""}`}
                </td>
                <td className={styles.td} style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${item.status === 'CLEARED' ? styles.badgeClear : styles.badgeMatched}`}>
                    {item.status}
                  </span>
                </td>
                <td className={styles.td} style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>System</td>
                <td className={styles.td}>
                  <button 
                    className={styles.iconBtn}
                    onClick={() => router.push(`/screenings/${item.id}`)}
                  >
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--secondary)" }}>
                  No screening history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
