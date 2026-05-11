"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  FileText,
  Check,
  ArrowLeft,
  ShieldCheck,
  Clock,
  User,
  Building2,
  Globe,
  AlertCircle,
  Database,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  X,
  Info,
  ShieldAlert,
  MessageSquare,
  Calendar,
  Layers,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Copy
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "./modern-detail.module.css";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Modal } from "../../../components/Modal";

// --- Types ---
interface Match {
  id?: string;
  match_id?: string;  // System-generated match number (e.g., "M-1", "M-2")
  entity_id?: string;
  status?: string;
  // Per-match analyst decision fields (populated by the backend)
  decision?: string;          // 'True Match' | 'False Positive'
  decision_note?: string;     // Analyst's justification note
  decision_author?: string;   // Username of the reviewer
  decision_date?: string;     // ISO timestamp of the decision
  name: string;
  match_score: number;
  match_type: string;
  risk_level?: string;
  primary_topic?: string;
  topics?: string[];
  datasets?: string[];
  details?: any;
  sources?: any[];
  birth_dates?: string[];
  nationalities?: string[];
  countries?: string[];
  id_numbers?: string[];
  positions?: string[];
  gender?: string[];
  sanctions?: any[];
  passports?: any[];
  aliases?: string[];
}

interface ScreeningDetail {
  screening_id: string;
  query: {
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    date_of_birth: string | null;
  };
  timestamp: string;
  overall_status: string;
  risk_level: string;
  monitoring_enabled?: boolean;
  decision?: string;
  notes?: string;
  matches: Match[];
  summary: {
    total_matches: number;
    max_score: number;
  };
}

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '16px 24px',
      borderRadius: '12px',
      backgroundColor: type === 'success' ? '#065f46' : type === 'error' ? '#991b1b' : '#1e3a8a',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out'
    }}>
      {type === 'success' ? <CheckCircle2 size={18} /> : type === 'error' ? <XCircle size={18} /> : <Info size={18} />}
      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}>
        <X size={14} />
      </button>
    </div>
  );
};

