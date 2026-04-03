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
  MessageSquare
} from "lucide-react";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("organization");
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState({
    name: "Cellbunq Compliance",
    domain: "cellbunq.com",
    api_key: "amltab_live_....................48f2",
    contact_email: "compliance@cellbunq.com"
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const fetchConfigs = async () => {
    const token = localStorage.getItem("amltab_token");
    try {
      const res = await fetch(`${API_URL}/integrations/configs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConfigs(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch integration configs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "organization":
        return (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Organization Profile</h2>
              <p className={styles.sectionDesc}>Manage your primary organization identity and access controls.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Organization Name</label>
                  <input type="text" className={styles.input} value={orgData.name} onChange={(e) => setOrgData({...orgData, name: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Corporate Domain</label>
                  <input type="text" className={styles.input} value={orgData.domain} onChange={(e) => setOrgData({...orgData, domain: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Compliance Contact Email</label>
                  <input type="email" className={styles.input} value={orgData.contact_email} onChange={(e) => setOrgData({...orgData, contact_email: e.target.value})} />
                </div>
              </div>
              <button className={styles.saveBtn}>Update Profile</button>
            </div>

            <div className={styles.sectionHeader} style={{ marginTop: '32px' }}>
              <h2 className={styles.sectionTitle}>Developer Credentials</h2>
              <p className={styles.sectionDesc}>API keys for direct programmatic access to the screening engine.</p>
            </div>
            <div className={styles.card}>
                <div className={styles.inputGroup}>
                   <label className={styles.label}>Live API Key</label>
                   <div style={{ display: 'flex', gap: '12px' }}>
                     <div className={styles.passwordWrapper}>
                       <input 
                         type={showApiKey ? "text" : "password"} 
                         className={styles.input} 
                         value={orgData.api_key} 
                         readOnly 
                       />
                       <button 
                         type="button" 
                         className={styles.eyeBtn}
                         onClick={() => setShowApiKey(!showApiKey)}
                         aria-label={showApiKey ? "Hide API key" : "Show API key"}
                       >
                         {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     </div>
                     <button className={styles.saveBtn} style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}>Rotate Key</button>
                   </div>
                </div>
            </div>
          </div>
        );
      case "integrations":
        return (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Third-party Integrations</h2>
              <p className={styles.sectionDesc}>Sync compliance screenings directly into your CRM or internal systems.</p>
            </div>
            <div className={styles.integrationGrid}>
               {[
                 { name: "Salesforce", icon: <Database size={24} />, status: "Connected", desc: "Sync matches to account profiles." },
                 { name: "HubSpot", icon: <Zap size={24} />, status: "Configure", desc: "Real-time ticket creation for risk hits." },
                 { name: "Slack", icon: <MessageSquare size={24} />, status: "Not Active", desc: "Dispatch critical alerts to channels." },
                 { name: "Webhooks", icon: <Code size={24} />, status: "2 Endpoints", desc: "Standard REST notification delivery." }
               ].map((integration) => (
                 <div key={integration.name} className={styles.integrationCard}>
                    <div className={styles.integrationHeader}>
                       <div className={styles.iconBox}>{integration.icon}</div>
                       <span style={{ fontSize: '0.75rem', fontWeight: 700, color: integration.status === 'Connected' ? '#4ADE80' : '#64748B' }}>{integration.status}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <span style={{ fontWeight: 700, color: '#fff' }}>{integration.name}</span>
                       <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{integration.desc}</p>
                    </div>
                    <button className={styles.btn} style={{ marginTop: 'auto', backgroundColor: '#1E293B', border: 'none', padding: '8px', color: '#fff', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Manage Setup</button>
                 </div>
               ))}
            </div>
          </div>
        );
      case "users":
        return (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Analyst Directory</h2>
              <p className={styles.sectionDesc}>Manage access permissions and compliance officer roles.</p>
            </div>
            <div className={styles.card} style={{ padding: '0', overflow: 'hidden' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', background: 'rgba(15,23,42,0.5)' }}>User</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', background: 'rgba(15,23,42,0.5)' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', background: 'rgba(15,23,42,0.5)' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', background: 'rgba(15,23,42,0.5)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Arman Hossain", role: "Compliance Lead", status: "Active" },
                      { name: "Jessica Compliance", role: "Junior Analyst", status: "Active" },
                      { name: "System Automator", role: "API Service", status: "Active" }
                    ].map((user) => (
                      <tr key={user.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '16px 24px', color: '#fff', fontWeight: 600 }}>{user.name}</td>
                        <td style={{ padding: '16px 24px', color: '#94A3B8', fontSize: '0.875rem' }}>{user.role}</td>
                        <td style={{ padding: '16px 24px' }}>
                           <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ADE80', fontWeight: 700 }}>{user.status}</span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                           <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
            <button className={styles.saveBtn} style={{ gap: '8px', display: 'flex', alignItems: 'center' }}><Plus size={18} /> Invite New Analyst</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hub Settings</h1>
        <nav className={styles.tabNav}>
          <button className={`${styles.tabBtn} ${activeTab === 'organization' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('organization')}>Organization</button>
          <button className={`${styles.tabBtn} ${activeTab === 'integrations' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('integrations')}>Integrations</button>
          <button className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('users')}>Analysts & RBAC</button>
          <button className={`${styles.tabBtn} ${activeTab === 'billing' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('billing')}>Billing & Plans</button>
        </nav>
      </header>

      <div className={styles.content}>
        {renderTabContent()}
      </div>
    </div>
  );
}
