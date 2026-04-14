"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  User,
  Building2,
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  X,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users
} from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Tooltip } from "../../../components/Tooltip";

interface HistoryItem {
  id: string;
  type: string;
  action: string;
  subject: string;
  subject_type: string;
  user_id: string;
  timestamp: string;
  status: string;
  details?: any;
}

interface HistoryStats {
  period_days: number;
  total_screenings: number;
  individual_screenings: number;
  entity_screenings: number;
  total_cases: number;
  daily_trend: Array<{date: string; count: number}>;
  top_users: Array<{user_id: string; count: number}>;
}

type TabType = "all" | "individual" | "entity" | "audit";

const API_BASE = "/api";

export default function HistoryAuditPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userId, setUserId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const getToken = () => localStorage.getItem("amltab_token");

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const [historyRes, statsRes] = await Promise.all([
        fetch(
          `${API_BASE}/history/${activeTab}?` + new URLSearchParams({
            skip: ((currentPage - 1) * pageSize).toString(),
            limit: pageSize.toString(),
            ...(startDate && { start_date: startDate }),
            ...(endDate && { end_date: endDate }),
            ...(userId && { user_id: userId }),
            ...(statusFilter !== "all" && { status: statusFilter }),
            ...(searchQuery && { search: searchQuery })
          }),
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(`${API_BASE}/history/stats?days=30`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (historyRes.ok && statsRes.ok) {
        const historyData = await historyRes.json();
        setItems(historyData.items || []);
        setTotalItems(historyData.total || 0);
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, startDate, endDate, userId, statusFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    const token = getToken();
    if (!token) return;

    setExporting(true);
    try {
      const res = await fetch(
        `${API_BASE}/history/export?` + new URLSearchParams({
          export_type: activeTab === "audit" ? "audit" : activeTab,
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate })
        }),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeTab}_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setUserId("");
    setStatusFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalItems / pageSize);
  
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const hasActiveFilters = startDate || endDate || userId || statusFilter !== "all" || searchQuery;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'clear':
      case 'resolved':
      case 'completed':
        return styles.statusSuccess;
      case 'match':
      case 'escalated':
      case 'failed':
      case 'breached':
        return styles.statusDanger;
      case 'review':
      case 'pending':
      case 'under_review':
      case 'processing':
        return styles.statusWarning;
      default:
        return styles.statusInfo;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'individual': return <User size={16} />;
      case 'entity': return <Building2 size={16} />;
      case 'case': return <FileText size={16} />;
      case 'bulk': return <Users size={16} />;
      default: return <History size={16} />;
    }
  };

  const tabs = [
    { key: "all" as TabType, label: "All History", icon: <History size={16} /> },
    { key: "individual" as TabType, label: "Individual", icon: <User size={16} /> },
    { key: "entity" as TabType, label: "Entity", icon: <Building2 size={16} /> },
    { key: "audit" as TabType, label: "Audit Logs", icon: <FileText size={16} /> }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>History & Audit</h1>
          <p className={styles.subtitle}>Track all screening and compliance activities</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.exportBtn} 
            onClick={handleExport}
            disabled={exporting}
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      {stats && (
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
              <History size={20} style={{ color: '#6366F1' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Screenings</span>
              <span className={styles.statValue}>{stats.total_screenings}</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <User size={20} style={{ color: '#3B82F6' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Individual</span>
              <span className={styles.statValue} style={{ color: '#3B82F6' }}>{stats.individual_screenings}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Building2 size={20} style={{ color: '#10B981' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Entity</span>
              <span className={styles.statValue} style={{ color: '#10B981' }}>{stats.entity_screenings}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <FileText size={20} style={{ color: '#F59E0B' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Cases</span>
              <span className={styles.statValue} style={{ color: '#F59E0B' }}>{stats.total_cases}</span>
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </section>

      {/* Toolbar */}
      <section className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <button 
            className={`${styles.filterBtn} ${hasActiveFilters ? styles.filterBtnActive : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && <span className={styles.filterBadge}>Active</span>}
          </button>
        </div>
      </section>

      {/* Filter Panel */}
      {showFilters && (
        <section className={styles.filterPanel}>
          <div className={styles.filterPanelHeader}>
            <h3>Filters</h3>
            <div className={styles.filterPanelActions}>
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                <X size={14} />
                Clear All
              </button>
              <button className={styles.closeFilterBtn} onClick={() => setShowFilters(false)}>
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Statuses</option>
                <option value="clear">Clear</option>
                <option value="match">Match</option>
                <option value="review">Review</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* History Table */}
      <section className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <p>Loading history...</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <History size={64} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No history found</h3>
            <p className={styles.emptyText}>
              {hasActiveFilters 
                ? "Try adjusting your filters to see more results."
                : "Your screening history will appear here."}
            </p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>Subject</th>
                  <th className={styles.th}>Action</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>User</th>
                  <th className={styles.th}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Timestamp
                      <Tooltip content="When this action was performed" position="top" />
                    </span>
                  </th>
                  <th className={styles.th} style={{ width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.typeCell}>
                        <span className={styles.typeIcon}>
                          {getTypeIcon(item.type)}
                        </span>
                        <span className={styles.typeLabel}>
                          {item.type === 'individual' ? 'Individual' : 
                           item.type === 'entity' ? 'Entity' :
                           item.type === 'case' ? 'Case' :
                           item.type === 'bulk' ? 'Bulk' : 'Screening'}
                        </span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.subject}>{item.subject}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.action}>{item.action}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {item.user_id?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <span>{item.user_id || 'System'}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.timestampCell}>
                        <Clock size={14} />
                        {formatDate(item.timestamp)}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <Link 
                        href={
                          item.type === 'case' ? `/cases/${item.id}` :
                          item.type === 'bulk' ? `/bulk` :
                          `/screenings/${item.id}`
                        } 
                        className={styles.actionLink}
                        title="View details"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className={styles.paginationContainer}>
                <div className={styles.paginationInfo}>
                  <span>
                    Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
                    <strong>{totalItems}</strong> records
                  </span>
                  
                  <div className={styles.pageSizeSelector}>
                    <label htmlFor="pageSize">Rows per page:</label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className={styles.pageSizeSelect}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
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
          </>
        )}
      </section>
    </div>
  );
}
