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
  UserCheck,
  FileText,
  Layers
} from "lucide-react";
import styles from "./page.module.css";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { FULL_EXAMPLE_RESPONSE, CLEAR_EXAMPLE_RESPONSE, COMPANY_EXAMPLE_RESPONSE, COMPANY_CLEAR_EXAMPLE_RESPONSE } from './example-response';

export default function APIDocsPage() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [lang, setLang] = useState<"curl" | "node" | "python">("curl");
  const [responseType, setResponseType] = useState<"ind_match" | "ind_clear" | "com_match" | "com_clear">("ind_match");

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
    { id: "screening", title: "Instant Screening", icon: UserCheck, isEndpoint: true, method: "POST" },
    { id: "bulk", title: "Bulk Screening", icon: Layers, isEndpoint: true, method: "POST" },
    { id: "cases", title: "Case Management", icon: FileText, isEndpoint: true, method: "POST" },
    { id: "monitoring", title: "Ongoing Monitoring", icon: Activity, isEndpoint: true, method: "POST" },
    { id: "audit", title: "Audit & History", icon: Database, isEndpoint: true, method: "GET" },
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
                <h1 className={styles.title}>API Documentation</h1>
                <p className={styles.subtitle}>
                  The AMLTAB Technical Interface provides institutional-grade access to global compliance intelligence, 
                  supporting automated Sanctions, PEP, and Adverse Media screenings at scale.
                </p>

                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>BASE_URL</span>
                  <code>https://api.amltab.com/api/v1/amltab</code>
                </div>

                <h2 className={styles.sectionHeading}>Institutional Standards</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div className={styles.featureCard}>
                    <Shield size={20} color="var(--primary)" />
                    <h4>Security & Compliance</h4>
                    <p>AES-256 encryption at rest, TLS 1.3 in transit. Full SOC2 Type II compliance in data handling.</p>
                  </div>
                  <div className={styles.featureCard}>
                    <Zap size={20} color="var(--primary)" />
                    <h4>Scalable Architecture</h4>
                    <p>Sub-100ms internal latency with support for burst traffic up to 5,000 requests per minute.</p>
                  </div>
                </div>

                <h2 className={styles.sectionHeading}>Global Configuration</h2>
                <p className={styles.paragraph}>
                  All API endpoints adhere to the following standards:
                </p>
                <ul className={styles.list}>
                  <li><strong>Format:</strong> All requests and responses are <code>application/json</code>.</li>
                  <li><strong>Date Format:</strong> ISO 8601 (e.g., <code>2024-04-22T12:00:00Z</code>).</li>
                  <li><strong>Rate Limiting:</strong> Tier-based limits apply. Standard enterprise accounts support 100 requests/sec.</li>
                  <li><strong>Pagination:</strong> <code>limit</code> and <code>offset</code> parameters are supported on all <code>GET</code> list endpoints.</li>
                </ul>
              </section>
            )}
            {activeSection === "authentication" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Secure Authentication</h1>
                <p className={styles.subtitle}>
                  The AMLTAB API uses Bearer Token authentication. All requests must be made over HTTPS to ensure credential security.
                </p>
                <div className={styles.settingsCard} style={{ background: 'var(--surface-hover)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <h3 className={styles.cardTitle} style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px' }}>Custom API Header</h3>
                  <p className={styles.paragraph} style={{ fontSize: '0.9rem' }}>
                    Include your organization's secret API key in the <code>amltab-api-key</code> header of every request.
                  </p>
                  <div className={styles.codeBlock} style={{ marginTop: '16px' }}>
                    <code>amltab-api-key: {'{YOUR_SECRET_KEY}'}</code>
                  </div>
                </div>
                <div style={{ marginTop: '32px', display: 'flex', gap: '16px', padding: '24px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <Shield color="#ef4444" size={24} />
                  <div>
                    <h5 style={{ color: '#ef4444', fontWeight: 800, marginBottom: '4px' }}>Credential Security</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', lineHeight: 1.5 }}>
                      Your API keys grant full access to your organization's screening capacity. Never commit keys to version control 
                      or expose them in client-side applications. Rotate keys immediately if a compromise is suspected.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "errors" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Error Resolution</h1>
                <p className={styles.subtitle}>
                  AMLTAB uses standard HTTP status codes to communicate request status and business logic errors.
                </p>
                <table className={styles.paramTable}>
                  <thead>
                    <tr><th>Code</th><th>Title</th><th>Description & Remediation</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>400</code></td>
                      <td style={{ color: '#ef4444', fontWeight: 700 }}>Bad Request</td>
                      <td className={styles.paramDesc}>Malformed JSON or missing required fields. Check <code>individual.name</code>.</td>
                    </tr>
                    <tr>
                      <td><code>401</code></td>
                      <td style={{ color: '#ef4444', fontWeight: 700 }}>Unauthorized</td>
                      <td className={styles.paramDesc}>Invalid or expired API Key. Verify the <code>amltab-api-key</code> header.</td>
                    </tr>
                    <tr>
                      <td><code>429</code></td>
                      <td style={{ color: '#f59e0b', fontWeight: 700 }}>Too Many Requests</td>
                      <td className={styles.paramDesc}>Rate limit exceeded. Implement exponential backoff for retries.</td>
                    </tr>
                    <tr>
                      <td><code>500</code></td>
                      <td style={{ color: '#ef4444', fontWeight: 700 }}>Internal Error</td>
                      <td className={styles.paramDesc}>Unexpected server issue. Please contact technical support if persistent.</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {activeSection === "screening" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Institutional Screening</h1>
                <p className={styles.subtitle}>
                  Identify and assess risk for individuals and entities across the AMLTAB Global Intelligence Network (1,000+ sources).
                </p>
                
                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>POST</span>
                  <code>/api/v1/amltab/screenings/</code>
                </div>

                <h3 className={styles.sectionHeading}>Polymorphic Payload</h3>
                <p className={styles.paragraph}>The screening request is polymorphic. You must provide either the <code>individual</code> or <code>entity</code> object based on the subject type.</p>
                
                <h3 className={styles.sectionHeading}>Individual Screening Payload</h3>
                <p className={styles.paragraph}>Required parameters when <code>type</code> is set to <code>individual</code>.</p>
                <table className={styles.paramTable}>
                  <thead>
                    <tr><th>Parameter</th><th>Type</th><th>Requirement</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className={styles.paramName}>type</span></td>
                      <td className={styles.paramType}>string</td>
                      <td><span className={styles.requiredBadge}>Required</span></td>
                      <td className={styles.paramDesc}>Set to <code>individual</code>.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>first_name</span></td>
                      <td className={styles.paramType}>string</td>
                      <td><span className={styles.requiredBadge}>Required</span></td>
                      <td className={styles.paramDesc}>Subject's given name.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>last_name</span></td>
                      <td className={styles.paramType}>string</td>
                      <td><span className={styles.requiredBadge}>Required</span></td>
                      <td className={styles.paramDesc}>Subject's family name.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>dob</span></td>
                      <td className={styles.paramType}>string</td>
                      <td>Optional</td>
                      <td className={styles.paramDesc}>Date of birth (e.g., <code>1990-01-01</code>).</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>country</span></td>
                      <td className={styles.paramType}>string</td>
                      <td>Optional</td>
                      <td className={styles.paramDesc}>Subject's country of residence or nationality.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>threshold</span></td>
                      <td className={styles.paramType}>int</td>
                      <td>Optional</td>
                      <td className={styles.paramDesc}>Match sensitivity (0-100). Default: <code>80</code>.</td>
                    </tr>
                  </tbody>
                </table>

                <h3 className={styles.sectionHeading} style={{ marginTop: '48px' }}>Company Screening Payload</h3>
                <p className={styles.paragraph}>Required parameters when <code>type</code> is set to <code>company</code>.</p>
                <table className={styles.paramTable}>
                  <thead>
                    <tr><th>Parameter</th><th>Type</th><th>Requirement</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className={styles.paramName}>type</span></td>
                      <td className={styles.paramType}>string</td>
                      <td><span className={styles.requiredBadge}>Required</span></td>
                      <td className={styles.paramDesc}>Set to <code>company</code>.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>name</span></td>
                      <td className={styles.paramType}>string</td>
                      <td><span className={styles.requiredBadge}>Required</span></td>
                      <td className={styles.paramDesc}>Legal name of the entity.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>registration_number</span></td>
                      <td className={styles.paramType}>string</td>
                      <td>Optional</td>
                      <td className={styles.paramDesc}>Official company registration/tax number. Can be <code>null</code>.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>country</span></td>
                      <td className={styles.paramType}>string</td>
                      <td>Optional</td>
                      <td className={styles.paramDesc}>Country of incorporation or operation.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>threshold</span></td>
                      <td className={styles.paramType}>int</td>
                      <td>Optional</td>
                      <td className={styles.paramDesc}>Match sensitivity (0-100). Default: <code>85</code>.</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {activeSection === "bulk" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Bulk Screening</h1>
                <p className={styles.subtitle}>
                  Process thousands of records asynchronously. Perfect for onboarding large client portfolios.
                </p>
                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>POST</span>
                  <code>/api/v1/bulk/jobs</code>
                </div>
                <h3 className={styles.sectionHeading}>Workflow</h3>
                <ol className={styles.list}>
                  <li>Submit a list of screenings via the <code>/bulk/jobs</code> endpoint.</li>
                  <li>Receive a <code>job_id</code> in the response.</li>
                  <li>Poll <code>/bulk/jobs/{"{job_id}"}</code> for completion status.</li>
                </ol>
              </section>
            )}

            {activeSection === "cases" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Case Management</h1>
                <p className={styles.subtitle}>
                  Enterprise workflow for decisioning, escalation, and resolution of potential matches.
                </p>
                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>POST</span>
                  <code>/api/v2/cases</code>
                </div>
                <h3 className={styles.sectionHeading}>Create Case</h3>
                <p className={styles.paragraph}>Link a screening result to a formal compliance case for investigation.</p>
                <table className={styles.paramTable}>
                  <thead>
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className={styles.paramName}>screening_id</span><span className={styles.requiredBadge}>Required</span></td>
                      <td className={styles.paramType}>string</td>
                      <td className={styles.paramDesc}>The ID of the screening that requires investigation.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>assigned_to</span></td>
                      <td className={styles.paramType}>string</td>
                      <td className={styles.paramDesc}>User ID of the compliance officer.</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {activeSection === "audit" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Audit & History</h1>
                <p className={styles.subtitle}>
                  Full institutional audit logs for regulatory compliance and internal review.
                </p>
                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>GET</span>
                  <code>/api/v1/history/audit</code>
                </div>
                <h3 className={styles.sectionHeading}>Filters</h3>
                <table className={styles.paramTable}>
                  <thead>
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className={styles.paramName}>type</span></td>
                      <td className={styles.paramType}>string</td>
                      <td className={styles.paramDesc}><code>screening</code>, <code>bulk</code>, or <code>case</code>.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>start_date</span></td>
                      <td className={styles.paramType}>ISO8601</td>
                      <td className={styles.paramDesc}>Filter logs after this date.</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}
            {activeSection === "monitoring" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Ongoing Monitoring</h1>
                <p className={styles.subtitle}>
                  Automate compliance by subscribing to real-time risk updates for screened entities.
                </p>
                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>POST</span>
                  <code>/api/v1/monitoring/entities</code>
                </div>
                <h3 className={styles.sectionHeading}>Monitor Entity</h3>
                <p className={styles.paragraph}>Enable continuous tracking for an entity. AMLTAB will alert you if their risk profile changes.</p>
                <table className={styles.paramTable}>
                  <thead>
                    <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className={styles.paramName}>customer_ref</span></td>
                      <td className={styles.paramType}>string</td>
                      <td className={styles.paramDesc}>Unique identifier for the relationship.</td>
                    </tr>
                    <tr>
                      <td><span className={styles.paramName}>entity_id</span></td>
                      <td className={styles.paramType}>string</td>
                      <td className={styles.paramDesc}>The target system ID of the entity.</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {activeSection === "webhooks" && (
              <section className={styles.section}>
                <h1 className={styles.title}>Webhooks</h1>
                <p className={styles.subtitle}>
                  Receive real-time push notifications for screening completions and monitoring alerts.
                </p>
                <div className={styles.endpoint}>
                  <span className={styles.endpointMethod}>POST</span>
                  <code>/api/v1/integrations/webhooks</code>
                </div>
                <h3 className={styles.sectionHeading}>Event Types</h3>
                <ul className={styles.list}>
                  <li><code>screening.completed</code>: Triggered when a match analysis finishes.</li>
                  <li><code>monitoring.alert</code>: Triggered when a monitored entity's risk level changes.</li>
                  <li><code>case.updated</code>: Triggered when a compliance officer updates a case status.</li>
                </ul>
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
`curl -X POST https://api.amltab.com/api/v1/amltab/screenings/ \\
  -H "amltab-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "individual",
    "first_name": "kim",
    "last_name": "jong_un",
    "dob": "1990-1234-23",
    "country": "Afghanistan",
    "threshold": 80
  }'`
                  ) : lang === 'node' ? (
`const response = await fetch('https://api.amltab.com/api/v1/amltab/screenings/', {
  method: 'POST',
  headers: {
    'amltab-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'individual',
    first_name: 'kim',
    last_name: 'jong_un',
    dob: '1990-1234-23',
    country: 'Afghanistan',
    threshold: 80
  })
});

const data = await response.json();`
                  ) : (
`import requests

url = "https://api.amltab.com/api/v1/amltab/screenings/"
payload = {
    "type": "individual",
    "first_name": "kim",
    "last_name": "jong_un",
    "dob": "1990-1234-23",
    "country": "Afghanistan",
    "threshold": 80
}
headers = {
    "amltab-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
                  )}
                </pre>
              </div>
            )}

            {activeSection === "bulk" && (
              <div className={styles.codeBlock}>
                <pre style={{ margin: 0 }}>
                  {lang === 'curl' ? (
`curl -X POST https://api.amltab.com/api/v1/bulk/jobs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "screenings": [
      { "individual": { "name": "John Doe" }, "customer_ref": "C1" },
      { "entity": { "name": "ACME Corp" }, "customer_ref": "C2" }
    ]
  }'`
                  ) : lang === 'node' ? (
`const response = await fetch('https://api.amltab.com/api/v1/bulk/jobs', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    screenings: [
      { individual: { name: 'John Doe' }, customer_ref: 'C1' }
    ]
  })
});

const data = await response.json();`
                  ) : (
`import requests

url = "https://api.amltab.com/api/v1/bulk/jobs"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
payload = {
    "screenings": [
        {"individual": {"name": "John Doe"}, "customer_ref": "C1"}
    ]
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
                  )}
                </pre>
              </div>
            )}

            {activeSection === "cases" && (
              <div className={styles.codeBlock}>
                <pre style={{ margin: 0 }}>
                  {lang === 'curl' ? (
`curl -X POST https://api.amltab.com/api/v2/cases \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "screening_id": "scr_9281a",
    "assigned_to": "officer_12"
  }'`
                  ) : (
`// Example for creating a compliance case
const res = await fetch('/api/v2/cases', {
  method: 'POST',
  body: JSON.stringify({ screening_id: 'scr_9281a' })
});`
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem' }}>RESPONSE OBJECT</div>
                {activeSection === "screening" && (
                  <div className={styles.responseHeader}>
                    <div className={styles.toggleGroup}>
                      <button 
                        className={`${styles.toggleBtn} ${responseType === 'ind_match' ? styles.toggleBtnActive : ''}`}
                        onClick={() => setResponseType('ind_match')}
                      >
                        Ind. Match
                      </button>
                      <button 
                        className={`${styles.toggleBtn} ${responseType === 'ind_clear' ? styles.toggleBtnActive : ''}`}
                        onClick={() => setResponseType('ind_clear')}
                      >
                        Ind. Clear
                      </button>
                      <button 
                        className={`${styles.toggleBtn} ${responseType === 'com_match' ? styles.toggleBtnActive : ''}`}
                        onClick={() => setResponseType('com_match')}
                      >
                        Com. Match
                      </button>
                      <button 
                        className={`${styles.toggleBtn} ${responseType === 'com_clear' ? styles.toggleBtnActive : ''}`}
                        onClick={() => setResponseType('com_clear')}
                      >
                        Com. Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <pre style={{ margin: 0, color: '#94a3b8', maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }} className={styles.customScrollbar}>
{activeSection === "bulk" ? (
  JSON.stringify({
    "job_id": "bulk_9281a",
    "status": "processing",
    "total": 1500,
    "processed": 42,
    "started_at": "2024-04-22T12:00:00Z"
  }, null, 2)
) : activeSection === "cases" ? (
  JSON.stringify({
    "case_id": "CASE-1021",
    "status": "open",
    "priority": "HIGH",
    "assigned_to": "officer_12",
    "created_at": "2024-04-22T12:00:00Z"
  }, null, 2)
) : activeSection === "audit" ? (
  JSON.stringify({
    "total": 450,
    "logs": [
      {
        "id": "log_1",
        "type": "screening",
        "action": "view_report",
        "timestamp": "2024-04-22T10:00:00Z"
      }
    ]
  }, null, 2)
) : (
  responseType === 'ind_match' ? JSON.stringify(FULL_EXAMPLE_RESPONSE, null, 2) : 
  responseType === 'ind_clear' ? JSON.stringify(CLEAR_EXAMPLE_RESPONSE, null, 2) : 
  responseType === 'com_match' ? JSON.stringify(COMPANY_EXAMPLE_RESPONSE, null, 2) : 
  JSON.stringify(COMPANY_CLEAR_EXAMPLE_RESPONSE, null, 2)
)}
</pre>
            </div>
        </div>
      </div>
    </main>
  </div>
);
}
