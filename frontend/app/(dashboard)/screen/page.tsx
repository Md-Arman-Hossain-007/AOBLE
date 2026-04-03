"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";
import { User, Building2, UploadCloud, Search, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import Image from "next/image";
import CountrySelect from "../../components/CountrySelect";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type ScreeningType = "individual" | "entity";

interface ScreeningResult {
  screening_id: string;
  overall_status: string;
  summary: {
    total_matches: number;
    pep_matches: number;
    sanction_matches: number;
    watchlist_matches: number;
  };
}

export default function ScreenPage() {
  const router = useRouter();
  const [screeningType, setScreeningType] = useState<ScreeningType>("individual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [threshold, setThreshold] = useState(80);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("amltab_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Validation
    if (screeningType === "individual") {
      if (!firstName.trim() && !lastName.trim()) {
        setError("Please enter a first name or last name.");
        return;
      }
    } else if (screeningType === "entity") {
      if (!companyName.trim()) {
        setError("Please enter a company or entity name.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        screening_type: screeningType,
        first_name: screeningType === "individual" ? firstName : undefined,
        last_name: screeningType === "individual" ? lastName : undefined,
        company_name: screeningType === "entity" ? companyName : undefined,
        date_of_birth: dateOfBirth || undefined,
        country: country || undefined,
        threshold: threshold / 100,
      };

      const res = await fetch(`${API_URL}/screen/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("amltab_token");
          router.push("/signin");
          return;
        }
        throw new Error(data.detail || "Screening failed. Please try again.");
      }

      setResult(data);
      
      // Navigate to results page after short delay
      setTimeout(() => {
        router.push(`/screenings/${data.screening_id}`);
      }, 1500);
    } catch (err) {
      console.error("Screening error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFirstName("");
    setLastName("");
    setCompanyName("");
    setDateOfBirth("");
    setCountry("");
    setThreshold(80);
    setError(null);
    setResult(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Batch removed
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Retrieving screening matrices..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>New Screening</h1>
          <p className={styles.subtitle}>Check individuals or entities against global watchlists, sanctions, and PEPs.</p>
        </div>
      </header>

      <div className={styles.content}>
        {/* Type Selector */}
        <div className={styles.typeSelector}>
          <button 
            className={`${styles.typeBtn} ${screeningType === "individual" ? styles.activeType : ""}`}
            onClick={() => { setScreeningType("individual"); setError(null); }}
          >
            <User size={20} className={styles.typeIcon} />
            <div className={styles.typeText}>
              <h3>Individual</h3>
              <p>Screen a single person</p>
            </div>
          </button>
          
          <button 
            className={`${styles.typeBtn} ${screeningType === "entity" ? styles.activeType : ""}`}
            onClick={() => { setScreeningType("entity"); setError(null); }}
          >
            <Building2 size={20} className={styles.typeIcon} />
            <div className={styles.typeText}>
              <h3>Entity</h3>
              <p>Screen a company or org</p>
            </div>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className={styles.dismissBtn}>×</button>
          </div>
        )}

        {/* Result Banner */}
        {result && (
          <div className={styles.successBanner}>
            <div className={styles.successIconWrapper}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.successContent}>
              <h3>Screening Initiated Successfully</h3>
              <p>
                Status: <strong>{result.overall_status}</strong>. 
                {result.summary.total_matches > 0 
                  ? ` Found ${result.summary.total_matches} potential match(es).` 
                  : " No immediate matches found."}
              </p>
              <div className={styles.redirectNotice}>
                Redirecting to detailed report...
              </div>
            </div>
          </div>
        )}

        <div className={styles.formCard}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Primary Information</h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>First Name {screeningType === "entity" && "(Optional)"}</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John" 
                      className={styles.input}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={screeningType !== "individual"}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>{screeningType === "entity" ? "Entity / Company Name" : "Last Name"}</label>
                    <input 
                      type="text" 
                      placeholder={screeningType === "entity" ? "e.g. Acme Corp" : "e.g. Doe"} 
                      className={styles.input}
                      value={screeningType === "entity" ? companyName : lastName}
                      onChange={(e) => {
                        if (screeningType === "entity") {
                          setCompanyName(e.target.value);
                        } else {
                          setLastName(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Country / Nationality</label>
                    <CountrySelect 
                      value={country}
                      onChange={(val) => setCountry(val)}
                      placeholder="Select origin country"
                    />
                  </div>
                  
                  {screeningType === "individual" && (
                    <div className={styles.formGroup}>
                      <label>Date of Birth</label>
                      <input 
                        type="date" 
                        className={styles.input}
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Match Threshold</h3>
                <div className={styles.thresholdRow}>
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className={styles.thresholdSlider}
                    style={{
                      background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(threshold - 50) / 50 * 100}%, rgba(255, 255, 255, 0.1) ${(threshold - 50) / 50 * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                    }}
                  />
                  <span className={styles.thresholdValue}>{threshold}%</span>
                </div>
                <p className={styles.thresholdHint}>
                  Higher values = stricter matching. 80% is recommended for most cases.
                </p>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.secondaryBtn} onClick={handleClear}>
                  Clear Form
                </button>
                <button 
                  type="submit" 
                  className={styles.primaryBtn}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  }}
                >
                  <Search size={18} />
                  Run Screening
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
