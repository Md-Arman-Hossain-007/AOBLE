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

// --- Types ---
interface Match {
  id?: string;
  entity_id?: string;
  status?: string;
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
  const [toasts, setToasts] = useState<any[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

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

  const handleDeepDive = (entityId: string) => {
    setIsNavigating(true);
    router.push(`/screenings/entity/${entityId}?sid=${id}`);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

  const handleMatchStatusUpdate = async (matchIdx: number, entityId: string, matchStatus: string) => {
    const token = localStorage.getItem("amltab_token");
    if (!token) return;

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/screen/${id}/review`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          match_id: entityId,
          match_idx: matchIdx,
          match_status: matchStatus,
          decision: "in_review"
        })
      });

      if (res.ok) {
        addToast(`Match marked as ${matchStatus.replace('_', ' ')}`, "success");
        fetchDetail();
        fetchHistory();
      }
    } catch (err) {
      addToast("Failed to update match status", "error");
    } finally {
      setSubmitting(false);
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
    <div className={styles.container} style={{ padding: '100px', textAlign: 'center' }}>
      <div style={{ color: '#f87171', marginBottom: '16px' }}>{error}</div>
      <button onClick={() => router.back()} className={styles.backBtn}>Return to List</button>
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
          <button className={styles.iconBtn}><Download size={16} /> Detail Report</button>
          <button className={`${styles.iconBtn} ${styles.primaryIconBtn}`}><Activity size={16} /> Monitoring</button>
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
          <div className={styles.riskRatingValue}>
            <span className={data.risk_level === 'HIGH' ? styles.badgeReject : data.risk_level === 'MEDIUM' ? styles.badgeReview : styles.badgeClear} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
              {data.risk_level}
            </span>
            <span className={styles.summaryValue}>{Math.round(data.summary?.max_score || 0)}%</span>
          </div>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Matches</span>
          <span className={styles.summaryValue}>{data.summary?.total_matches || 0}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Screening ID</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.summaryValue} style={{ fontSize: '0.7rem', fontFamily: 'monospace', opacity: 0.8 }}>
              {data.screening_id}
            </span>
            <button 
              onClick={() => copyToClipboard(data.screening_id)} 
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${copiedId === data.screening_id ? '#10b981' : 'var(--border)'}`, borderRadius: '4px', cursor: 'pointer', color: copiedId === data.screening_id ? '#10b981' : 'var(--secondary)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              title="Copy to Clipboard"
            >
              {copiedId === data.screening_id ? <Check size={12} /> : <Copy size={12} />}
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
                      <span className={styles.timelineAction}>{h.action.replace('_', ' ')}</span>
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
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleMatchStatusUpdate(idx, match.entity_id || "", "matched")}
                        className={`${styles.matchActionBtn} ${styles.confirmMatchBtn} ${match.status === 'matched' ? styles.confirmMatchBtnActive : ''}`}
                      >Confirm Match</button>
                      <button
                        onClick={() => handleMatchStatusUpdate(idx, match.entity_id || "", "false_positive")}
                        className={`${styles.matchActionBtn} ${styles.falsePositiveBtn} ${match.status === 'false_positive' ? styles.falsePositiveBtnActive : ''}`}
                      >Mark False Positive</button>
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

      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />)}
    </div>
  );
}
