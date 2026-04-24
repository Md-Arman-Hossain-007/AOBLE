"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Plus,
  RefreshCw,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
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
  status: string; // "active" | "inactive" | "pending" | "review" | etc.
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function MonitoringPage() {
  const [entities, setEntities] = useState<MonitoredEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "high" | "medium" | "low" | "pending">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<MonitoredEntity | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchEntities = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      setLoading(true);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEntities();
    setIsRefreshing(false);
  };

  const confirmRemove = (entity: MonitoredEntity) => {
    setEntityToDelete(entity);
    setDeleteModalOpen(true);
  };

  const handleRemove = async () => {
    if (!entityToDelete) return;
    const id = entityToDelete.id;

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
    } finally {
      setDeleteModalOpen(false);
      setEntityToDelete(null);
    }
  };

  const filteredEntities = useMemo(() => {
    const validRiskLevels = ["HIGH", "MEDIUM", "LOW"];
    
    return entities.filter(e => {
      const matchesSearch = 
        e.query_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.customer_ref.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isStatusValue = !validRiskLevels.includes(e.last_risk_level?.toUpperCase());
      
      const matchesFilter = 
        filterType === "all" ||
        (filterType === "high" && e.last_risk_level?.toUpperCase() === "HIGH") ||
        (filterType === "medium" && e.last_risk_level?.toUpperCase() === "MEDIUM") ||
        (filterType === "low" && e.last_risk_level?.toUpperCase() === "LOW") ||
        (filterType === "pending" && isStatusValue);
      
      return matchesSearch && matchesFilter;
    });
  }, [entities, searchQuery, filterType]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntities.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEntities = filteredEntities.slice(startIndex, endIndex);
  
  // Page numbers to display (show max 5 pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const stats = useMemo(() => {
    const validRiskLevels = ["HIGH", "MEDIUM", "LOW"];
    
    return {
      total: entities.length,
      highRisk: entities.filter(e => e.last_risk_level?.toUpperCase() === "HIGH").length,
      mediumRisk: entities.filter(e => e.last_risk_level?.toUpperCase() === "MEDIUM").length,
      lowRisk: entities.filter(e => e.last_risk_level?.toUpperCase() === "LOW").length,
      // Count non-risk status values separately
      pending: entities.filter(e => 
        !validRiskLevels.includes(e.last_risk_level?.toUpperCase())
      ).length,
      active: entities.filter(e => e.status === "active").length,
      lastScanned: entities.length > 0
        ? new Date(Math.max(...entities.map(e => new Date(e.last_screened_at).getTime()))).toLocaleDateString()
        : "N/A"
    };
  }, [entities]);

  const getRiskClass = (risk: string) => {
    const upperRisk = risk.toUpperCase();
    // Proper risk levels
    if (upperRisk === "HIGH") return styles.riskHigh;
    if (upperRisk === "MEDIUM") return styles.riskMedium;
    if (upperRisk === "LOW") return styles.riskLow;
    // Status values - use neutral/different styling
    if (upperRisk === "PENDING") return styles.statusPending;
    if (upperRisk === "REVIEW") return styles.statusReview;
    if (upperRisk === "MATCH" || upperRisk === "MATCHED") return styles.statusMatch;
    // Default
    return styles.riskLow;
  };

  const getRiskIcon = (risk: string) => {
    const upperRisk = risk.toUpperCase();
    // Proper risk levels
    if (upperRisk === "HIGH") return <AlertTriangle size={14} />;
    if (upperRisk === "MEDIUM") return <ShieldAlert size={14} />;
    if (upperRisk === "LOW") return <CheckCircle size={14} />;
    // Status values - use appropriate icons
    if (upperRisk === "PENDING") return <Clock size={14} />;
    if (upperRisk === "REVIEW") return <Search size={14} />;
    if (upperRisk === "MATCH" || upperRisk === "MATCHED") return <ShieldAlert size={14} />;
    // Default
    return <CheckCircle size={14} />;
  };

  const getRiskLabel = (risk: string) => {
    const upperRisk = risk.toUpperCase();
    // If it's a status value, return as-is
    if (["PENDING", "REVIEW", "MATCH", "MATCHED"].includes(upperRisk)) {
      return risk;
    }
    // If it's a proper risk level, format it
    return risk;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Monitoring Center</h1>
          <p className={styles.subtitle}>
            Continuous compliance monitoring and risk lifecycle management
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.iconBtn}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh"
          >
            <RefreshCw size={18} className={isRefreshing ? styles.spinning : ""} />
          </button>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search entities..."
              className={styles.searchBar}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/screen" className={styles.addBtn}>
            <Plus size={18} />
            <span>Add Entity</span>
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.blue}`}>
            <Activity size={20} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>Total Monitored</div>
            <div className={styles.kpiValue}>{stats.total}</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.red}`}>
            <AlertTriangle size={20} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>High Risk</div>
            <div className={`${styles.kpiValue} ${styles.textRed}`}>{stats.highRisk}</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.yellow}`}>
            <ShieldAlert size={20} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>Medium Risk</div>
            <div className={`${styles.kpiValue} ${styles.textYellow}`}>{stats.mediumRisk}</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.green}`}>
            <CheckCircle size={20} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>Active Subscriptions</div>
            <div className={`${styles.kpiValue} ${styles.textGreen}`}>{stats.active}</div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className={styles.filterSection}>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filterType === "all" ? styles.active : ""}`}
            onClick={() => setFilterType("all")}
          >
            All ({stats.total})
          </button>
          <button
            className={`${styles.filterTab} ${filterType === "high" ? styles.active : ""}`}
            onClick={() => setFilterType("high")}
          >
            <AlertTriangle size={14} />
            High Risk ({stats.highRisk})
          </button>
          <button
            className={`${styles.filterTab} ${filterType === "medium" ? styles.active : ""}`}
            onClick={() => setFilterType("medium")}
          >
            <ShieldAlert size={14} />
            Medium Risk ({stats.mediumRisk})
          </button>
          <button
            className={`${styles.filterTab} ${filterType === "low" ? styles.active : ""}`}
            onClick={() => setFilterType("low")}
          >
            <CheckCircle size={14} />
            Low Risk ({stats.lowRisk})
          </button>
          <button
            className={`${styles.filterTab} ${filterType === "pending" ? styles.active : ""}`}
            onClick={() => setFilterType("pending")}
          >
            <Clock size={14} />
            Pending/Review ({stats.pending})
          </button>
        </div>
      </section>

      {/* Monitoring Table */}
      <section className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Entity Profile</th>
              <th className={styles.th}>Reference ID</th>
              <th className={styles.th}>Risk Level</th>
              <th className={styles.th}>Last Screened</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "60px" }}>
                  <LoadingSpinner text="Loading monitored entities..." />
                </td>
              </tr>
            ) : filteredEntities.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.emptyState}>
                    <Shield size={48} />
                    <h3>No monitored entities found</h3>
                    <p>
                      {searchQuery || filterType !== "all"
                        ? "Try adjusting your filters"
                        : "Start monitoring entities to track risk changes over time"}
                    </p>
                    {!searchQuery && filterType === "all" && (
                      <Link href="/screen" className={styles.emptyStateBtn}>
                        <Plus size={16} />
                        Add Entity
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedEntities.map((entity) => (
                <tr key={entity.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.entityInfo}>
                      <div className={styles.entityIcon}>
                        {entity.entity_id ? <Building2 size={16} /> : <User size={16} />}
                      </div>
                      <div>
                        <div className={styles.entityName}>{entity.query_name}</div>
                        <div className={styles.entityMeta}>
                          {entity.entity_id ? `OS: ${entity.entity_id.slice(0, 12)}...` : "Manual Entry"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <code className={styles.code}>{entity.customer_ref}</code>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.riskBadge} ${getRiskClass(entity.last_risk_level)}`}>
                      {getRiskIcon(entity.last_risk_level)}
                      {getRiskLabel(entity.last_risk_level)}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.dateCell}>
                      <Clock size={14} />
                      {new Date(entity.last_screened_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${entity.status === "active" ? styles.statusActive : styles.statusInactive}`}>
                      <span className={`${styles.statusDot} ${entity.status === "active" ? styles.statusDotActive : styles.statusDotInactive}`}></span>
                      {entity.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <Link
                        href={`/screenings/${entity.id}`}
                        className={styles.actionBtn}
                        title="View Details"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => confirmRemove(entity)}
                        title="Stop Monitoring"
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
        
        {/* Pagination Controls */}
        {!loading && filteredEntities.length > 0 && (
          <div className={styles.paginationContainer}>
            <div className={styles.paginationInfo}>
              <span>
                Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(endIndex, filteredEntities.length)}</strong> of{' '}
                <strong>{filteredEntities.length}</strong> entities
              </span>
              
              <div className={styles.pageSizeSelector}>
                <label htmlFor="pageSize">Rows per page:</label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={styles.pageSizeSelect}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            
            <div className={styles.paginationButtons}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                title="First page"
              >
                {'<<'}
              </button>
              
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous page"
              >
                {'<'}
              </button>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
                ) : (
                  <button
                    key={page}
                    className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Next page"
              >
                {'>'}
              </button>
              
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                title="Last page"
              >
                {'>>'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && entityToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIconWrapper}>
                <AlertTriangle size={24} className={styles.modalIcon} />
              </div>
              <h2 className={styles.modalTitle}>Stop Monitoring</h2>
            </div>
            <div className={styles.modalBody}>
              <p>
                Are you sure you want to stop monitoring <strong>{entityToDelete.query_name}</strong>? 
                This action cannot be undone and you will no longer receive compliance alerts for this entity.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancelBtn} 
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.modalDeleteBtn} 
                onClick={handleRemove}
              >
                Stop Monitoring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
