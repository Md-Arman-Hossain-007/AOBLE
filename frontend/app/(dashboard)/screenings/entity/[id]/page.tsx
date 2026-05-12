"use client";

import React, { useState, useEffect, Suspense } from "react";
import { LoadingSpinner } from "../../../../components/LoadingSpinner";
import { Modal } from "../../../../components/Modal";
import { 
  Shield, 
  User, 
  MapPin, 
  FileText, 
  CreditCard, 
  Users, 
  Activity, 
  ArrowLeft, 
  Download,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Link as LinkIcon,
  Calendar, 
  Briefcase,
  History,
  CheckCircle2,
  Database,
  Search,
  Fingerprint,
  Info,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Globe,
  Heart,
  Landmark,
  Layers,
  Clock,
  Terminal,
  ChevronRight,
  ChevronDown,
  Hash,
  Link2,
  Eye,
  Settings,
  Bell,
  XCircle,
  X
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./modern-entity.module.css";

// Interface for rich entity details including nested properties
interface EntityDetails {
  id: string;
  caption: string;
  schema: string;
  properties: Record<string, any[]>;
  datasets: string[];
  referents: string[];
  target: boolean;
  first_seen: string;
  last_seen: string;
  last_change: string;
}

export default function EntityDetailPage() {
  return (
    <Suspense fallback={<div>Loading Intelligence...</div>}>
      <EntityDetailContent />
    </Suspense>
  );
}

// Truncated list helper for high-density tag matrices
const TruncatedList = ({ items, limit = 10, renderItem }: { items: any[], limit?: number, renderItem: (item: any, i: number, items: any[]) => React.ReactNode }) => {
  const [showAll, setShowAll] = useState(false);
  if (!items || items.length === 0) return <span style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>N/A</span>;

  const displayItems = showAll ? items : items.slice(0, limit);
  const remaining = items.length - limit;

  return (
    <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
      {displayItems.map((item, i) => (
        <React.Fragment key={i}>
           {renderItem(item, i, items)}
        </React.Fragment>
      ))}
      {!showAll && remaining > 0 && (
        <button 
          onClick={() => setShowAll(true)} 
          type="button"
          style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'center' }}
        >
          +{remaining} MORE
        </button>
      )}
      {showAll && items.length > limit && (
        <button 
          onClick={() => setShowAll(false)} 
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.65rem', cursor: 'pointer', padding: '4px', textDecoration: 'underline' }}
        >
          Hide
        </button>
      )}
    </div>
  );
};

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
      zIndex: 2000,
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

