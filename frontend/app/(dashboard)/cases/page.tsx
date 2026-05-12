"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  User,
  ShieldAlert,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Users,
  AlertCircle,
  TrendingUp,
  Download,
  MoreVertical,
  CheckSquare,
  Square,
  RotateCcw,
  Zap,
  Shield,
  Eye,
  Check,
  AlertCircle as AlertCircleIcon
} from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Modal } from "../../components/Modal";
import modalStyles from "../../components/Modal.module.css";
import { Tooltip } from "../../components/Tooltip";
import { KanbanBoard } from "./KanbanBoard";

interface Case {
  id: string;
  title: string;
  status: string;
  priority: string;
  case_type: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  due_date?: string;
  customer_ref?: string;
  sla_status?: string;
  time_remaining_hours?: number;
}

interface CaseStats {
  total_cases: number;
  pending_cases: number;
  resolved_cases: number;
  escalated_cases: number;
  sla_breached: number;
  sla_warning: number;
  resolution_rate: number;
  avg_resolution_time: number;
  case_types: Record<string, number>;
  priorities: Record<string, number>;
  open_cases_by_assignee: Array<{username: string; full_name: string; case_count: number}>;
  daily_trend: Array<{date: string; count: number}>;
}

type ViewMode = "table" | "kanban" | "list";
type FilterStatus = "all" | "pending" | "under_review" | "escalated" | "resolved";
type FilterPriority = "all" | "low" | "medium" | "high" | "critical";
type FilterSLA = "all" | "ok" | "warning" | "breached";

const API_BASE = "/api/v1";

