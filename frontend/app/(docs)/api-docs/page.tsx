"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Code2, 
  Terminal, 
  Copy, 
  Shield, 
  Lock, 
  Zap, 
  Search, 
  ChevronRight, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Key,
  Database,
  Globe,
  Server,
  Activity,
  UserCheck
} from "lucide-react";
import styles from "./page.module.css";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export default function APIDocsPage() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [lang, setLang] = useState<"curl" | "node" | "python">("curl");

  useEffect(() => {
    // Simulate loading and check for API key in localStorage
    const timer = setTimeout(() => {
      setLoading(false);
      const savedKey = localStorage.getItem("amltab_api_key");
      if (savedKey) setApiKey(savedKey);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper} style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
        <p style={{ marginTop: '16px', color: 'var(--secondary)', fontWeight: 600 }}>Initializing Technical Workspace...</p>
      </div>
    );
  }

  const sections = [
    { id: "introduction", title: "Introduction", icon: BookOpen },
    { id: "authentication", title: "Authentication", icon: Lock },
    { id: "errors", title: "Error Codes", icon: AlertCircle },
    { id: "screening", title: "Screening API", icon: UserCheck, isEndpoint: true, method: "POST" },
    { id: "monitoring", title: "Monitoring", icon: Activity, isEndpoint: true, method: "POST" },
    { id: "audit", title: "Audit Logs", icon: Database, isEndpoint: true, method: "GET" },
    { id: "webhooks", title: "Webhooks", icon: Globe },
  ];

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Terminal className={styles.icon} color="var(--primary)" size={24} />
          <span className={styles.sidebarTitle}>Developer Hub</span>
        </div>
        
        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>
            <span className={styles.sectionTitle}>Getting Started</span>
            {filteredSections.filter(s => !s.isEndpoint).map(s => (
              <a 
                key={s.id} 
                className={`${styles.navLink} ${activeSection === s.id ? styles.navLinkActive : ""}`}
                onClick={() => setActiveSection(s.id)}
              >
                <s.icon size={18} /> {s.title}
              </a>
            ))}
          </div>

          <div className={styles.navSection}>
            <span className={styles.sectionTitle}>Endpoints</span>
            {filteredSections.filter(s => s.isEndpoint).map(s => (
              <a 
                key={s.id} 
                className={`${styles.navLink} ${activeSection === s.id ? styles.navLinkActive : ""}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span className={`${styles.methodBadge} ${s.method === 'POST' ? styles.methodPost : styles.methodGet}`}>
                  {s.method}
                </span>
                {s.title}
              </a>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search documentation..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.authActions}>
            <div className={`${styles.apiKeyBadge} ${apiKey ? styles.apiKeyActive : ""}`}>
              <Key size={14} />
              {apiKey ? `Key: ${apiKey.substring(0, 8)}...` : "No API Key Provided"}
            </div>
            {!apiKey && (
              <button className={styles.saveBtn} style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => window.location.href='/settings'}>
                Get API Key
              </button>
            )}
          </div>
        </header>

        <div className={styles.contentGrid}>
          {/* Documentation Text */}
          <div className={styles.docContent}>
            {activeSection === "introduction" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Introduction</h1>
                <p className={styles.subtitle}>
                  The AMLtab API allows you to programmatically perform sanctions, PEP, and adverse media screenings 
                  across global watchlists.
                </p>
                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>BASE_URL</span>
                  <code>https://api.amltab.com/v1</code>
                </div>
                <h2 className={styles.sectionHeading}>Core Concepts</h2>
                <p className={styles.paragraph}>
                  Our API is organized around REST. All requests are made over HTTPS and return JSON-encoded responses. 
                  We use standard HTTP response codes to indicate the success or failure of an API request.
                </p>
              </section>
            )}

            {activeSection === "authentication" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Authentication</h1>
                <p className={styles.subtitle}>
                  Authenticate your requests using the API key provided in your organization settings.
                </p>
                <div className={styles.settingsCard} style={{ background: 'var(--surface-hover)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <h3 className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '12px' }}>Bearer Token Authentication</h3>
                  <p className={styles.cardDesc}>
                    Include your API key in the <code>Authorization</code> header of every request.
                  </p>
                  <div className={styles.codeBlock} style={{ marginTop: '16px' }}>
                    <code>Authorization: Bearer YOUR_SECRET_KEY</code>
                  </div>
                </div>
                <div style={{ marginTop: '32px', display: 'flex', gap: '16px', padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <AlertCircle color="#ef4444" size={24} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>
                    <strong style={{ color: '#ef4444' }}>Security Note:</strong> Never share your secret API key in client-side code or public repositories.
                  </p>
                </div>
              </section>
            )}

            {activeSection === "screening" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Instant Screening</h1>
                <p className={styles.subtitle}>
                  Perform real-time screening for individuals or entities against global sanctions and PEP lists.
                </p>
                
                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>POST</span>
                  <code>/v1/screen</code>
                </div>

                <h3 className={styles.sectionHeading}>Request Body</h3>
                <table className={styles.paramTable}>
                  <thead>
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className={styles.paramName}>name</span><span className={styles.requiredBadge}>Required</span></td>
                      <td className={styles.paramType}>string</td>
                      <td className={styles.paramDesc}>Full name of the individual or entity.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>type</span></td>
                      <td className={styles.paramType}>string</td>
                      <td className={styles.paramDesc}>Specifies <code>individual</code> or <code>entity</code>. Defaults to individual.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>fuzzy_threshold</span></td>
                      <td className={styles.paramType}>number</td>
                      <td className={styles.paramDesc}>Override the organization's fuzzy match sensitivity (0-100).</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {activeSection === "audit" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Audit Retrieval</h1>
                <p className={styles.subtitle}>
                  Fetch institutional audit logs and screening history for compliance reporting.
                </p>
                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>GET</span>
                  <code>/v1/history</code>
                </div>
                <h3 className={styles.sectionHeading}>Query Parameters</h3>
                <table className={styles.paramTable}>
                  <thead>
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className={styles.paramName}>limit</span></td>
                      <td className={styles.paramType}>integer</td>
                      <td className={styles.paramDesc}>Number of records to return. Max 100.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>status</span></td>
                      <td className={styles.paramType}>string</td>
                      <td className={styles.paramDesc}>Filter by status (e.g., <code>clear</code>, <code>match</code>).</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}
          </div>

          {/* Code Panel */}
          <div className={styles.codePanel}>
            <div className={styles.codeHeader}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className={`${styles.langLabel} ${lang === 'curl' ? styles.langActive : ""}`} 
                  onClick={() => setLang('curl')}
                  style={{ color: lang === 'curl' ? 'white' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  cURL
                </button>
                <button 
                  className={`${styles.langLabel} ${lang === 'node' ? styles.langActive : ""}`} 
                  onClick={() => setLang('node')}
                  style={{ color: lang === 'node' ? 'white' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Node.js
                </button>
                <button 
                  className={`${styles.langLabel} ${lang === 'python' ? styles.langActive : ""}`} 
                  onClick={() => setLang('python')}
                  style={{ color: lang === 'python' ? 'white' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Python
                </button>
              </div>
              <button className={styles.copyBtn} onClick={() => copyToClipboard('Example Code')}>
                <Copy size={16} />
              </button>
            </div>

            {activeSection === "screening" && (
              <div className={styles.codeBlock}>
                <pre style={{ margin: 0 }}>
                  {lang === 'curl' ? (
`curl -X POST https://api.amltab.com/v1/screen \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Artem Uss",
    "type": "individual",
    "fuzzy_threshold": 85
  }'`
                  ) : lang === 'node' ? (
`const res = await fetch('https://api.amltab.com/v1/screen', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Artem Uss',
    type: 'individual'
  })
});

const data = await res.json();`
                  ) : (
`import requests

url = "https://api.amltab.com/v1/screen"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "name": "Artem Uss",
    "type": "individual"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`
                  )}
                </pre>
              </div>
            )}

            {activeSection === "introduction" && (
              <div className={styles.codeBlock}>
                <div style={{ color: '#94a3b8', marginBottom: '16px', fontStyle: 'italic' }}>
                  // Authentication Example
                </div>
                <pre style={{ margin: 0 }}>
                  {`curl -i https://api.amltab.com/v1/auth/me \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                </pre>
              </div>
            )}

            <div className={styles.codeBlock} style={{ background: 'rgba(255,255,255,0.03)', borderStyle: 'dashed' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800, marginBottom: '8px', fontSize: '0.75rem' }}>RESPONSE OBJECT</div>
              <pre style={{ margin: 0, color: '#94a3b8' }}>
{`{
  "status": "success",
  "data": {
    "id": "scr_9281a",
    "hit_count": 0,
    "verdict": "clear"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