// Recursive component to render deep data structures - ULTIMATE VERSION
const DataValueRenderer = ({ value, label, initialExpanded = false }: { value: any, label?: string, initialExpanded?: boolean }) => {
  const [expanded, setExpanded] = useState(initialExpanded);

  if (value === null || value === undefined) return <span className={styles.value}>N/A</span>;
  
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={styles.value}>N/A</span>;
    
    // Auto-Tagify list of names, topics, or referents
    const taggables = ["name", "alias", "weakAlias", "firstName", "lastName", "topics", "programId", "classification", "referents"];
    if (label && taggables.includes(label) && typeof value[0] !== 'object') {
       return (
         <TruncatedList 
           items={value}
           limit={20}
           renderItem={(v, i, all) => (
             <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--foreground)', background: 'rgba(255,255,255,0.02)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                   {String(v)}
                </span>
                {i < (all.length > 20 ? 19 : all.length - 1) && <span style={{ color: 'var(--secondary)', margin: '0 4px', fontSize: '0.8rem' }}>,</span>}
             </span>
           )}
         />
       );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {value.map((v, i) => (
          <div key={i} style={{ borderLeft: '2px solid var(--border)', paddingLeft: '14px', width: '100%' }}>
             <DataValueRenderer value={v} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object' && value !== null) {
    if (value.caption && Object.keys(value).length <= 3 && !value.properties) {
       return <span className={styles.value} style={{ color: 'var(--primary)', fontWeight: 600 }}>{value.caption}</span>;
    }

    // Comprehensive Object Explorer
    return (
      <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)', width: '100%', marginTop: '4px' }}>
        <div 
          onClick={() => setExpanded(!expanded)} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)' }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {value.caption || value.schema || label || "Detailed Record"}
          </span>
          {value.id && <span style={{ fontSize: '0.6rem', color: 'var(--secondary)', fontWeight: 400, marginLeft: 'auto' }}>ID: {value.id}</span>}
        </div>
        
        {expanded && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '16px', borderLeft: '1px dashed var(--border)' }}>
             {value.properties ? (
               Object.entries(value.properties).map(([k, v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 2.5fr', gap: '20px' }}>
                   <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', textTransform: 'uppercase', alignSelf: 'start', letterSpacing: '0.08em', fontWeight: 700 }}>{k}</span>
                   <DataValueRenderer value={v} label={k} />
                </div>
               ))
             ) : (
               Object.entries(value).map(([k, v]) => {
                 if (['caption', 'schema', 'id'].includes(k)) return null;
                 return (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 2.5fr', gap: '20px' }}>
                     <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', textTransform: 'uppercase', alignSelf: 'start', letterSpacing: '0.08em', fontWeight: 700 }}>{k}</span>
                     <DataValueRenderer value={v} label={k} />
                  </div>
                 );
               })
             )}
          </div>
        )}
      </div>
    );
  }

  const str = String(value);
  if (str.startsWith('http')) {
     return <a href={str} target="_blank" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline', fontSize: '0.8rem' }}>{str.length > 50 ? str.substring(0, 50) + '...' : str} <ExternalLink size={10} /></a>;
  }

  return <span className={styles.value} style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>{str}</span>;
}

function EntityDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const entityId = params.id as string;
  const screeningId = searchParams.get("sid");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EntityDetails | null>(null);
  const [screeningMatch, setScreeningMatch] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("amltab_token");
        const API_URL = "/api/v1";
        const headers = { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        const entityRes = await fetch(`${API_URL}/screen/entities/${entityId}${screeningId ? `?sid=${screeningId}` : ''}`, { headers });
        if (!entityRes.ok) {
          const errorData = await entityRes.json().catch(() => ({}));
          throw new Error(errorData.detail || "Entity retrieval failed");
        }
        const entityDetails = await entityRes.json();

        // Use match context from backend if available
        if (entityDetails.match_context) {
          setScreeningMatch(entityDetails.match_context);
        } else if (screeningId) {
          try {
            const screeningRes = await fetch(`${API_URL}/screen/${screeningId}`, { headers });
            if (screeningRes.ok) {
              const screeningResult = await screeningRes.json();
              const match = screeningResult.matches?.find((m: any) => m.entity_id === entityId);
              if (match) setScreeningMatch(match);
              setIsMonitoring(screeningResult.monitoring_enabled || false);
            }
          } catch (e) { console.warn("Context unavailable:", e); }
        } else {
          setIsMonitoring(entityDetails.target || false);
        }

        setData(entityDetails);
        setError(null);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Intelligence retrieval failed.");
      } finally {
        setLoading(false);
      }
    };

    if (entityId) fetchData();
  }, [entityId, screeningId]);

  const [exportLoading, setExportLoading] = useState(false);

  const handleExportReport = async () => {
    if (!screeningId) return;
    try {
      setExportLoading(true);
      const API_URL = "/api/v1";
      const token = localStorage.getItem("amltab_token");
      const response = await fetch(`${API_URL}/screen/${screeningId}/report`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to generate report");
      
      const props = data?.properties || {};
      const latinName = (props["name"] || []).find((n: any) => typeof n === 'string' && /^[a-zA-Z0-9\s,.\-()'!]*$/.test(n)) || data?.caption || 'Record';
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AMLTAB_Intelligence_${latinName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error("Export failed", e);
      addToast("Intelligence report generation failed.", "error");
    } finally {
      setExportLoading(false);
    }
  };

  const toggleMonitoring = async () => {
    if (!screeningId) {
      addToast("Monitoring requires an active screening session context.", "info");
      return;
    }
    const token = localStorage.getItem("amltab_token");
    if (!token) return;

    try {
      setMonitoringLoading(true);
      const API_URL = "/api/v1";
      const res = await fetch(`${API_URL}/screen/${screeningId}/monitor`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const result = await res.json();
        setIsMonitoring(result.monitoring_enabled);
        addToast(result.monitoring_enabled ? "Active Monitoring Activated" : "Monitoring Paused", "success");
      } else {
        addToast("Failed to update monitoring status.", "error");
      }
    } catch (e) {
      console.error("Monitoring toggle failed", e);
      addToast("Network failure toggling monitoring.", "error");
    } finally {
      setMonitoringLoading(false);
    }
  };

  // Structural Skeleton Definitions - institutional pre-rendering
  const skeletonHero = (
    <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '32px' }}>
      <div className="skeleton" style={{ width: '120px', height: '10px', marginBottom: '16px' }}></div>
      <div className="skeleton" style={{ width: '400px', height: '40px', marginBottom: '24px' }}></div>
      <div style={{ display: 'flex', gap: '12px' }}>
         <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div>
         <div className="skeleton" style={{ width: '120px', height: '20px', borderRadius: '4px' }}></div>
      </div>
    </div>
  );

  const skeletonContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
       {[1,2,3,4].map(i => (
         <div key={i} className={styles.group} style={{ opacity: 1 - (i * 0.2) }}>
            <div className="skeleton" style={{ width: '150px', height: '14px', marginBottom: '20px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '8px' }}></div>
               <div className="skeleton" style={{ width: '90%', height: '40px', borderRadius: '8px' }}></div>
               <div className="skeleton" style={{ width: '95%', height: '40px', borderRadius: '8px' }}></div>
            </div>
         </div>
       ))}
    </div>
  );

  if (loading) {
    return (
      <div className={styles.container}>
        {/* Top Professional Control Header - Always Visible */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div className={styles.backBtn} style={{ opacity: 0.5, cursor: 'default' }}>
            <ArrowLeft size={14} /> Screen Results Archive
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 20px', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 900, opacity: 0.5, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={14} className="pulsate" /> START MONITORING
            </div>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '8px 24px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, opacity: 0.3, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Download size={14} /> EXPORT INTELLIGENCE
            </div>
          </div>
        </div>

        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Synthesizing Jurisdictional Intelligence..." size="large" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <ShieldAlert size={40} style={{ color: '#f43f5e' }} />
          <h3>Access Restricted / Record Missing</h3>
          <p>{error || "The requested portfolio could not be retrieved from the central graph."}</p>
          <button onClick={() => router.back()} className={styles.backBtn} style={{ marginTop: '20px' }}>
            <ArrowLeft size={16} /> Portfolio Return
          </button>
        </div>
      </div>
    );
  }

  const props = data.properties || {};
  
  const getMainCaption = (): string => {
    const list = props["name"] || [];
    const isLatin = (str: string) => /^[a-zA-Z0-9\s,.\-()'!]*$/.test(str);
    return list.find(n => typeof n === 'string' && isLatin(n)) || data.caption;
  };

  const getVal = (key: string) => {
    const arr = props[key] || [];
    if (arr.length === 0) return "N/A";
    return arr.map(v => typeof v === 'object' ? v.caption || JSON.stringify(v) : String(v)).join(", ");
  };

  const getArray = (key: string) => props[key] || [];

  return (
    <div className={styles.container}>
      {/* Top Professional Control Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Link href="#" onClick={(e) => { e.preventDefault(); router.back(); }} className={styles.backBtn}>
          <ArrowLeft size={14} /> Screen Results Archive
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Active Monitoring Toggle */}
          <button 
            onClick={toggleMonitoring}
            disabled={monitoringLoading}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', 
              background: isMonitoring ? '#22c55e' : 'rgba(255,255,255,0.03)', 
              padding: '8px 20px', borderRadius: '12px', border: '1px solid #22c55e',
              color: isMonitoring ? 'white' : 'var(--secondary)', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: isMonitoring ? '0 4px 14px rgba(34, 197, 94, 0.4)' : 'none'
            }}
          >
            {monitoringLoading ? <Activity size={14} className="pulsate" /> : <Eye size={14} />}
            {isMonitoring ? "ACTIVE MONITORING ON" : "START MONITORING"}
          </button>
          
          <button 
            type="button" 
            onClick={handleExportReport}
            disabled={exportLoading}
            className={styles.summaryBtn} 
            style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '8px 24px', 
              fontSize: '0.75rem', 
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: exportLoading ? 'wait' : 'pointer',
              opacity: exportLoading ? 0.7 : 1
            }}
          >
            {exportLoading ? <Activity size={14} className="pulsate" /> : <Download size={14} />} 
            {exportLoading ? "PREPARING REPORT..." : "EXPORT INTELLIGENCE"}
          </button>
        </div>
      </div>

      {/* Hero Header Area */}
      <header className={styles.hero}>
        <div className={styles.entityInfo}>
          <div className={styles.entityID}>System Access ID: {data.id}</div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
            <h1 className={styles.entityTitle} style={{ marginBottom: 0 }}>{getMainCaption()}</h1>
            {data.target && (
              <div style={{ background: '#f43f5e', color: 'white', padding: '2px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                CRITICAL TARGET
              </div>
            )}
            {screeningMatch?.match_score && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: screeningMatch.match_score >= 80 ? '#f43f5e' : '#f59e0b', fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', background: 'rgba(255,255,255,0.02)', padding: '2px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                 <Shield size={9} />
                 <span>{screeningMatch.match_score <= 1.1 ? Math.round(screeningMatch.match_score * 100) : Math.round(screeningMatch.match_score)}% MATCH SCORE</span>
              </div>
            )}
          </div>

          {getMainCaption() !== data.caption && (
             <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600, display: 'block', marginTop: '4px' }}>Native Script Identifier: {data.caption}</span>
          )}

          <div className={styles.topicListHeader} style={{ marginTop: '20px' }}>
            <TruncatedList 
              items={Array.from(new Set([...getArray("topics"), ...(screeningMatch?.topics || [])]))}
              limit={20}
              renderItem={(t, i) => {
                 const topicClass = t.toLowerCase().includes('sanction') ? styles.topicSanction :
                                  (t.toLowerCase().includes('pep') || t.toLowerCase().includes('role.pep')) ? styles.topicPep :
                                  t.toLowerCase().includes('crime') ? styles.topicCrime :
                                  styles.topicGeneral;
                 return <span key={i} className={`${styles.topicBadge} ${topicClass}`}>{t}</span>
              }}
            />
          </div>

          <div className={styles.badges}>
            <span className={styles.typeBadge}>{data.schema || "Entity"}</span>
            <span className={styles.typeBadge} style={{ border: '1px dashed var(--primary)' }}>{getVal("classification") !== "N/A" ? getVal("classification") : 'Official Inquiry'}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className={styles.mainLayout}>
        
        {/* Central Workspace (2/3) */}
        <section className={styles.mainArea}>
          <div className={styles.tabsContainer}>
            <nav className={styles.tabsHeader} style={{ display: 'flex', gap: '20px', padding: '0 20px', borderBottom: '1px solid var(--border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {["overview", "matrix", "sources", "sanctions", "relationships", "occupancy"].map((tab) => (
                <div 
                  key={tab} 
                  className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`} 
                  onClick={() => setActiveTab(tab)}
                  style={{ padding: '12px 0', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0, letterSpacing: '0.05em' }}
                >
                  {tab === 'matrix' ? 'DETAILS' : tab.toUpperCase()}
                </div>
              ))}
            </nav>

            <div className={styles.tabContent} style={{ padding: '30px 24px' }}>
              
              {/* TAB: OVERVIEW (EXHAUSTIVE TECHNICAL SUMMARY) */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                   {/* Top Level Technical Matrix */}
                   <div className={styles.detailsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      <div className={styles.group}>
                         <h4 className={styles.groupTitle}><User size={12} /> Primary Identity</h4>
                         <div className={styles.field}><span className={styles.label}>Legal Caption</span><span className={styles.value}>{data.caption}</span></div>
                         <div className={styles.field}><span className={styles.label}>System ID</span><span className={styles.value} style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{data.id}</span></div>
                         <div className={styles.field}><span className={styles.label}>Record Schema</span><span className={styles.value} style={{ color: 'var(--primary)', fontWeight: 900 }}>{data.schema.toUpperCase()}</span></div>
                         <div className={styles.field}><span className={styles.label}>Classification</span><span className={styles.value}>{getVal("classification")}</span></div>
                      </div>
                      <div className={styles.group}>
                         <h4 className={styles.groupTitle}><Globe size={12} /> Demographics</h4>
                         <div className={styles.field}><span className={styles.label}>Nationality</span><span className={styles.value}>{getVal("nationality")}</span></div>
                         <div className={styles.field}><span className={styles.label}>Citizenship</span><span className={styles.value}>{getVal("citizenship")}</span></div>
                         <div className={styles.field}><span className={styles.label}>Gender</span><span className={styles.value}>{getVal("gender") !== "N/A" ? getVal("gender") : "Undisclosed"}</span></div>
                         <div className={styles.field}><span className={styles.label}>Date of Birth</span><span className={styles.value}>{getVal("birthDate")}</span></div>
                      </div>
                      <div className={styles.group}>
                         <h4 className={styles.groupTitle}><Activity size={12} /> Compliance Status</h4>
                         <div className={styles.field}><span className={styles.label}>Monitoring Focus</span><span className={styles.value} style={{ color: data.target ? '#22c55e' : 'var(--secondary)', fontWeight: 900 }}>{data.target ? "HIGH-RISK TARGET" : "STANDARD REVIEW"}</span></div>
                         <div className={styles.field}><span className={styles.label}>First Detected</span><span className={styles.value}>{new Date(data.first_seen).toLocaleDateString()}</span></div>
                         <div className={styles.field}><span className={styles.label}>Last Change</span><span className={styles.value}>{new Date(data.last_change).toLocaleDateString()}</span></div>
                         <div className={styles.field}><span className={styles.label}>Topics Identified</span><span className={styles.value}>{getArray("topics").length} Indicators</span></div>
                      </div>
                   </div>

                   {/* Identifiers & Residence Stack */}
                   <div className={styles.detailsGrid}>
                      <div className={styles.group}>
                         <h4 className={styles.groupTitle}><CreditCard size={12} /> Official Identifiers Overview</h4>
                         <div className={styles.field}><span className={styles.label}>Passport Numbers</span><span className={styles.value}>{getVal("passportNumber")}</span></div>
                         <div className={styles.field}><span className={styles.label}>Tax/National IDs</span><span className={styles.value}>{getVal("idNumber") !== "N/A" ? getVal("idNumber") : getVal("taxNumber")}</span></div>
                      </div>
                      <div className={styles.group}>
                         <h4 className={styles.groupTitle}><MapPin size={12} /> Residence Track</h4>
                         <div className={styles.field}><span className={styles.label}>Official Addresses</span><p className={styles.value} style={{ fontSize: '0.85rem' }}>{getVal("address")}</p></div>
                      </div>
                   </div>

                   {/* Institutional Notes */}
                   {getVal("notes") !== "N/A" && (
                      <div className={styles.group}>
                         <h4 className={styles.groupTitle}><FileText size={12} /> Institutional Assessment Brief</h4>
                         <div className={styles.sanctionCard} style={{ background: 'rgba(255,255,255,0.01)', padding: '24px', borderLeft: '4px solid var(--border)' }}>
                            <p className={styles.value} style={{ fontSize: '0.95rem', lineHeight: 1.8, margin: 0 }}>{getVal("notes")}</p>
                         </div>
                      </div>
                   )}
                </div>
              )}

              {/* TAB: OCCUPANCY (PROFESSIONAL MANDATE TRACKER) */}
              {activeTab === 'occupancy' && (
                <div className={styles.group}>
                   <h4 className={styles.groupTitle}><Briefcase size={12} /> Institutional Professional Lineage</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {Object.keys(props).filter(k => k.toLowerCase().includes('occupancy') || k.toLowerCase().includes('position') || k.toLowerCase().includes('role')).length === 0 ? (
                        <p className={styles.value}>No official institutional mandates detected in the professional track.</p>
                      ) : (
                        Object.keys(props).filter(k => k.toLowerCase().includes('occupancy') || k.toLowerCase().includes('position') || k.toLowerCase().includes('role')).map(key => (
                           <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', textTransform: 'uppercase' }}>{key}</div>
                              {getArray(key).map((occ, i) => (
                                <div key={i} className={styles.sanctionCard} style={{ background: 'rgba(255,255,255,0.01)', borderLeft: '4px solid var(--primary)' }}>
                                   <DataValueRenderer value={occ} label={key} initialExpanded={true} />
                                </div>
                              ))}
                           </div>
                        ))
                      )}
                   </div>
                </div>
              )}

              {/* TAB: MASTER ATTRIBUTE MATRIX */}
              {activeTab === 'matrix' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                   <div className={styles.group}>
                      <h4 className={styles.groupTitle}><Fingerprint size={14} /> Exhaustive Technical Attribute Matrix</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '24px' }}>Every technical attribute recorded in the central graph for this entity.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                         {Object.entries(props).map(([key, value]) => (
                           <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 4fr', gap: '40px', padding: '20px 30px', background: 'var(--surface)' }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase' }}>{key}</div>
                              <DataValueRenderer value={value} label={key} />
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {/* TAB: SANCTIONS */}
              {activeTab === 'sanctions' && (
                <div className={styles.group}>
                   <h4 className={styles.groupTitle} style={{ color: '#f43f5e' }}><Shield size={12} /> Regulatory Sanction Portfolio</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {getArray("sanctions").concat(getArray("sanction")).length === 0 ? (
                        <p className={styles.value}>Negative sanction result detected in primary matrices.</p>
                      ) : (
                        getArray("sanctions").concat(getArray("sanction")).map((s, i) => (
                          <div key={i} className={styles.sanctionCard} style={{ borderLeft: '4px solid #f43f5e', background: 'rgba(255,255,255,0.01)' }}>
                             <DataValueRenderer value={s} label="sanction" initialExpanded={true} />
                          </div>
                        ))
                      )}
                   </div>
                </div>
              )}

              {/* TAB: RELATIONSHIPS (SMART SCAN) */}
              {activeTab === 'relationships' && (
                <div className={styles.group}>
                   <h4 className={styles.groupTitle}><Users size={12} /> Global Relationship Graph</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {Object.keys(props).filter(k => k.toLowerCase().includes('person') || k.toLowerCase().includes('associate') || k.toLowerCase().includes('member') || k.toLowerCase().includes('relative') || k.toLowerCase().includes('owner') || k.toLowerCase().includes('director')).map(relKey => (
                         <div key={relKey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', textTransform: 'uppercase' }}>{relKey}</div>
                            {getArray(relKey).map((r, i) => (
                              <div key={i} className={styles.sanctionCard} style={{ background: 'rgba(255,255,255,0.01)' }}>
                                 <DataValueRenderer value={r} label={relKey} initialExpanded={true} />
                              </div>
                            ))}
                         </div>
                      ))}
                      {Object.keys(props).filter(k => k.toLowerCase().includes('person') || k.toLowerCase().includes('associate') || k.toLowerCase().includes('member') || k.toLowerCase().includes('relative') || k.toLowerCase().includes('owner') || k.toLowerCase().includes('director')).length === 0 && (
                        <p className={styles.value}>No direct technical associations detected in the relationship graph.</p>
                      )}
                   </div>
                </div>
              )}

              {/* TAB: SOURCES & PROVENANCE (REFERENTS MOVED TO TOP) */}
              {activeTab === 'sources' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                   {/* Cross-Border Referents: Clickable Research Network */}
                   <div className={styles.group}>
                      <h4 className={styles.groupTitle}><Link2 size={12} /> Clickable Referential Matrix</h4>
                      <div className={styles.sanctionCard} style={{ padding: '24px' }}>
                         <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '24px', lineHeight: 1.6 }}>Click any identifier to verify its original disclosure across global jurisdictional databases:</p>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                            {data.referents?.map((ref, i) => (
                              <a 
                                key={i} 
                                href={`https://www.opensanctions.org/entities/${ref}/`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.referentCard}
                                style={{ 
                                  display: 'flex', alignItems: 'center', gap: '12px', 
                                  background: 'rgba(255,255,255,0.02)', padding: '14px 18px', 
                                  borderRadius: '12px', border: '1px solid var(--border)',
                                  textDecoration: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  height: '54px'
                                }}
                              >
                                 <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Hash size={12} color="var(--primary)" />
                                 </div>
                                 <code style={{ 
                                   fontSize: '0.75rem', color: 'var(--foreground)', 
                                   fontWeight: 700, flex: 1, overflow: 'hidden', 
                                   textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                   fontFamily: 'var(--font-mono)' 
                                 }}>
                                   {ref}
                                 </code>
                                 <ExternalLink size={12} style={{ color: 'var(--secondary)', opacity: 0.5 }} />
                              </a>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Intelligence Timeline */}
                   <div className={styles.group}>
                      <h4 className={styles.groupTitle}><Clock size={12} /> Technical Investigation Timeline</h4>
                      <div className={styles.sanctionCard} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', padding: '24px' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 900 }}>Dossier Initialized</span>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--foreground)' }}>{new Date(data.first_seen).toLocaleDateString()}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{new Date(data.first_seen).toLocaleTimeString()} UTC</span>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 900 }}>Last Policy Update</span>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>{new Date(data.last_change).toLocaleDateString()}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{new Date(data.last_change).toLocaleTimeString()} UTC</span>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 900 }}>Intelligence Integrity Verified</span>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#22c55e' }}>{new Date(data.last_seen).toLocaleDateString()}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{new Date(data.last_seen).toLocaleTimeString()} UTC</span>
                         </div>
                      </div>
                   </div>

                   {/* Authoritative Datasets: Direct Jurisdictional Pivots */}
                   <div className={styles.group}>
                      <h4 className={styles.groupTitle}><Database size={12} /> Authoritative Source Matrix</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                         {data.datasets?.map((ds, i) => {
                           const originalSources = Array.from(new Set([...getArray("sourceUrl"), ...getArray("source_url")]));
                           const primarySource = originalSources.length > 0 ? originalSources[0] : null;
                           
                           return (
                             <div key={i} className={styles.sanctionCard} style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', right: '-20px', top: '-10px', opacity: 0.05 }}><Database size={80} /></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                   <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                                      <Globe size={24} color="var(--primary)" />
                                   </div>
                                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: '0.05em' }}>
                                         {primarySource ? 'DIRECT JURISDICTIONAL LINK' : 'GLOBAL DISCLOSURE'}
                                      </span>
                                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--foreground)' }}>{ds}</span>
                                   </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                   {primarySource && (
                                     <a href={primarySource} target="_blank" className={styles.summaryBtn} style={{ background: '#22c55e', color: 'white', border: 'none' }}>
                                        INSTITUTIONAL DISCLOSURE <ExternalLink size={14} />
                                     </a>
                                   )}
                                   <a href={`https://www.opensanctions.org/entities/${data.id}/`} target="_blank" className={styles.summaryBtn}>
                                      OS Verification <ExternalLink size={14} />
                                   </a>
                                </div>
                             </div>
                           )
                         })}
                      </div>
                   </div>
                </div>
              )}

              {/* TAB: DISCLOSURE (MASTER MATRIX) */}
              {activeTab === 'disclosure' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                   <div className={styles.group}>
                      <h4 className={styles.groupTitle}><Fingerprint size={14} /> Recursive Technical Matrix</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                         {/* Explicit Referents first */}
                         <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 4fr', gap: '40px', padding: '20px 30px', background: 'var(--surface)' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase' }}>REFERENTS</div>
                            <DataValueRenderer value={data.referents} label="referents" />
                         </div>
                         {Object.entries(props).map(([key, value]) => (
                           <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 4fr', gap: '40px', padding: '20px 30px', background: 'var(--surface)' }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase' }}>{key}</div>
                              <DataValueRenderer value={value} label={key} />
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR (1/3) */}
        <aside className={styles.sidebar} style={{ gap: '24px' }}>
           <div className={styles.sidebarCard}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Dossier ID</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                 <code style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 900, background: 'rgba(99,102,241,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{data.id}</code>
                 <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--secondary)', lineHeight: 1.6 }}>This dossier is a high-fidelity synthesis of authoritative global disclosures. To verify raw technical provenance, pivot to the official record page:</p>
                 <a 
                   href={`https://www.opensanctions.org/entities/${data.id}/`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style={{ 
                     display: 'flex', alignItems: 'center', gap: '10px', 
                     background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', 
                     padding: '12px 14px', borderRadius: '10px', color: 'var(--primary)',
                     fontSize: '0.75rem', fontWeight: 900, textDecoration: 'none',
                     transition: 'all 0.2s', textAlign: 'center', justifyContent: 'center'
                   }}
                   onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
                   onMouseOut={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                 >
                    <Globe size={14} /> VIEW ORIGINAL DISCLOSURE
                 </a>
              </div>
           </div>

           {/* Technical Data Audit Matrix - ALWAYS VISIBLE */}
           <div className={`${styles.sidebarCard}`} style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '16px', letterSpacing: '0.1em' }}>TECHNICAL AUDIT MATRIX</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>High-Risk Target</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: data.target ? '#f43f5e' : 'var(--foreground)' }}>{data.target ? "YES" : "NO"}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Referents Count</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)' }}>{data.referents?.length || 0} Records</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Datasets Provenance</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>{data.datasets?.length || 0} Sources</span>
                 </div>
              </div>
           </div>
           
           <div className={`${styles.sidebarCard} ${styles.policyBriefingCard}`}>
              <div className={styles.policyTitle}><Shield size={22} /> Compliance Policy Briefing</div>
              <p className={styles.policyText}>Adhering to institutional directives for the identification of high-risk monitored subjects.</p>
              <div className={styles.policyPoint}>
                 <div style={{ padding: '2px 8px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900 }}>01</div>
                 <span>Verify secondary identifiers in the recursive matrix.</span>
              </div>
              <div className={styles.policyPoint}>
                 <div style={{ padding: '2px 8px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900 }}>02</div>
                 <span>Examine familial risk exposure in the Relationships track.</span>
              </div>
           </div>
        </aside>
      </div>

      <footer style={{ marginTop: '60px', padding: '30px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)', fontSize: '0.75rem' }}>
        <span>Intelligence Snapshot: {new Date().toLocaleTimeString()}</span>
        <span>Aesthetic Engine v6.5 • All Modern Components Restored</span>
      </footer>
    </div>
  );
}
