"use client";

import React from "react";
import { BookOpen, Code2, Terminal, Copy, Shield, Lock, Zap } from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export default function APIDocsPage() {
  const [loading, setLoading] = React.useState(false);
  
  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Retrieving technical documentation..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto", animation: "fadeIn 0.5s ease-out" }}>
      <header style={{ marginBottom: "40px", borderBottom: "1px solid var(--border)", paddingBottom: "24px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "12px", letterSpacing: "-0.04em" }}>
          API Documentation
        </h1>
        <p style={{ color: "var(--secondary)", fontSize: "1.1rem" }}>
          Integrate AML screening directly into your application with our high-performance REST API.
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", marginBottom: "48px" }}>
        <div style={{ padding: "24px", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(79, 70, 229, 0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Terminal size={20} style={{ margin: "10px" }} />
          </div>
          <h3 style={{ color: "var(--foreground)", fontWeight: 700, marginBottom: "8px" }}>REST API</h3>
          <p style={{ color: "var(--secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
            Standard HTTP endpoints for screenings, monitoring, and audit retrieval.
          </p>
        </div>
        <div style={{ padding: "24px", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Shield size={20} style={{ margin: "10px" }} />
          </div>
          <h3 style={{ color: "var(--foreground)", fontWeight: 700, marginBottom: "8px" }}>Webhooks</h3>
          <p style={{ color: "var(--secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
            Real-time event notifications for monitoring hits and case updates.
          </p>
        </div>
      </section>

      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "10px" }}>
            <Code2 size={20} color="var(--primary)" /> Authentication
          </h2>
          <button style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <Copy size={16} /> Copy Header
          </button>
        </div>
        <div style={{ backgroundColor: "var(--surface-hover)", borderRadius: "12px", padding: "20px", border: "1px solid var(--border)", overflowX: "auto" }}>
          <code style={{ fontFamily: "monospace", color: "var(--primary)", fontSize: "0.9rem" }}>
            Authorization: Bearer YOUR_API_KEY
          </code>
        </div>
        <p style={{ marginTop: "16px", fontSize: "0.875rem", color: "var(--secondary)" }}>
          Manage your API keys in the <span style={{ color: "var(--primary)", fontWeight: 600 }}>Settings &gt; Integrations</span> section.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", border: "2px dashed var(--border)", borderRadius: "32px", textAlign: "center" }}>
        <div>
          <BookOpen size={48} style={{ color: "var(--border)", margin: "0 auto 16px" }} />
          <h3 style={{ color: "var(--foreground)", fontWeight: 700, marginBottom: "8px" }}>Coming Soon: Interactive Docs</h3>
          <p style={{ color: "var(--secondary)", fontSize: "0.9rem" }}>
            We're building a Swagger/OpenAPI playground to test endpoints live.
          </p>
        </div>
      </div>
    </div>
  );
}