export default function ScreeningDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<ScreeningDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Review state
  const [decision, setDecision] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [togglingMonitoring, setTogglingMonitoring] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingMatchUpdate, setPendingMatchUpdate] = useState<{
    entityId: string; // Stores match_number (e.g., "M-1") for API call
    status: string;
    name: string;
    matchIndex?: number;
  } | null>(null);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    addToast("Screening ID copied to clipboard", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeepDive = (entityId: string, matchName?: string) => {
    // Validate entity_id before navigation
    if (!entityId) {
      addToast("Error: Cannot open deep dive - entity ID not available for this match", "error");
      return;
    }
    
    setIsNavigating(true);
    router.push(`/screenings/entity/${entityId}?sid=${id}`);
  };

  const handleToggleMonitoring = async () => {
    const token = localStorage.getItem("amltab_token");
    if (!token) return;

    // Optimistic update
    const previousEnabled = data?.monitoring_enabled;
    setData(prev => prev ? { ...prev, monitoring_enabled: !prev.monitoring_enabled } : prev);

    try {
      setTogglingMonitoring(true);
      const res = await fetch(`${API_URL}/screen/${id}/monitor`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        // Sync with server response
        setData(prev => prev ? { ...prev, monitoring_enabled: result.monitoring_enabled } : prev);
        addToast(result.monitoring_enabled ? "Customer Profile Active Monitoring Enabled!" : "Monitoring Deactivated.", "success");
        // Refresh history to show monitoring action
        fetchHistory();
      } else {
        // Revert optimistic update on error
        setData(prev => prev ? { ...prev, monitoring_enabled: previousEnabled } : prev);
        addToast("Failed to toggle monitoring status.", "error");
      }
    } catch (err) {
      // Revert optimistic update on error
      setData(prev => prev ? { ...prev, monitoring_enabled: previousEnabled } : prev);
      addToast("Network error toggling monitoring.", "error");
    } finally {
      setTogglingMonitoring(false);
    }
  };

  const handleDownloadReport = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      addToast("Generating report, this may take a moment...", "info");
      const res = await fetch(`${API_URL}/screen/${id}/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        
        let filename = `AML_Report_${id}.pdf`;
        const disposition = res.headers.get("Content-Disposition");
        if (disposition && disposition.indexOf("filename=") !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        addToast("Report downloaded successfully!", "success");
      } else {
        addToast("Failed to download report. It may not be available yet.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error downloading report", "error");
    }
  };

  const handleDownloadSummaryReport = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      addToast("Generating executive match summary...", "info");
      const res = await fetch(`${API_URL}/screen/${id}/summary-report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        
        let filename = `Summary_Report_${id}.pdf`;
        const disposition = res.headers.get("Content-Disposition");
        if (disposition && disposition.indexOf("filename=") !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matchesRegex = filenameRegex.exec(disposition);
          if (matchesRegex != null && matchesRegex[1]) { 
            filename = matchesRegex[1].replace(/['"]/g, '');
          }
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        addToast("Match summary downloaded successfully!", "success");
      } else {
        addToast("Failed to download summary report.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error downloading summary report", "error");
    }
  };

  const API_URL = "/api/v1";

  const fetchDetail = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/screen/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setDecision(result.decision || result.overall_status.toLowerCase() || "");
        setNotes(result.notes || "");
      } else {
        setError("Screening record not found.");
      }
    } catch (err) {
      setError("System error fetching screening details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      setHistoryLoading(true);
      const res = await fetch(`${API_URL}/screen/${id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setHistory(result);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
      fetchHistory();
    }
  }, [id]);

  const handleSubmitReview = async () => {
    const token = localStorage.getItem("amltab_token");
    if (!token || !decision) return;

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/screen/${id}/review`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ decision, notes })
      });

      if (res.ok) {
        addToast("Review submitted successfully!", "success");
        fetchDetail();
        fetchHistory();
      } else {
        const err = await res.json();
        addToast(`Failed: ${err.detail || "Error"}`, "error");
      }
    } catch (err) {
      addToast("Network error submitting review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMatchStatusUpdate = (matchIdx: number, matchId: string, matchStatus: string, matchName?: string) => {
    // Use match_id (M-1, M-2, etc.) as the primary identifier
    const match = data?.matches[matchIdx];
    const finalMatchId = match?.match_id || matchId || `M-${matchIdx + 1}`;

    setPendingMatchUpdate({
      entityId: finalMatchId, // Stores match_id like "M-1"
      status: matchStatus,
      name: match?.name || matchName || "this candidate",
      matchIndex: matchIdx
    });
    setIsModalOpen(true);
  };

  const confirmMatchStatusUpdate = async (note: string) => {
    if (!pendingMatchUpdate) return;

    const token = localStorage.getItem("amltab_token");
    if (!token) return;

    // Validate that match_id is present
    if (!pendingMatchUpdate.entityId) {
      addToast("Error: Missing match ID for this match", "error");
      setIsModalOpen(false);
      setPendingMatchUpdate(null);
      return;
    }

    const mappedStatus = pendingMatchUpdate.status === 'matched' ? 'True Match' : 'False Positive';
    setIsModalOpen(false); // Close immediately for responsiveness

    // Optimistically update the UI immediately using match index
    setData(prev => {
      if (!prev) return prev;
      const updatedMatches = prev.matches.map((m, idx) => {
        if (idx === pendingMatchUpdate.matchIndex) {
          return {
            ...m,
            decision: mappedStatus,
            decision_note: note,
            decision_author: 'You',
            decision_date: new Date().toISOString()
          };
        }
        return m;
      });
      return { ...prev, matches: updatedMatches };
    });

    try {
      setSubmitting(true);
      // Use match_id based endpoint
      const res = await fetch(`${API_URL}/screen/${id}/matches/${pendingMatchUpdate.entityId}/decision`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: mappedStatus,
          note: note
        })
      });

      if (res.ok) {
        addToast(`Match successfully formally designated as ${mappedStatus}`, "success");
        // Refetch to sync with server data
        await fetchDetail();
        fetchHistory();
      } else {
        const errorData = await res.json();
        addToast(`Failed: ${errorData.detail || 'System error'}`, "error");
        // Revert optimistic update on failure - refetch original data
        await fetchDetail();
      }
    } catch (err) {
      addToast("Network failure updating match status", "error");
      // Revert optimistic update on error - refetch original data
      await fetchDetail();
    } finally {
      setSubmitting(false);
      setPendingMatchUpdate(null);
    }
  };

  if (loading || isNavigating) {
    const loaderText = isNavigating ? "Synthesizing Entity Dossier..." : "Retrieving screening intelligence...";
    return (
      <div className={styles.container}>
        {/* Results Header - Pre-rendered */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div className={styles.backBtn} style={{ opacity: 0.5 }}>
            <ArrowLeft size={14} /> Screen results list archive
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <div className="skeleton" style={{ width: '120px', height: '36px', borderRadius: '10px', opacity: 0.3 }}></div>
             <div className="skeleton" style={{ width: '120px', height: '36px', borderRadius: '10px', opacity: 0.3 }}></div>
          </div>
        </div>

        {isNavigating ? (
          <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
             <div className="pulsate" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.2em' }}>INTEL SYNTHESIS IN PROGRESS</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '8px' }}>{loaderText}</div>
             </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border)', 
                borderRadius: '16px', 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                opacity: 1 - (i * 0.15)
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <div className="skeleton" style={{ width: '250px', height: '24px' }}></div>
                   <div className="skeleton" style={{ width: '100px', height: '24px' }}></div>
                </div>
                <div className="skeleton" style={{ width: '100%', height: '14px', borderRadius: '4px' }}></div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div>
                   <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  if (error || !data) return (
    <div className={styles.container} style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          marginBottom: '8px'
        }}>
          <ShieldAlert size={40} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 8px 0' }}>
            Record Not Found
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
            {error || "The requested screening intelligence dossier could not be located. It may have been deleted or the ID is incorrect."}
          </p>
        </div>
        <button 
          onClick={() => router.back()} 
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            marginTop: '8px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
          }}
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    </div>
  );

  const subjectName = data.query.company_name || `${data.query.first_name || ""} ${data.query.last_name || ""}`;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft size={16} /> Back to Screening List
          </button>
          <h1 className={styles.title}>{subjectName}</h1>
          <div className={styles.metaInfo}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Screening ID: <code style={{ fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.8 }}>{data.screening_id}</code>
              <button 
                onClick={() => copyToClipboard(data.screening_id)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === data.screening_id ? '#10b981' : 'var(--secondary)', padding: '2px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                title="Copy Screening ID"
              >
                {copiedId === data.screening_id ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> {new Date(data.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          {data.matches && data.matches.length > 0 ? (
            <button 
              className={styles.iconBtn} 
              onClick={handleDownloadSummaryReport}
              style={{ background: 'var(--primary)', color: 'white' }}
            >
               <FileText size={16} /> Summary Report 
            </button>
          ) : (
            <button 
              className={styles.iconBtn} 
              onClick={handleDownloadReport}
              style={{ background: '#10b981', color: 'white' }}
            >
              <Download size={16} /> Clearance Report
            </button>
          )}
          
          <button 
            className={`${styles.iconBtn} ${data.monitoring_enabled ? styles.monitoringActiveBtn : styles.primaryIconBtn}`}
            onClick={handleToggleMonitoring}
            style={data.monitoring_enabled ? { background: '#10b981', color: 'white' } : {}}
            disabled={togglingMonitoring}
          >
            {togglingMonitoring ? (
              <Activity size={16} className="spin-animation" />
            ) : data.monitoring_enabled ? (
              <Check size={16} /> 
            ) : (
              <Activity size={16} /> 
            )}
            {data.monitoring_enabled ? "Monitoring Active" : "Enable Monitoring"}
          </button>
        </div>
      </header>

      {/* Summary Ribbon */}
      <section className={styles.summaryRibbon}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Overall Status</span>
          <div className={styles.summaryValue}>
            <span className={data.overall_status === 'Cleared' ? styles.badgeClear : data.overall_status === 'Rejected' ? styles.badgeReject : styles.badgeReview}>
              {data.overall_status}
            </span>
          </div>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Risk Rating</span>
          <div className={styles.summaryValue}>
            <span className={data.risk_level === 'HIGH' ? styles.badgeReject : data.risk_level === 'MEDIUM' ? styles.badgeReview : styles.badgeClear} style={{ fontSize: '0.65rem', padding: '4px 10px' }}>
              {data.risk_level}
            </span>
            <span>{Math.round(data.summary?.max_score || 0)}%</span>
          </div>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Matches</span>
          <span className={styles.summaryValue}>{data.summary?.total_matches || 0}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Screening ID</span>
          <div className={styles.summaryValue}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.8 }}>
              {data.screening_id}
            </span>
            <button 
              onClick={() => copyToClipboard(data.screening_id)} 
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${copiedId === data.screening_id ? '#10b981' : 'var(--border)'}`, borderRadius: '6px', cursor: 'pointer', color: copiedId === data.screening_id ? '#10b981' : 'var(--secondary)', padding: '6px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              title="Copy to Clipboard"
            >
              {copiedId === data.screening_id ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </section>

      {/* Main Layout Grid - Swapped: Sidebar on Left, Matches on Right */}
      <div className={styles.layoutGrid}>
        {/* Left: Sidebar (Review & History) */}
        <aside className={styles.sidebar}>
          {/* Review Widget */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}><ShieldCheck size={18} /> Analyst Review</h3>
            <div className={styles.reviewForm}>
              <div className={styles.decisionGrid}>
                <button
                  className={`${styles.decisionBtn} ${decision === 'cleared' ? styles.decisionBtnActiveClear : ''}`}
                  onClick={() => setDecision('cleared')}
                >Clear</button>
                <button
                  className={`${styles.decisionBtn} ${decision === 'in_review' ? styles.decisionBtnActiveReview : ''}`}
                  onClick={() => setDecision('in_review')}
                >Review</button>
                <button
                  className={`${styles.decisionBtn} ${decision === 'rejected' ? styles.decisionBtnActiveReject : ''}`}
                  onClick={() => setDecision('rejected')}
                >Reject</button>
              </div>
              <textarea
                className={styles.notesField}
                placeholder="Ex. Subject identified as true match based on DOB..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
              <button
                className={styles.submitBtn}
                onClick={handleSubmitReview}
                disabled={submitting}
              >{submitting ? "Finalizing Decision..." : "Submit Decision"}</button>
            </div>
          </div>

          {/* Audit History Widget */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}><Activity size={18} /> Audit History</h3>
            <div className={styles.timeline}>
              {history.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '20px' }}>No history recorded.</p>
              ) : (
                history.slice(0, 5).map((h, hi) => (
                  <div key={hi} className={styles.timelineItem}>
                    <div className={styles.timelineDot}></div>
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineAction}>{h.action.replace(/_/g, ' ')}</span>
                      <span className={styles.timelineMeta}>by {h.user_id} • {new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right: Matches */}
        <section>
          <h2 className={styles.sectionTitle}><Database size={20} /> Match Candidates</h2>
          <div className={styles.matchList}>
            {data.matches.length === 0 ? (
              <div className={styles.widget} style={{ textAlign: 'center', padding: '100px' }}>
                <ShieldCheck size={64} style={{ color: '#10b981', opacity: 0.3, margin: '0 auto 24px' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Pristine Record</h3>
                <p style={{ color: '#94a3b8' }}>No watchlist, sanction, or PEP matches found for this subject.</p>
              </div>
            ) : (
              data.matches.map((match, idx) => (
                <div key={idx} className={`${styles.matchCard} ${idx === 0 ? styles.topMatchCard : ''}`}>
                  <div className={styles.matchCardHeader}>
                    <div className={styles.matchInfo}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 900, 
                          color: 'var(--primary)',
                          background: 'rgba(99, 102, 241, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(99, 102, 241, 0.3)'
                        }}>
                          {match.match_id || `M-${idx + 1}`}
                        </span>
                        <span className={styles.matchName}>{match.name}</span>
                        {idx === 0 && (
                          <span style={{
                            background: '#f43f5e',
                            color: 'white',
                            fontSize: '0.6rem',
                            padding: '2px 10px',
                            borderRadius: '99px',
                            fontWeight: 900,
                            letterSpacing: '0.05em',
                            boxShadow: '0 0 10px rgba(244, 63, 94, 0.3)',
                            textTransform: 'uppercase'
                          }}>
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>{match.match_type}</span>
                    </div>
                    <div className={`${styles.matchScore} ${idx === 0 || Math.round(match.match_score) >= 80 ? styles.matchScoreHigh :
                        Math.round(match.match_score) >= 60 ? styles.matchScoreMed :
                          styles.matchScoreLow
                      }`}>
                      {Math.round(match.match_score)}% Match
                    </div>
                  </div>
                  <div className={styles.matchBody}>
                    <div className={styles.matchDetailsGrid}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Countries</span>
                        <span className={styles.detailValue}>{match.countries?.join(", ") || "Unknown"}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Nationalities</span>
                        <span className={styles.detailValue}>{match.nationalities?.join(", ") || "N/A"}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Birth Dates</span>
                        <span className={styles.detailValue}>{match.birth_dates?.join(", ") || "N/A"}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Identifiers</span>
                        <span className={styles.detailValue}>{match.id_numbers?.length ? match.id_numbers.join(", ") : match.passports?.length ? `Pass: ${match.passports[0].number}` : "N/A"}</span>
                      </div>
                      <div className={styles.detailRow} style={{ gridColumn: 'span 2' }}>
                        <span className={styles.detailLabel}>Datasets</span>
                        <span className={styles.detailValue}>{(match.details?.datasets || match.datasets)?.join(", ") || "Standard OS Collection"}</span>
                      </div>

                      {/* Sanctions Overview if available */}
                      {match.sanctions && match.sanctions.length > 0 && (
                        <div className={styles.highlightBlock}>
                          <span className={styles.detailLabel} style={{ color: '#f43f5e' }}>Primary Sanction Reason</span>
                          <span className={styles.detailValue} style={{ fontSize: '0.85rem' }}>
                            {match.sanctions[0].reason?.join("; ") || match.sanctions[0].program?.join("; ") || "Designated Sanction Target"}
                          </span>
                        </div>
                      )}

                      <div className={styles.detailRow} style={{ gridColumn: 'span 2' }}>
                        <span className={styles.detailLabel}>Risk Topics</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {(match.details?.topics || match.topics || []).map((t: string, ti: number) => {
                            const topicClass = t.toLowerCase().includes('sanction') ? styles.topicSanction :
                              (t.toLowerCase().includes('pep') || t.toLowerCase().includes('role.pep')) ? styles.topicPep :
                                (t.toLowerCase().includes('crime') || t.toLowerCase().includes('terror') || t.toLowerCase().includes('fraud')) ? styles.topicCrime :
                                  styles.topicGeneral;
                            return (
                              <span key={ti} className={`${styles.badge} ${topicClass}`} style={{ fontSize: '0.7rem', padding: '4px 12px' }}>
                                {t}
                              </span>
                            );
                          })}
                          {(match.details?.topics || match.topics || []).length === 0 && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontStyle: 'italic' }}>No risk topics identified</span>
                          )}
                        </div>
                      </div>

                      {match.aliases && match.aliases.length > 0 && (
                        <div className={styles.detailRow} style={{ gridColumn: 'span 2' }}>
                          <span className={styles.detailLabel}>Also Known As</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                            {match.aliases.slice(0, 8).map((alias, ai) => (
                              <span key={ai} className={styles.aliasTag}>
                                {alias}
                              </span>
                            ))}
                            {match.aliases.length > 8 && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', alignSelf: 'center' }}>
                                +{match.aliases.length - 8} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.matchFooter}>
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleMatchStatusUpdate(idx, match.match_id || `M-${idx + 1}`, "matched", match.name)}
                          className={`${styles.matchActionBtn} ${styles.confirmMatchBtn} ${(match.decision === 'True Match' || match.status === 'matched' || match.decision === 'matched') ? styles.confirmMatchBtnActive : ''}`}
                          title="Mark as True Match"
                        >
                          <CheckCircle2 size={14} /> True Match
                        </button>
                        <button
                          onClick={() => handleMatchStatusUpdate(idx, match.match_id || `M-${idx + 1}`, "false_positive", match.name)}
                          className={`${styles.matchActionBtn} ${styles.falsePositiveBtn} ${(match.decision === 'False Positive' || match.status === 'false_positive' || match.decision === 'false_positive') ? styles.falsePositiveBtnActive : ''}`}
                          title="Mark as False Positive"
                        >
                          <XCircle size={14} /> False Positive
                        </button>
                      </div>
                      {(match.decision === 'True Match' || match.decision === 'False Positive') && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>
                           <span style={{ fontWeight: 600, color: match.decision === 'True Match' ? '#f43f5e' : '#10b981' }}>{match.decision}</span> 
                           {match.decision_author && <span> by {match.decision_author}</span>}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDeepDive(match.entity_id || "")} 
                      className={styles.deepDiveBtn}
                      disabled={isNavigating}
                    >
                      {isNavigating ? "Synthesizing..." : "View Deep Dive"} <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmMatchStatusUpdate}
        title={pendingMatchUpdate?.status === 'matched' ? "Confirm True Match" : "Exclude Candidate"}
        message={`You are about to mark ${pendingMatchUpdate?.name} as a ${pendingMatchUpdate?.status === 'matched' ? "confirmed True Match" : "False Positive"}. This action will be recorded in the audit trail.`}
        confirmLabel={pendingMatchUpdate?.status === 'matched' ? "Confirm Match" : "Mark False Positive"}
        confirmVariant={pendingMatchUpdate?.status === 'matched' ? "danger" : "success"}
        placeholder="Provide justification for this decision (e.g., matching DOB, different nationality)..."
      />

      {/* ─── Investigation Audit History ─────────────────────────────────────── */}
      <section style={{ marginTop: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <Clock size={20} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.02em' }}>Investigation Audit History</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--secondary)' }}>{history.length} event{history.length !== 1 ? 's' : ''} recorded</span>
        </div>

        {historyLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '12px', opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--secondary)', fontSize: '0.875rem', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
            <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            No audit events recorded yet. Actions on matches will appear here.
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            {/* vertical timeline line */}
            <div style={{ position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px', background: 'var(--border)', borderRadius: '2px' }} />

            {history.map((h, hi) => {
              const isSystemEvent  = h.user_id === 'System' || h.action === 'status_auto_resolved';
              const isMatchDecision = h.action === 'match_decision_updated' || h.action === 'MATCH_DECISION';
              const newStatus      = h.details?.new_status || h.details?.new_status;
              const caption        = h.details?.caption || h.details?.match_name;
              const note           = h.details?.note;
              const entityId       = h.details?.entity_id;
              const matchId        = h.details?.match_id;

              const dotColor = isSystemEvent
                ? (newStatus === 'Clear' ? '#10b981' : newStatus === 'Rejected' ? '#f43f5e' : '#f59e0b')
                : (h.details?.new_status === 'True Match' || h.details?.new_status === 'matched' ? '#f43f5e' : h.details?.new_status === 'False Positive' || h.details?.new_status === 'false_positive' ? '#10b981' : 'var(--primary)');

              const actionLabel = isSystemEvent
                ? `System auto-resolved overall status → ${newStatus}`
                : isMatchDecision
                  ? matchId 
                    ? `Marked Match #${matchId} "${caption || entityId}" as ${h.details?.new_status}`
                    : `Marked "${caption || entityId}" as ${h.details?.new_status}`
                  : h.action.replace(/_/g, ' ');

              return (
                <div key={hi} style={{ position: 'relative', display: 'flex', gap: '20px', paddingBottom: hi < history.length - 1 ? '28px' : '0' }}>
                  {/* dot */}
                  <div style={{
                    position: 'absolute', left: '-27px', top: '6px',
                    width: '14px', height: '14px', borderRadius: '50%',
                    background: dotColor,
                    border: '2px solid var(--surface)',
                    boxShadow: `0 0 8px ${dotColor}60`,
                    flexShrink: 0, zIndex: 1
                  }} />

                  {/* card */}
                  <div style={{
                    flex: 1, background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSystemEvent ? dotColor + '40' : 'var(--border)'}`,
                    borderLeft: `3px solid ${dotColor}`,
                    borderRadius: '12px', padding: '16px 20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)' }}>{actionLabel}</span>
                        {isSystemEvent && (
                          <span style={{ marginLeft: '10px', fontSize: '0.65rem', background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b60', padding: '2px 8px', borderRadius: '4px', fontWeight: 900 }}>SYSTEM</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                      {!isSystemEvent && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={12} /> {h.user_id} {h.role && `· ${h.role}`}
                        </span>
                      )}
                      {isMatchDecision && entityId && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--primary)' }}>
                          ID: {entityId}
                        </span>
                      )}
                      {isSystemEvent && h.details?.reason && (
                        <span style={{ color: 'var(--secondary)', fontStyle: 'italic' }}>{h.details.reason}</span>
                      )}
                    </div>

                    {note && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--foreground)', borderLeft: '2px solid var(--primary)', fontStyle: 'italic' }}>
                        <MessageSquare size={12} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--primary)' }} />
                        "{note}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />)}
    </div>
  );
}
