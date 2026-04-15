"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Database, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  Globe, 
  Lock, 
  Key, 
  Save, 
  Plus, 
  Zap, 
  ExternalLink,
  Settings as SettingsIcon,
  Server,
  Code,
  Eye,
  EyeOff,
  MessageSquare,
  Shield,
  Activity,
  Fingerprint,
  Mail,
  Smartphone,
  ChevronRight,
  UserPlus,
  Trash2,
  AlertCircle
} from "lucide-react";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type TabType = "organization" | "security" | "users" | "integrations" | "billing";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("organization");
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState({
    name: "Cellbunq Compliance",
    domain: "cellbunq.com",
    api_key: "amltab_live_....................48f2",
    contact_email: "compliance@cellbunq.com"
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const sidebarTabs = [
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "security", label: "Security & Privacy", icon: ShieldCheck },
    { id: "users", label: "Teams & Access", icon: Users },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case "organization":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Organization Control</h1>
              <p className={styles.pageSubtitle}>Manage your institutional identity and compliance parameters.</p>
            </div>

            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>General Information</h3>
                  <p className={styles.cardDesc}>Global configuration for your screening reports.</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}><Building2 size={14} /> Organization Name</label>
                  <input type="text" className={styles.input} value={orgData.name} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}><Globe size={14} /> Domain</label>
                  <input type="text" className={styles.input} value={orgData.domain} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}><Mail size={14} /> Compliance Email</label>
                  <input type="email" className={styles.input} value={orgData.contact_email} />
                </div>
                <div className={styles.inputGroup}>
                   <label className={styles.label}><Lock size={14} /> Access Level</label>
                   <input type="text" className={styles.input} value="Institutional (Level 3)" readOnly />
                </div>
              </div>
              <button className={styles.saveBtn}><Save size={18} /> Save Changes</button>
            </div>

            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Identity & Keys</h3>
                  <p className={styles.cardDesc}>Sensitive programmatic access credentials.</p>
                </div>
                <div className={`${styles.securityStatus} ${styles.statusGood}`}>
                   <Shield size={12} /> Encrypted
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Production API Secret</label>
                <div className={styles.apiKeyWrapper}>
                  <input 
                    type={showApiKey ? "text" : "password"} 
                    className={styles.apiInput} 
                    value={orgData.api_key} 
                    readOnly
                  />
                  <button className={styles.eyeBtn} onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className={styles.cardDesc}>Root access key. Rotate immediately if compromised.</p>
              </div>
              <button className={`${styles.saveBtn} ${styles.secondaryBtn}`}>Rotate Security Key</button>
            </div>
          </>
        );

      case "security":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Security Workspace</h1>
              <p className={styles.pageSubtitle}>Protect your compliance environment with advanced security controls.</p>
            </div>

            <div className={styles.securityBanner}>
               <ShieldCheck size={40} color="var(--primary)" />
               <div>
                  <h3 className={styles.cardTitle}>Security Health: 85/100</h3>
                  <p className={styles.cardDesc}>Your workspace is well protected. Enabling 2FA would increase your score.</p>
               </div>
            </div>

            <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}>Authentication</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Smartphone size={24} color="var(--secondary)" />
                    <div>
                      <p style={{ fontWeight: 700, margin: 0 }}>Two-Factor Authentication (2FA)</p>
                      <p className={styles.cardDesc}>Add an extra layer of security to your account.</p>
                    </div>
                  </div>
                  <button className={`${styles.saveBtn} ${styles.secondaryBtn}`}>Set Up 2FA</button>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Fingerprint size={24} color="var(--secondary)" />
                    <div>
                      <p style={{ fontWeight: 700, margin: 0 }}>Passkeys / Biometrics</p>
                      <p className={styles.cardDesc}>Login using TouchID, FaceID or hardware keys.</p>
                    </div>
                  </div>
                  <div className={`${styles.securityStatus} ${styles.statusWarning}`}>Disabled</div>
                </div>
              </div>
            </div>

            <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}>Active Sessions</h3>
              <div className={styles.tableContainer}>
                 <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Device / Browser</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div style={{ fontWeight: 700 }}>MacBook Pro • Chrome</div>
                          <p className={styles.cardDesc}>Current Session</p>
                        </td>
                        <td>Dhaka, Bangladesh</td>
                        <td><span className={`${styles.securityStatus} ${styles.statusGood}`}>Active</span></td>
                        <td>-</td>
                      </tr>
                    </tbody>
                 </table>
              </div>
            </div>
          </>
        );

      case "users":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Teams & Roles</h1>
              <p className={styles.pageSubtitle}>Manage investigator permissions and institutional access hierarchy.</p>
            </div>

            <div className={styles.settingsCard} style={{ padding: '0', overflow: 'hidden' }}>
              <div className={styles.tableContainer}>
                <table className={styles.userTable}>
                  <thead>
                    <tr>
                      <th>Analyst</th>
                      <th>Role & Permissions</th>
                      <th>Last Active</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Arman Hossain", email: "arman@cellbunq.com", role: "Super Admin", active: "Just now", initial: "AH" },
                      { name: "Jessica Smith", email: "j.smith@cellbunq.com", role: "Compliance Officer", active: "2h ago", initial: "JS" },
                      { name: "API Service Unit", email: "svc-bot@internal.id", role: "Programmatic Access", active: "12m ago", initial: "SV" }
                    ].map(user => (
                      <tr key={user.email}>
                        <td>
                          <div className={styles.userInfo}>
                             <div className={styles.userAvatar}>{user.initial}</div>
                             <div>
                               <div style={{ fontWeight: 700 }}>{user.name}</div>
                               <div className={styles.userEmail}>{user.email}</div>
                             </div>
                          </div>
                        </td>
                        <td><span className={styles.roleBadge}>{user.role}</span></td>
                        <td className={styles.cardDesc}>{user.active}</td>
                        <td style={{ textAlign: 'right' }}>
                           <button style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', padding: '8px' }}><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <button className={styles.saveBtn}><UserPlus size={18} /> Invite Investigator</button>
          </>
        );

      case "integrations":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Ecosystem Connect</h1>
              <p className={styles.pageSubtitle}>Bridge your screening engine with external platforms and tools.</p>
            </div>

            <div className={styles.integrationGrid}>
               {[
                 { name: "Salesforce", icon: <Database />, status: "Connected", desc: "Automated match synchronization to account records." },
                 { name: "Slack", icon: <MessageSquare />, status: "Pending", desc: "Dispatch real-time risk alerts to compliance channels." },
                 { name: "HubSpot", icon: <Zap />, status: "Configure", desc: "Enrich CRM contacts with AML screening metadata." },
                 { name: "Webhooks", icon: <Code />, status: "Active (2)", desc: "Programmatic notification delivery to internal endpoints." }
               ].map(item => (
                 <div key={item.name} className={styles.integrationCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.iconBox}>{item.icon}</div>
                      <span className={`${styles.securityStatus} ${item.status === 'Connected' || item.status.includes('Active') ? styles.statusGood : styles.statusWarning}`}>
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <h4 className={styles.cardTitle}>{item.name}</h4>
                      <p className={styles.cardDesc}>{item.desc}</p>
                    </div>
                    <button className={`${styles.saveBtn} ${styles.secondaryBtn} ${styles.fullWidth}`} style={{ width: '100%', justifyContent: 'center' }}>
                      Configure Sync
                    </button>
                 </div>
               ))}
            </div>
          </>
        );

      default:
        return (
          <div className={styles.settingsCard} style={{ alignItems: 'center', padding: '80px' }}>
            <CreditCard size={48} color="var(--secondary)" opacity={0.3} />
            <h3 className={styles.cardTitle}>Institutional Billing</h3>
            <p className={styles.cardDesc}>Billing management is restricted to financial administrators.</p>
            <button className={styles.saveBtn} style={{ marginTop: '12px' }}>Request Access</button>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Control Plane</div>
        {sidebarTabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.sideTab} ${activeTab === tab.id ? styles.sideTabActive : ""}`}
            onClick={() => setActiveTab(tab.id as TabType)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
        
        <div className={styles.sidebarTitle} style={{ marginTop: 'auto', paddingTop: '40px' }}>Support</div>
        <button className={styles.sideTab}><Activity size={18} /> API Health</button>
        <button className={styles.sideTab}><Server size={18} /> Infrastructure</button>
      </aside>

      <main className={styles.contentArea}>
        {renderContent()}
      </main>
    </div>
  );
}
