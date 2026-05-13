"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield,
  Activity,
  User,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  AlertTriangle,
  Send,
  MoreVertical,
  Layers,
  Search,
  Check
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "../page.module.css";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

interface CaseDetail {
  case: any;
  assignments: any[];
  notes: any[];
  history: any[];
  workflow_instance?: any;
  related_screening?: any;
}

const API_URL = "/api/v1";

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCase = async () => {
    const token = localStorage.getItem("amltab_token");
    if (!token) {
      setError("Authentication token missing. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await fetch(`${API_URL}/compliance/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setData(await res.json());
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setError("Investigation case not found in our records.");
        } else if (res.status === 403) {
          setError("Access denied. You do not have permission to view this case.");
        } else if (res.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(errData.detail || `Server error (${res.status}). Please contact support.`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch case detail:", err);
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCase();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/compliance/cases/${id}/notes`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newNote })
      });
      if (res.ok) {
        setNewNote("");
        fetchCase();
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const updateStatus = async (status: string) => {
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/compliance/cases/${id}/status`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchCase();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) return (
    <div className={styles.container} style={{padding: '100px', textAlign: 'center'}}>
      <LoadingSpinner text="Synthesizing investigation data..." />
    </div>
  );

  if (error) return (
    <div className={styles.container} style={{padding: '100px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'}}>
      <div style={{ color: '#f87171', fontSize: '1.2rem', fontWeight: 600 }}>{error}</div>
      <button 
        onClick={() => fetchCase()}
        style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#4F46E5', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Retry Connection
      </button>
      <button 
        onClick={() => router.push('/history/all')}
        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Return to History
      </button>
    </div>
  );

  if (!data) return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <button onClick={() => router.back()} style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back to Inbox
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 className={styles.title}>{data.case.title}</h1>
            <span className={`${styles.priorityBadge} ${data.case.priority === 'high' ? styles.priorityHigh : styles.priorityMedium}`}>
                {data.case.priority}
            </span>
          </div>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Case Ref: {data.case.id.slice(0, 12)}... • Created by {data.case.created_by}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
             <button 
               className={styles.actionBtn}
               style={{ backgroundColor: '#22C55E', color: '#fff', border: 'none', padding: '10px 20px' }}
               onClick={() => updateStatus('resolved')}
             >Resolve Case</button>
             <button 
               className={styles.actionBtn}
               style={{ backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '10px 20px' }}
               onClick={() => updateStatus('escalated')}
             >Escalate</button>
        </div>
      </header>

      <div className={styles.detailGrid}>
        {/* Left Panel: Workflow & Evidence */}
        <div className={styles.mainPanel}>
          {/* Related Screening Context */}
          {data.related_screening && (
             <section className={styles.card}>
                <h3 className={styles.cardTitle}><Search size={18} /> Investigative Context</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Subject Name</span>
                      <span style={{ fontSize: '0.9rem', color: '#fff' }}>{data.related_screening.customer_name}</span>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Entity Type</span>
                      <span style={{ fontSize: '0.9rem', color: '#fff' }}>{data.related_screening.schema_type}</span>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                      <Link href={`/screenings/${data.related_screening.id}`} style={{ color: '#4F46E5', fontSize: '0.875rem', fontWeight: 600 }}>
                         View Raw Screening
                      </Link>
                   </div>
                </div>
             </section>
          )}

          {/* Workflow Stepper */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}><Layers size={18} /> Investigative Workflow</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '32px' }}>
               {['Pending', 'Under Review', 'Due Diligence', 'Final Decision'].map((step, idx) => {
                 const currentStep = data.workflow_instance?.current_step ?? 1;
                 const isActive = idx <= currentStep;
                 return (
                   <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1, position: 'relative' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#4F46E5' : '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        border: '2px solid',
                        borderColor: isActive ? '#6366F1' : '#334155'
                      }}>
                        {idx < currentStep ? <Check size={16} /> : (idx + 1)}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? '#fff' : '#64748b' }}>{step}</span>
                   </div>
                 );
               })}
               {/* Connector Line */}
               <div style={{ position: 'absolute', top: '16px', left: '0', right: '0', height: '2px', backgroundColor: '#1E293B' }}></div>
            </div>
          </section>

          {/* Activity / Audit Logs */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}><Activity size={18} /> Audit History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.history.map((h, hi) => (
                <div key={hi} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4F46E5', marginTop: '4px' }}></div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>{h.description}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>by {h.performed_by} • {new Date(h.created_at).toLocaleString()}</span>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Panel: Notes & Assignments */}
        <aside className={styles.sidePanel}>
           {/* Current Assignee */}
           <div className={styles.card}>
              <h3 className={styles.cardTitle}><User size={18} /> Assignee</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                    {data.case.assigned_to?.slice(0, 2).toUpperCase() || 'U'}
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{data.case.assigned_to || 'Unassigned'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Compliance Analyst</span>
                 </div>
              </div>
              <button style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '10px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                 Reassign Case
              </button>
           </div>

           {/* Investigation Notes */}
           <div className={styles.card} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className={styles.cardTitle}><MessageSquare size={18} /> Investigation Notes</h3>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px' }}>
                 {data.notes.map((n, ni) => (
                    <div key={ni} style={{ backgroundColor: '#1E293B', padding: '12px', borderRadius: '12px', position: 'relative' }}>
                       <p style={{ fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '8px' }}>{n.content}</p>
                       <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{n.author} • {new Date(n.created_at).toLocaleTimeString()}</span>
                    </div>
                 ))}
                 {data.notes.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', padding: '20px' }}>No notes added yet.</p>}
              </div>

              <form onSubmit={handleAddNote} style={{ position: 'relative' }}>
                 <textarea 
                   style={{
                     width: '100%',
                     backgroundColor: '#1E293B',
                     border: '1px solid rgba(255, 255, 255, 0.1)',
                     borderRadius: '12px',
                     padding: '12px',
                     paddingRight: '48px',
                     color: '#fff',
                     fontSize: '0.875rem',
                     minHeight: '80px',
                     resize: 'none',
                     outline: 'none'
                   }}
                   placeholder="Add internal note..."
                   value={newNote}
                   onChange={(e) => setNewNote(e.target.value)}
                 ></textarea>
                 <button 
                   type="submit"
                   disabled={submittingNote || !newNote.trim()}
                   style={{ position: 'absolute', right: '12px', bottom: '12px', backgroundColor: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', opacity: (submittingNote || !newNote.trim()) ? 0.5 : 1 }}
                 >
                    <Send size={16} />
                 </button>
              </form>
           </div>
        </aside>
      </div>
    </div>
  );
}