export default function CaseInboxPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>("all");
  const [slaFilter, setSlaFilter] = useState<FilterSLA>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Bulk actions
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [bulkResult, setBulkResult] = useState<{success: number; failed: number} | null>(null);
  
  // New Case Modal Tabs
  const [activeTab, setActiveTab] = useState<"manual" | "screening">("manual");
  
  // Manual Case Form states
  const [caseType, setCaseType] = useState("manual_review");
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [casePriority, setCasePriority] = useState("medium");
  const [customerRef, setCustomerRef] = useState("");
  const [isCreatingCase, setIsCreatingCase] = useState(false);

  // Screening Import states
  const [unlinkedScreenings, setUnlinkedScreenings] = useState<any[]>([]);
  const [selectedScreeningIds, setSelectedScreeningIds] = useState<Set<string>>(new Set());
  const [loadingScreenings, setLoadingScreenings] = useState(false);
  
  // Form states
  const [assignUsername, setAssignUsername] = useState("");
  const [escalateReason, setEscalateReason] = useState("");
  const [closeReason, setCloseReason] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Users for assignment dropdown
  const [assignableUsers, setAssignableUsers] = useState<Array<{username: string; full_name: string; role: string; email: string}>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCases, setTotalCases] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Pagination helpers
  const totalPages = Math.ceil(totalCases / pageSize);
  
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

  const getToken = () => localStorage.getItem("amltab_token");

  // Fetch assignable users when assign modal opens
  const fetchAssignableUsers = async () => {
    const token = getToken();
    if (!token) return;
    
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/compliance/cases/assignable-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignableUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const [casesRes, statsRes] = await Promise.all([
        fetch(
          `${API_BASE}/compliance/cases?` + new URLSearchParams({
            skip: ((currentPage - 1) * pageSize).toString(),
            limit: pageSize.toString(),
            ...(statusFilter !== "all" && { status: statusFilter }),
            ...(priorityFilter !== "all" && { priority: priorityFilter }),
            ...(slaFilter !== "all" && { sla_status: slaFilter }),
            ...(searchQuery && { search: searchQuery })
          }),
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(`${API_BASE}/compliance/cases/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (casesRes.ok && statsRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.cases || []);
        setTotalCases(casesData.total || 0);
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch compliance cases:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, priorityFilter, slaFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCaseSelection = (caseId: string) => {
    const newSelected = new Set(selectedCases);
    if (newSelected.has(caseId)) {
      newSelected.delete(caseId);
    } else {
      newSelected.add(caseId);
    }
    setSelectedCases(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAllCases = () => {
    if (selectedCases.size === cases.length) {
      setSelectedCases(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedCases(new Set(cases.map(c => c.id)));
      setShowBulkActions(true);
    }
  };

  const getPriorityClass = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'critical': return styles.priorityCritical;
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      default: return styles.priorityLow;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return styles.statusPending;
      case 'under_review': return styles.statusReview;
      case 'escalated': return styles.statusEscalated;
      case 'resolved': return styles.statusResolved;
      default: return "";
    }
  };

  const getSLAClass = (slaStatus: string) => {
    switch(slaStatus) {
      case 'breached': return styles.slaBreached;
      case 'warning': return styles.slaWarning;
      default: return styles.slaOk;
    }
  };

  const formatTimeRemaining = (hours?: number) => {
    if (hours === undefined) return "N/A";
    if (hours < 0) return `${Math.abs(Math.floor(hours))}h overdue`;
    if (hours < 1) return `${Math.floor(hours * 60)}m left`;
    if (hours < 24) return `${Math.floor(hours)}h left`;
    return `${Math.floor(hours / 24)}d left`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSlaFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || slaFilter !== "all" || searchQuery;

  // Reset modal states
  const resetModals = () => {
    setShowAssignModal(false);
    setShowEscalateModal(false);
    setShowCloseModal(false);
    setShowNewCaseModal(false);
    setBulkResult(null);
    setAssignUsername("");
    setEscalateReason("");
    setCloseReason("");
    setProcessing(false);
    setShowUserDropdown(false);
    setAssignableUsers([]);
    
    // Reset New Case Form
    setCaseType("manual_review");
    setCaseTitle("");
    setCaseDescription("");
    setCasePriority("medium");
    setCustomerRef("");
    setIsCreatingCase(false);
    setActiveTab("manual");
    setUnlinkedScreenings([]);
    setSelectedScreeningIds(new Set());
  };

  // Bulk action handlers
  const openBulkAssign = () => {
    setAssignUsername("");
    setBulkResult(null);
    setShowAssignModal(true);
    fetchAssignableUsers();
  };

  const handleBulkAssign = async () => {
    const token = getToken();
    if (!token || selectedCases.size === 0 || !assignUsername.trim()) return;
    
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/compliance/cases/bulk/assign`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          case_ids: Array.from(selectedCases),
          assigned_to: assignUsername.trim(),
          reason: "Bulk assignment from case list"
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        setBulkResult({ success: result.success, failed: result.failed });
        setTimeout(() => {
          resetModals();
          setSelectedCases(new Set());
          setShowBulkActions(false);
          fetchData();
        }, 2000);
      }
    } catch (err) {
      console.error("Bulk assign error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const openBulkEscalate = () => {
    setEscalateReason("");
    setBulkResult(null);
    setShowEscalateModal(true);
  };

  const handleBulkEscalate = async () => {
    const token = getToken();
    if (!token || selectedCases.size === 0 || !escalateReason.trim()) return;
    
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/compliance/cases/bulk/escalate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          case_ids: Array.from(selectedCases),
          reason: escalateReason.trim()
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        setBulkResult({ success: result.success, failed: result.failed });
        setTimeout(() => {
          resetModals();
          setSelectedCases(new Set());
          setShowBulkActions(false);
          fetchData();
        }, 2000);
      }
    } catch (err) {
      console.error("Bulk escalate error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const openBulkClose = () => {
    setCloseReason("");
    setBulkResult(null);
    setShowCloseModal(true);
  };

  const handleBulkClose = async () => {
    const token = getToken();
    if (!token || selectedCases.size === 0 || !closeReason.trim()) return;
    
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/compliance/cases/bulk/close`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          case_ids: Array.from(selectedCases),
          reason: closeReason.trim()
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        setBulkResult({ success: result.success, failed: result.failed });
        setTimeout(() => {
          resetModals();
          setSelectedCases(new Set());
          setShowBulkActions(false);
          fetchData();
        }, 2000);
      }
    } catch (err) {
      console.error("Bulk close error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    const token = getToken();
    if (!token) return;

    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem || caseItem.status === newStatus) return;

    // Optimistic update
    const previousCases = [...cases];
    setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c));

    try {
      const res = await fetch(`${API_BASE}/compliance/cases/${caseId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      
      // Refresh stats
      const statsRes = await fetch(`${API_BASE}/compliance/cases/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      // Rollback
      setCases(previousCases);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    if (caseTitle.length < 5) {
      alert("Title must be at least 5 characters");
      return;
    }
    if (caseDescription.length < 10) {
      alert("Description must be at least 10 characters");
      return;
    }

    setIsCreatingCase(true);
    try {
      const res = await fetch(`${API_BASE}/compliance/cases`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          case_type: caseType,
          title: caseTitle,
          description: caseDescription,
          priority: casePriority,
          customer_ref: customerRef || null
        })
      });

      if (res.ok) {
        setShowNewCaseModal(false);
        resetModals();
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to create case: ${err.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Create case error:", err);
      alert("Network error creating case");
    } finally {
      setIsCreatingCase(false);
    }
  };

  const fetchUnlinkedScreenings = async () => {
    const token = getToken();
    if (!token) return;

    setLoadingScreenings(true);
    try {
      const res = await fetch(`${API_BASE}/compliance/cases/unlinked-screenings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUnlinkedScreenings(await res.json());
      }
    } catch (err) {
      console.error("Fetch unlinked screenings error:", err);
    } finally {
      setLoadingScreenings(false);
    }
  };

  const handleBulkImportScreenings = async () => {
    const token = getToken();
    if (!token || selectedScreeningIds.size === 0) return;

    setIsCreatingCase(true);
    try {
      const res = await fetch(`${API_BASE}/compliance/cases/bulk-create-from-screenings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          screening_result_ids: Array.from(selectedScreeningIds),
          priority: "medium"
        })
      });

      if (res.ok) {
        setShowNewCaseModal(false);
        resetModals();
        fetchData();
      }
    } catch (err) {
      console.error("Bulk import error:", err);
    } finally {
      setIsCreatingCase(false);
    }
  };

  const toggleScreeningSelection = (id: string) => {
    const next = new Set(selectedScreeningIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedScreeningIds(next);
  };

  const handleExport = () => {
    // Convert cases to CSV
    const headers = ["ID", "Title", "Status", "Priority", "Type", "Assigned To", "Created", "SLA Status"];
    const csvRows = [headers.join(",")];
    
    cases.forEach(c => {
      const row = [
        c.id,
        `"${c.title.replace(/"/g, '""')}"`,
        c.status,
        c.priority,
        c.case_type,
        c.assigned_to || "Unassigned",
        new Date(c.created_at).toLocaleDateString(),
        c.sla_status || "N/A"
      ];
      csvRows.push(row.join(","));
    });
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cases_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Compliance & Case Management</h1>
          <p className={styles.subtitle}>Manage and track all compliance cases</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'kanban' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button className={styles.exportBtn} onClick={handleExport} title="Export Cases">
            <Download size={16} />
            Export
          </button>
          <button className={styles.primaryBtn} onClick={() => setShowNewCaseModal(true)}>
            <Plus size={18} />
            New Case
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      {stats && (
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
              <Inbox size={20} style={{ color: '#6366F1' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Cases</span>
              <span className={styles.statValue}>{stats.total_cases}</span>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Clock size={20} style={{ color: '#F59E0B' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Pending Review</span>
              <span className={styles.statValue} style={{ color: '#F59E0B' }}>{stats.pending_cases}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <AlertTriangle size={20} style={{ color: '#EF4444' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>SLA Breached</span>
              <span className={styles.statValue} style={{ color: '#EF4444' }}>{stats.sla_breached}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <CheckCircle2 size={20} style={{ color: '#22C55E' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Resolved</span>
              <span className={styles.statValue} style={{ color: '#22C55E' }}>{stats.resolved_cases}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
              <TrendingUp size={20} style={{ color: '#6366F1' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Resolution Rate</span>
              <span className={styles.statValue}>{stats.resolution_rate.toFixed(1)}%</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
              <Clock size={20} style={{ color: '#94A3B8' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Avg Resolution</span>
              <span className={styles.statValue}>{stats.avg_resolution_time}h</span>
            </div>
          </div>
        </section>
      )}

      {/* Filters & Bulk Actions */}
      <section className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search cases..."
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

        {showBulkActions && (
          <div className={styles.bulkActions}>
            <span className={styles.selectedCount}>{selectedCases.size} selected</span>
            <button className={styles.bulkBtn} onClick={openBulkAssign} title="Assign">
              <Users size={16} />
              Assign
            </button>
            <button className={styles.bulkBtn} onClick={openBulkEscalate} title="Escalate">
              <Zap size={16} />
              Escalate
            </button>
            <button className={styles.bulkBtn} onClick={openBulkClose} title="Close">
              <CheckCircle2 size={16} />
              Close
            </button>
          </div>
        )}
      </section>

      {/* Filter Panel */}
      {showFilters && (
        <section className={styles.filterPanel}>
          <div className={styles.filterPanelHeader}>
            <h3>Filters</h3>
            <div className={styles.filterPanelActions}>
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                <RotateCcw size={14} />
                Clear All
              </button>
              <button className={styles.closeFilterBtn} onClick={() => setShowFilters(false)}>
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className={styles.filterSelect}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Priority</label>
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
                className={styles.filterSelect}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>SLA Status</label>
              <select 
                value={slaFilter}
                onChange={(e) => setSlaFilter(e.target.value as FilterSLA)}
                className={styles.filterSelect}
              >
                <option value="all">All SLA</option>
                <option value="ok">OK</option>
                <option value="warning">Warning</option>
                <option value="breached">Breached</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Cases Table / Kanban */}
      <section className={`${styles.tableContainer} ${viewMode === 'kanban' ? styles.kanbanContainer : ''}`}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <p>Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={64} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No cases found</h3>
            <p className={styles.emptyText}>
              {hasActiveFilters 
                ? "Try adjusting your filters to see more results."
                : "Create your first case to get started."}
            </p>
            {!hasActiveFilters && (
              <button 
                className={styles.primaryBtn} 
                style={{ marginTop: '20px' }}
                onClick={() => setShowNewCaseModal(true)}
              >
                <Plus size={18} />
                Create Case
              </button>
            )}
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard cases={cases} onStatusChange={handleStatusChange} />
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} style={{ width: '40px' }}>
                    <button 
                      className={styles.checkbox}
                      onClick={selectAllCases}
                    >
                      {selectedCases.size === cases.length ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className={styles.th}>Case Title</th>
                  <th className={styles.th}>Priority</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>Assigned To</th>
                  <th className={styles.th}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      SLA
                      <Tooltip content="Service Level Agreement: Time remaining to resolve this case. Green = OK, Amber = Warning (&lt;24h), Red = Breached (overdue)" />
                    </span>
                  </th>
                  <th className={styles.th}>Created</th>
                  <th className={styles.th} style={{ width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.id} className={`${styles.tr} ${selectedCases.has(caseItem.id) ? styles.trSelected : ''}`}>
                    <td className={styles.td}>
                      <button 
                        className={styles.checkbox}
                        onClick={() => toggleCaseSelection(caseItem.id)}
                      >
                        {selectedCases.has(caseItem.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className={styles.td}>
                      <Link href={`/cases/${caseItem.id}`} className={styles.caseLink}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={styles.caseTitle}>{caseItem.title}</span>
                          {caseItem.customer_ref && (
                            <span className={styles.caseRef}>Ref: {caseItem.customer_ref}</span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.priorityBadge} ${getPriorityClass(caseItem.priority)}`}>
                        {caseItem.priority}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${getStatusClass(caseItem.status)}`}>
                        {caseItem.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.caseType}>
                        {caseItem.case_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.assignee}>
                        <div className={styles.avatar}>
                          {caseItem.assigned_to?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <span>{caseItem.assigned_to || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      {caseItem.sla_status && (
                        <span className={`${styles.slaBadge} ${getSLAClass(caseItem.sla_status)}`}>
                          {formatTimeRemaining(caseItem.time_remaining_hours)}
                        </span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.date}>{formatDate(caseItem.created_at)}</span>
                    </td>
                    <td className={styles.td}>
                      <Link href={`/cases/${caseItem.id}`} className={styles.actionLink}>
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalCases > 0 && (
              <div className={styles.paginationContainer}>
                <div className={styles.paginationInfo}>
                  <span>
                    Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, totalCases)}</strong> of{' '}
                    <strong>{totalCases}</strong> cases
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

      {/* Bulk Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={resetModals}
        title="Bulk Assign Cases"
        size="medium"
        footer={
          bulkResult ? (
            <button className={modalStyles.btn} onClick={resetModals} style={{ background: 'var(--primary)', color: 'white' }}>
              Done
            </button>
          ) : (
            <>
              <button className={modalStyles.btn} onClick={resetModals} style={{ background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button 
                className={modalStyles.btn}
                onClick={handleBulkAssign}
                disabled={!assignUsername.trim() || processing}
                style={{
                  background: assignUsername.trim() && !processing ? 'var(--primary)' : 'var(--border)',
                  color: assignUsername.trim() && !processing ? 'white' : 'var(--secondary)',
                  cursor: assignUsername.trim() && !processing ? 'pointer' : 'not-allowed'
                }}
              >
                {processing ? "Assigning..." : `Assign ${selectedCases.size} Case${selectedCases.size > 1 ? 's' : ''}`}
              </button>
            </>
          )
        }
      >
        {bulkResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Check size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 8px 0' }}>Assignment Complete</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', margin: '0 0 20px 0', lineHeight: 1.6 }}>Cases have been assigned successfully</p>
            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>{bulkResult.success}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 4 }}>Success</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{bulkResult.failed}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 4 }}>Failed</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, padding: 16, backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 12, marginBottom: 20 }}>
              <AlertCircleIcon size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 4px 0' }}>Assign {selectedCases.size} Case{selectedCases.size > 1 ? 's' : ''}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)', margin: 0, lineHeight: 1.5 }}>Enter the username to assign these cases to. The assignee will receive notifications.</p>
              </div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
                <CheckSquare size={16} />
                Selected Cases
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.from(selectedCases).map(id => {
                  const caseItem = cases.find(c => c.id === id);
                  return caseItem ? (
                    <div key={id} style={{ 
                      flexShrink: 0, 
                      fontSize: '0.85rem', 
                      color: 'var(--foreground)', 
                      padding: '10px 14px', 
                      backgroundColor: 'var(--primary-soft)', 
                      border: '1px solid var(--border)',
                      borderLeft: '4px solid var(--primary)',
                      borderRadius: '8px', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontWeight: 500,
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {caseItem.title}
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Select User <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => !loadingUsers && setShowUserDropdown(!showUserDropdown)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: showUserDropdown ? 'var(--surface)' : 'var(--surface-hover)',
                    border: `1px solid ${showUserDropdown ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    color: assignUsername ? 'var(--foreground)' : 'var(--secondary)',
                    fontSize: '0.875rem',
                    cursor: loadingUsers ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                >
                  {loadingUsers ? (
                    <span>Loading users...</span>
                  ) : assignUsername ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        {assignableUsers.find(u => u.username === assignUsername)?.full_name?.slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                          {assignableUsers.find(u => u.username === assignUsername)?.full_name || assignUsername}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                          {assignableUsers.find(u => u.username === assignUsername)?.role}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span>Select a user...</span>
                  )}
                  {showUserDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                
                {showUserDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100
                  }}>
                    {assignableUsers.map(user => (
                      <div
                        key={user.username}
                        onClick={() => {
                          setAssignUsername(user.username);
                          setShowUserDropdown(false);
                        }}
                        style={{
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: assignUsername === user.username ? 'var(--primary-light)' : 'transparent',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (assignUsername !== user.username) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (assignUsername !== user.username) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          flexShrink: 0
                        }}>
                          {user.full_name?.slice(0, 2).toUpperCase() || user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>
                            {user.full_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                            {user.role}
                          </div>
                        </div>
                        {assignUsername === user.username && (
                          <Check size={16} style={{ color: 'var(--primary)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 6 }}>Select the user to assign these cases to</p>
            </div>
          </>
        )}
      </Modal>

      {/* Bulk Escalate Modal */}
      <Modal
        isOpen={showEscalateModal}
        onClose={resetModals}
        title="Bulk Escalate Cases"
        size="medium"
        footer={
          bulkResult ? (
            <button className={modalStyles.btn} onClick={resetModals} style={{ background: 'var(--primary)', color: 'white' }}>
              Done
            </button>
          ) : (
            <>
              <button className={modalStyles.btn} onClick={resetModals} style={{ background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button
                className={modalStyles.btn}
                onClick={handleBulkEscalate}
                disabled={!escalateReason.trim() || processing}
                style={{
                  background: escalateReason.trim() && !processing ? '#ef4444' : 'var(--border)',
                  color: escalateReason.trim() && !processing ? 'white' : 'var(--secondary)',
                  cursor: escalateReason.trim() && !processing ? 'pointer' : 'not-allowed'
                }}
              >
                {processing ? "Escalating..." : `Escalate ${selectedCases.size} Case${selectedCases.size > 1 ? 's' : ''}`}
              </button>
            </>
          )
        }
      >
        {bulkResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Check size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 8px 0' }}>Escalation Complete</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', margin: '0 0 20px 0', lineHeight: 1.6 }}>Cases have been escalated successfully</p>
            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>{bulkResult.success}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 4 }}>Success</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{bulkResult.failed}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 4 }}>Failed</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, padding: 16, backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 12, marginBottom: 20 }}>
              <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 4px 0' }}>Escalate {selectedCases.size} Case{selectedCases.size > 1 ? 's' : ''}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)', margin: 0, lineHeight: 1.5 }}>Escalated cases will be flagged for supervisor review. Please provide a reason for escalation.</p>
              </div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
                <CheckSquare size={16} />
                Selected Cases
              </div>
              <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Array.from(selectedCases).slice(0, 5).map(id => {
                  const caseItem = cases.find(c => c.id === id);
                  return caseItem ? (
                    <div key={id} style={{ fontSize: '0.8125rem', color: 'var(--secondary)', padding: '4px 8px', backgroundColor: 'var(--surface-hover)', borderRadius: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {caseItem.title}
                    </div>
                  ) : null;
                })}
                {selectedCases.size > 5 && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--secondary)', padding: '4px 8px', backgroundColor: 'var(--surface-hover)', borderRadius: 6 }}>
                    +{selectedCases.size - 5} more...
                  </div>
                )}
              </div>
            </div>

            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Escalation Reason <span style={{ color: 'var(--danger)' }}>*</span></label>
              <textarea
                className={modalStyles.textarea}
                placeholder="Enter reason for escalation..."
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                rows={4}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 6 }}>This will be recorded in the case history</p>
            </div>
          </>
        )}
      </Modal>

      {/* Bulk Close Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={resetModals}
        title="Bulk Close Cases"
        size="medium"
        footer={
          bulkResult ? (
            <button className={modalStyles.btn} onClick={resetModals} style={{ background: 'var(--primary)', color: 'white' }}>
              Done
            </button>
          ) : (
            <>
              <button className={modalStyles.btn} onClick={resetModals} style={{ background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button
                className={modalStyles.btn}
                onClick={handleBulkClose}
                disabled={!closeReason.trim() || processing}
                style={{
                  background: closeReason.trim() && !processing ? 'var(--primary)' : 'var(--border)',
                  color: closeReason.trim() && !processing ? 'white' : 'var(--secondary)',
                  cursor: closeReason.trim() && !processing ? 'pointer' : 'not-allowed'
                }}
              >
                {processing ? "Closing..." : `Close ${selectedCases.size} Case${selectedCases.size > 1 ? 's' : ''}`}
              </button>
            </>
          )
        }
      >
        {bulkResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Check size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 8px 0' }}>Cases Closed</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', margin: '0 0 20px 0', lineHeight: 1.6 }}>Cases have been resolved successfully</p>
            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>{bulkResult.success}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 4 }}>Success</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{bulkResult.failed}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 4 }}>Failed</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, padding: 16, backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 12, marginBottom: 20 }}>
              <CheckCircle2 size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 4px 0' }}>Close {selectedCases.size} Case{selectedCases.size > 1 ? 's' : ''}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--secondary)', margin: 0, lineHeight: 1.5 }}>Closing cases will mark them as resolved. Please provide closure notes for audit trail.</p>
              </div>
            </div>

            <div style={{ padding: 16, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
                <CheckSquare size={16} />
                Selected Cases
              </div>
              <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Array.from(selectedCases).slice(0, 5).map(id => {
                  const caseItem = cases.find(c => c.id === id);
                  return caseItem ? (
                    <div key={id} style={{ fontSize: '0.8125rem', color: 'var(--secondary)', padding: '4px 8px', backgroundColor: 'var(--surface-hover)', borderRadius: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {caseItem.title}
                    </div>
                  ) : null;
                })}
                {selectedCases.size > 5 && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--secondary)', padding: '4px 8px', backgroundColor: 'var(--surface-hover)', borderRadius: 6 }}>
                    +{selectedCases.size - 5} more...
                  </div>
                )}
              </div>
            </div>

            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Closure Reason <span style={{ color: 'var(--danger)' }}>*</span></label>
              <textarea
                className={modalStyles.textarea}
                placeholder="Enter reason for closure..."
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                rows={4}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 6 }}>This will be saved as resolution notes</p>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={showNewCaseModal}
        onClose={() => !isCreatingCase && resetModals()}
        title="Create New Case"
        size="large"
        footer={
          <>
            <button 
              className={modalStyles.btn} 
              onClick={resetModals} 
              disabled={isCreatingCase}
              style={{ background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            {activeTab === "manual" ? (
              <button 
                className={modalStyles.btn} 
                onClick={handleCreateCase}
                disabled={isCreatingCase || !caseTitle || !caseDescription}
                style={{ 
                  background: (isCreatingCase || !caseTitle || !caseDescription) ? 'var(--border)' : 'var(--primary)', 
                  color: 'white' 
                }}
              >
                {isCreatingCase ? "Creating..." : "Create Case"}
              </button>
            ) : (
              <button 
                className={modalStyles.btn} 
                onClick={handleBulkImportScreenings}
                disabled={isCreatingCase || selectedScreeningIds.size === 0}
                style={{ 
                  background: (isCreatingCase || selectedScreeningIds.size === 0) ? 'var(--border)' : 'var(--primary)', 
                  color: 'white' 
                }}
              >
                {isCreatingCase ? "Importing..." : `Import ${selectedScreeningIds.size} Screening${selectedScreeningIds.size !== 1 ? 's' : ''}`}
              </button>
            )}
          </>
        }
      >
        <div className={styles.modalTabs}>
          <button 
            className={`${styles.modalTab} ${activeTab === 'manual' ? styles.modalTabActive : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Form
          </button>
          <button 
            className={`${styles.modalTab} ${activeTab === 'screening' ? styles.modalTabActive : ''}`}
            onClick={() => {
              setActiveTab('screening');
              fetchUnlinkedScreenings();
            }}
          >
            Import from Screening
          </button>
        </div>

        {activeTab === "manual" ? (
          <div className={modalStyles.form} style={{ padding: '20px 0' }}>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Case Type <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select
                className={modalStyles.select}
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                disabled={isCreatingCase}
              >
                <option value="manual_review">Manual Review</option>
                <option value="customer_request">Customer Request</option>
                <option value="regulatory_inquiry">Regulatory Inquiry</option>
                <option value="screening_match">Screening Match</option>
              </select>
            </div>

            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Priority <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['low', 'medium', 'high', 'critical'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCasePriority(p)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: casePriority === p ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: casePriority === p ? 'var(--primary-light)' : 'var(--surface)',
                      color: casePriority === p ? 'var(--primary)' : 'var(--secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    disabled={isCreatingCase}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Case Title <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                className={modalStyles.input}
                placeholder="E.g., Manual Investigation: High Risk Transaction"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                disabled={isCreatingCase}
              />
            </div>

            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Description <span style={{ color: 'var(--danger)' }}>*</span></label>
              <textarea
                className={modalStyles.textarea}
                placeholder="Provide detailed context for this investigation..."
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                rows={4}
                disabled={isCreatingCase}
              />
            </div>

            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Customer Reference (Optional)</label>
              <input
                type="text"
                className={modalStyles.input}
                placeholder="E.g., CUST-123456"
                value={customerRef}
                onChange={(e) => setCustomerRef(e.target.value)}
                disabled={isCreatingCase}
              />
            </div>
          </div>
        ) : (
          <div className={styles.screeningImportList}>
            {loadingScreenings ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <LoadingSpinner />
                <p style={{ marginTop: '16px', color: 'var(--secondary)' }}>Loading unlinked screenings...</p>
              </div>
            ) : unlinkedScreenings.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Inbox size={48} style={{ color: 'var(--border)', marginBottom: '16px' }} />
                <h4 style={{ color: 'var(--foreground)' }}>No unlinked screenings found</h4>
                <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>All recent screenings already have associated cases.</p>
              </div>
            ) : (
              <div className={styles.screeningGrid}>
                {unlinkedScreenings.map((s) => (
                  <div 
                    key={s.id} 
                    className={`${styles.screeningItem} ${selectedScreeningIds.has(s.id) ? styles.screeningItemActive : ''}`}
                    onClick={() => toggleScreeningSelection(s.id)}
                  >
                    <div className={styles.screeningCheck}>
                      {selectedScreeningIds.has(s.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                    <div className={styles.screeningInfo}>
                      <span className={styles.screeningName}>{s.customer_name}</span>
                      <div className={styles.screeningMeta}>
                        <span>{new Date(s.screened_at).toLocaleDateString()}</span>
                        <span className={`${styles.riskBadge} ${styles['risk' + s.risk_level]}`}>{s.risk_level}</span>
                      </div>
                    </div>
                    <div className={styles.screeningMatches}>
                      <span className={styles.matchCount}>{s.match_count} Matches</span>
                      <span className={styles.matchStatus}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
