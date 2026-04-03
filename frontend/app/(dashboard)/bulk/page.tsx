"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Trash2, 
  Info,
  Database,
  Building2,
  User,
  ShieldCheck,
  Zap,
  Play,
  RotateCw
} from "lucide-react";
import styles from "./page.module.css";
import { LoadingSpinner } from "../../components/LoadingSpinner";

interface BulkJob {
  id: string;
  filename: string;
  status: string;
  progress: number;
  processed: number;
  total: number;
  created_at: string;
  results_summary?: any;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function BulkCenterPage() {
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/bulk/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    setError(null);
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/bulk/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        fetchJobs(); // Refresh list immediately
      } else {
        const errData = await res.json();
        setError(errData.detail || "Upload failed");
      }
    } catch (err) {
      setError("Network error during upload");
    } finally {
      setUploading(false);
    }
  }, [fetchJobs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  // Polling for active jobs
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(() => {
      const activeJobs = jobs.some(j => j.status === 'pending' || j.status === 'processing');
      if (activeJobs) {
        fetchJobs();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs, jobs.length]); // Re-run if job list changes

  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return styles.statusPending;
      case 'processing': return styles.statusProcessing;
      case 'completed': return styles.statusCompleted;
      case 'failed': return styles.statusFailed;
      default: return "";
    }
  };

  const getJobProgress = (job: BulkJob) => {
    if (job.status === 'completed') return 100;
    if (job.status === 'pending') return 0;
    if (job.total === 0) return 0;
    return Math.round((job.processed / job.total) * 100);
  };

  const deleteJob = async (jobId: string) => {
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/bulk/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Bulk Center</h1>
        <p className={styles.subtitle}>Execute high-volume identity and entity screenings via file ingestion.</p>
      </header>

      <section className={styles.uploadSection}>
        <div 
          {...getRootProps()} 
          className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""}`}
        >
          <input {...getInputProps()} />
          <div className={styles.uploadIcon}>
            {uploading ? <LoadingSpinner size="small" /> : <Upload size={32} />}
          </div>
          <div className={styles.uploadTitle}>
            {uploading ? "Uploading..." : (isDragActive ? "Drop the file here" : "Drag & drop files to screen")}
          </div>
          <p className={styles.uploadHint}>Support for .CSV, .XLS, .XLSX (Max 10k rows)</p>
          {!uploading && <button className={styles.browseBtn}>Browse Files</button>}
          {error && <p style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '12px' }}>{error}</p>}
        </div>

        <aside className={styles.infoCard}>
          <h3 className={styles.infoTitle}><Info size={18} /> Integration Guide</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <CheckCircle2 size={14} />
              <span>Use <strong>UTF-8</strong> encoding for CSV files.</span>
            </div>
            <div className={styles.infoItem}>
              <CheckCircle2 size={14} />
              <span>Required columns: <strong>name</strong> or <strong>first_name, last_name</strong>.</span>
            </div>
            <div className={styles.infoItem}>
              <CheckCircle2 size={14} />
              <span>Optional: <strong>dob, country, type</strong> (individual/entity).</span>
            </div>
          </div>
          <button className={styles.templateBtn}>
            <Download size={14} /> Download CSV Template
          </button>
        </aside>
      </section>

      <section>
        <div className={styles.sectionTitle}>
          <Database size={20} /> Active & Recent Jobs
        </div>
        
        {loading && jobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <LoadingSpinner />
          </div>
        ) : jobs.length === 0 ? (
          <div className={styles.infoCard} style={{ textAlign: 'center', padding: '60px', marginTop: '20px' }}>
             <Zap size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
             <p style={{ color: '#94a3b8' }}>No bulk screenings recorded yet. Upload a file to begin.</p>
          </div>
        ) : (
          <div className={styles.jobsGrid} style={{ marginTop: '20px' }}>
            {jobs.map(job => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobCardHeader}>
                  <div className={styles.jobInfo}>
                    <span className={styles.jobFilename}>{job.filename}</span>
                    <span className={styles.jobMeta}>
                      ID: {job.id.slice(0, 8)} • {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                {(job.status === 'processing' || job.status === 'pending' || job.status === 'completed') && (
                  <div className={styles.progressContainer}>
                    <div className={styles.progressHeader}>
                      <span>{job.status === 'completed' ? 'Processing Complete' : (job.status === 'pending' ? 'Queued' : 'Scanning Records...')}</span>
                      <span>{getJobProgress(job)}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${getJobProgress(job)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {job.status === 'completed' && job.results_summary && (
                  <div className={styles.jobStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Hits</span>
                      <span className={styles.statValue} style={{ color: '#f87171' }}>
                        {job.results_summary.high_risk || 0}
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Medium</span>
                      <span className={styles.statValue} style={{ color: '#fbbf24' }}>
                        {job.results_summary.medium_risk || 0}
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Total</span>
                      <span className={styles.statValue}>{job.total}</span>
                    </div>
                  </div>
                )}

                {job.status === 'failed' && (
                  <div style={{ fontSize: '0.75rem', color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '8px' }}>
                    <AlertCircle size={12} style={{ marginRight: '4px', display: 'inline' }} />
                    {job.error || "Processing failed. Please check file format."}
                  </div>
                )}

                <div className={styles.jobActions}>
                  <button className={styles.actionBtn}>
                    <Download size={14} /> Export Results
                  </button>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => deleteJob(job.id)}
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
