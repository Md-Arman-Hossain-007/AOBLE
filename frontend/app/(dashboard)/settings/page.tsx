"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  AlertCircle,
  RefreshCw,
  MoreVertical,
  LogOut,
  Sliders,
  Check,
  X
} from "lucide-react";
import styles from "./page.module.css";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { QRCodeSVG } from "qrcode.react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type TabType = "organization" | "compliance" | "security" | "users" | "integrations" | "billing";

interface OrganizationData {
  id?: string;
  name: string;
  domain?: string;
  is_active?: boolean;
}

interface ComplianceSettings {
  fuzzy_threshold: number;
  enable_pep: boolean;
  enable_sanctions: boolean;
  enable_adverse_media: boolean;
  auto_clear_threshold: number;
}

interface UserData {
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_2fa_enabled: boolean;
  api_key: string;
}

interface SessionData {
  session_id: string;
  created_at: string;
  last_activity: string;
  ip_address: string;
  user_agent: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("organization");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [organization, setOrganization] = useState<OrganizationData>({
    name: "",
    domain: ""
  });
  const [compliance, setCompliance] = useState<ComplianceSettings>({
    fuzzy_threshold: 80,
    enable_pep: true,
    enable_sanctions: true,
    enable_adverse_media: true,
    auto_clear_threshold: 50
  });
  const [team, setTeam] = useState<UserData[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [billing, setBilling] = useState<any>(null);

  const [showApiKey, setShowApiKey] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [disable2FACode, setDisable2FACode] = useState("");
  const [openUserMenu, setOpenUserMenu] = useState<string | null>(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("amltab_token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();

    if (!token) {
      setError("Authentication session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Get Current User Info
      const userRes = await fetch(`${API_URL}/auth/me`, { headers });
      if (!userRes.ok) throw new Error("Failed to fetch user information.");
      const userData = await userRes.json();
      setCurrentUser(userData);

      // 2. Get Organization Info
      try {
        const orgRes = await fetch(`${API_URL}/auth/organizations`, { headers });
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          if (orgData.organization) setOrganization(orgData.organization);
        }
      } catch (e) {
        console.error("Failed to fetch organization:", e);
      }

      // 3. Get Compliance Settings
      try {
        const compRes = await fetch(`${API_URL}/compliance/`, { headers });
        if (compRes.ok) {
          const compData = await compRes.json();
          setCompliance(compData);
        }
      } catch (e) {
        console.error("Failed to fetch compliance settings:", e);
      }

      // 4. Load tab-specific data
      await loadTabData(activeTab, headers);
    } catch (err: any) {
      // Better error message for network failures
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        setError("Backend server is not running. Please start the backend server on port 8000.");
      } else {
        setError(err.message || "Connection error.");
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const loadTabData = async (tab: TabType, headers: any) => {
    try {
      if (tab === "users") {
        const teamRes = await fetch(`${API_URL}/users/`, { headers });
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData);
        } else {
          setError("Failed to fetch team members.");
        }
      } else if (tab === "integrations") {
        const intRes = await fetch(`${API_URL}/integrations/configs`, { headers });
        if (intRes.ok) {
          const intData = await intRes.json();
          setIntegrations(intData);
        } else {
          setError("Failed to fetch integrations.");
        }
      } else if (tab === "security") {
        const sessRes = await fetch(`${API_URL}/auth/sessions/active`, { headers });
        if (sessRes.ok) {
          const data = await sessRes.json();
          setSessions(data.sessions || []);
        } else {
          setError("Failed to fetch active sessions.");
        }
      } else if (tab === "billing") {
        const billRes = await fetch(`${API_URL}/billing/`, { headers });
        if (billRes.ok) {
          const billData = await billRes.json();
          setBilling(billData);
        } else {
          setError("Failed to fetch billing information.");
        }
      }
    } catch (err: any) {
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        setError("Backend server is not running. Please start the backend server on port 8000.");
      } else {
        setError(err.message || "Failed to load tab data.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    const token = getToken();
    
    if (!token) {
      setError("Authentication required.");
      setSaving(false);
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      name: formData.get("org_name") as string,
      domain: formData.get("org_domain") as string
    };

    try {
      const res = await fetch(`${API_URL}/auth/organizations`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (res.ok) {
        const updated = await res.json();
        setOrganization(updated);
        setSuccessMessage("Organization updated successfully.");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to update organization.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    const token = getToken();
    
    if (!token) {
      setError("Authentication required.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/compliance/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(compliance)
      });
      
      if (res.ok) {
        const updated = await res.json();
        setCompliance(updated);
        setSuccessMessage("Compliance settings updated successfully.");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to update compliance settings.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setSaving(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    const token = getToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.session_id !== sessionId));
        setSuccessMessage("Session terminated successfully.");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to terminate session.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    }
  };

  const handleEnable2FA = async () => {
    const token = getToken();
    if (!token) return;

    try {
      // First generate 2FA secret
      const genRes = await fetch(`${API_URL}/auth/2fa/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (genRes.ok) {
        const genData = await genRes.json();
        setTwoFASecret(genData.secret);
        setShow2FAModal(true);
        setSuccessMessage("2FA secret generated. Please scan the QR code or enter the secret manually.");
      } else {
        setError("Failed to generate 2FA setup.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    }
  };

  const handleVerify2FA = async () => {
    const token = getToken();
    if (!token || !twoFACode) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          secret: twoFASecret,
          code: twoFACode
        })
      });
      
      if (res.ok) {
        setCurrentUser(prev => prev ? { ...prev, is_2fa_enabled: true } : null);
        setShow2FAModal(false);
        setTwoFASecret("");
        setTwoFACode("");
        setSuccessMessage("2FA enabled successfully. Your account is now protected.");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to enable 2FA. Please check the code.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleDisable2FA = async () => {
    const token = getToken();
    if (!token) return;

    setShowDisable2FAModal(true);
    setDisable2FACode("");
    setError(null);
  };

  const confirmDisable2FA = async () => {
    const token = getToken();
    if (!token || !disable2FACode) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: disable2FACode })
      });
      
      if (res.ok) {
        setCurrentUser(prev => prev ? { ...prev, is_2fa_enabled: false } : null);
        setShowDisable2FAModal(false);
        setDisable2FACode("");
        setSuccessMessage("2FA disabled successfully.");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to disable 2FA. Please check the code.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    if (currentUser?.is_2fa_enabled) {
      await handleDisable2FA();
    } else {
      await handleEnable2FA();
    }
  };

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "U";

  const parseUA = (ua: string) => {
    if (!ua || ua === "Unknown") return "Unknown Device";
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("iPad")) return "iPad";
    if (ua.includes("Android")) return "Android Device";
    if (ua.includes("Macintosh")) return "Mac";
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Linux")) return "Linux Device";
    if (ua.includes("node-fetch")) return "API Client (Node)";
    return ua.substring(0, 20) + "...";
  };

  const handleInviteUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    const token = getToken();
    
    if (!token) {
      setError("Authentication required.");
      setSaving(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const userData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      full_name: formData.get("full_name") as string,
      role: formData.get("role") as string,
    };

    try {
      const res = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (res.ok) {
        setShowInviteModal(false);
        setSuccessMessage("User invited successfully.");
        // Reload team data
        const teamRes = await fetch(`${API_URL}/users/`, { headers: { Authorization: `Bearer ${token}` } });
        if (teamRes.ok) setTeam(await teamRes.json());
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to invite user.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUserRole = async (username: string, newRole: string) => {
    const token = getToken();
    if (!token) return;

    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (res.ok) {
        setTeam(prev => prev.map(u => u.username === username ? { ...u, role: newRole } : u));
        setSuccessMessage(`Role updated to ${newRole} for ${username}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || `Failed to update role for ${username}`);
      }
    } catch (err: any) {
      setError(err.message || "Network error while updating role.");
    } finally {
      setOpenUserMenu(null);
    }
  };

  const handleToggleUserStatus = async (username: string, currentStatus: boolean) => {
    const token = getToken();
    if (!token) return;

    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (res.ok) {
        setTeam(prev => prev.map(u => u.username === username ? { ...u, is_active: !currentStatus } : u));
        setSuccessMessage(`User ${username} ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || `Failed to update status for ${username}`);
      }
    } catch (err: any) {
      setError(err.message || "Network error while updating status.");
    } finally {
      setOpenUserMenu(null);
    }
  };

  const handleDeleteUser = (username: string) => {
    setUserToDelete(username);
    setShowDeleteUserModal(true);
    setOpenUserMenu(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    const token = getToken();
    if (!token) return;

    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/users/${encodeURIComponent(userToDelete)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setTeam(prev => prev.filter(u => u.username !== userToDelete));
        setSuccessMessage(`Investigator ${userToDelete} removed successfully.`);
        setShowDeleteUserModal(false);
        setUserToDelete(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || `Failed to remove ${userToDelete}`);
      }
    } catch (err: any) {
      setError(err.message || "Network error while removing user.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddIntegration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    const token = getToken();
    
    if (!token) {
      setError("Authentication required.");
      setSaving(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const intData = {
      integration_type: formData.get("integration_type") as string,
      config: {
        api_key: formData.get("api_key") as string,
        endpoint: formData.get("endpoint") as string,
      },
      is_active: true
    };

    try {
      const res = await fetch(`${API_URL}/integrations/configs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(intData)
      });
      
      if (res.ok) {
        setShowIntegrationModal(false);
        setSuccessMessage("Integration added successfully.");
        // Reload integrations
        const intRes = await fetch(`${API_URL}/integrations/configs`, { headers: { Authorization: `Bearer ${token}` } });
        if (intRes.ok) setIntegrations(await intRes.json());
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to add integration.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePlan = async (newPlan: string) => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`${API_URL}/billing/plan`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: newPlan })
      });
      
      if (res.ok) {
        setSuccessMessage("Plan changed successfully.");
        const billRes = await fetch(`${API_URL}/billing/`, { headers: { Authorization: `Bearer ${token}` } });
        if (billRes.ok) setBilling(await billRes.json());
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || "Failed to change plan.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setSaving(false);
    }
  };

  const sidebarTabs = [
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "compliance", label: "Compliance Logic", icon: Sliders },
    { id: "security", label: "Identity & Security", icon: ShieldCheck },
    { id: "users", label: "Teams & Access", icon: Users },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
  ];

  if (loading && !currentUser) {
    return (
      <div className={styles.loadingWrapper}>
        <LoadingSpinner />
        <p>Initializing Control Plane...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case "organization":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Organization Control</h1>
              <p className={styles.pageSubtitle}>Manage your institutional identity and access credentials.</p>
            </div>

            <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}>Global Information</h3>
              <form className={styles.formGrid} onSubmit={handleUpdateOrg}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Organization Name</label>
                  <input name="org_name" type="text" className={styles.input} defaultValue={organization?.name} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Domain</label>
                  <input name="org_domain" type="text" className={styles.input} defaultValue={organization?.domain} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Access Level</label>
                  <input type="text" className={styles.input} value={currentUser?.role} readOnly disabled />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Admin Identity</label>
                  <input type="text" className={styles.input} value={currentUser?.full_name} readOnly disabled />
                </div>
                <button className={styles.saveBtn} type="submit" disabled={saving}>
                  {saving ? <RefreshCw size={18} className={styles.spinning} /> : <Save size={18} />}
                  Save Changes
                </button>
              </form>
            </div>

            <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}>Production Secrets</h3>
              <div className={styles.apiKeyWrapper}>
                <input type={showApiKey ? "text" : "password"} className={styles.apiInput} value={currentUser?.api_key} readOnly />
                <button className={styles.eyeBtn} onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className={styles.cardDesc}>Root access key for the screening engine. Keep this secret.</p>
            </div>
          </>
        );

      case "compliance":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Compliance Logic</h1>
              <p className={styles.pageSubtitle}>Configure the algorithmic thresholds for your screening engine.</p>
            </div>

            <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}>Fuzzy Matching & Risks</h3>
              <form className={styles.formGrid} onSubmit={handleUpdateCompliance}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Fuzzy Match Threshold (%)</label>
                  <input 
                    type="number" className={styles.input} 
                    value={compliance.fuzzy_threshold} 
                    onChange={e => setCompliance({...compliance, fuzzy_threshold: parseInt(e.target.value)})}
                  />
                  <p className={styles.cardDesc}>Recommended: 80%. Lower values increase matches (more False Positives).</p>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Auto-Clear Threshold (%)</label>
                  <input 
                    type="number" className={styles.input} 
                    value={compliance.auto_clear_threshold} 
                    onChange={e => setCompliance({...compliance, auto_clear_threshold: parseInt(e.target.value)})}
                  />
                  <p className={styles.cardDesc}>Scores below this are marked Clear automatically.</p>
                </div>
                
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '24px', marginTop: '12px' }}>
                   <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={compliance.enable_pep} onChange={e => setCompliance({...compliance, enable_pep: e.target.checked})} />
                      Enable PEP Screening
                   </label>
                   <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={compliance.enable_sanctions} onChange={e => setCompliance({...compliance, enable_sanctions: e.target.checked})} />
                      Enable Sanctions
                   </label>
                   <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={compliance.enable_adverse_media} onChange={e => setCompliance({...compliance, enable_adverse_media: e.target.checked})} />
                      Enable Adverse Media
                   </label>
                </div>

                <button className={styles.saveBtn} type="submit" disabled={saving}>
                  {saving ? <RefreshCw size={18} className={styles.spinning} /> : <Save size={18} />}
                  Update Logic
                </button>
              </form>
            </div>
          </>
        );

      case "security":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Identity & Security</h1>
              <p className={styles.pageSubtitle}>Protect your compliance workspace with institutional-grade protocols.</p>
            </div>

            <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}>Multi-Factor Authentication</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <p style={{ fontWeight: 700, margin: 0 }}>2FA Protection</p>
                   <p className={styles.cardDesc}>{currentUser?.is_2fa_enabled ? "Active and protecting your account." : "Vulnerable: Enable 2FA to secure access."}</p>
                </div>
                <button 
                  className={`${styles.saveBtn} ${currentUser?.is_2fa_enabled ? styles.secondaryBtn : ""}`}
                  onClick={handleToggle2FA}
                  disabled={saving}
                >
                  {saving ? <RefreshCw size={18} className={styles.spinning} /> : (currentUser?.is_2fa_enabled ? "Deactivate" : "Enable 2FA")}
                </button>
              </div>
            </div>

            <div className={styles.settingsCard}>
              <h3 className={styles.cardTitle}>Active Sessions</h3>
              <div className={styles.tableContainer}>
                <table className={styles.userTable}>
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Client IP</th>
                      <th>Device</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={s.session_id + i}>
                        <td><span className={styles.locationTag}><Globe size={12} /> Local (Cloud)</span></td>
                        <td>{s.ip_address}</td>
                        <td className={styles.cardDesc} title={s.user_agent}>
                          <Smartphone size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                          {parseUA(s.user_agent)}
                        </td>
                        <td><span className={`${styles.securityStatus} ${styles.statusGood}`}>Active</span></td>
                        <td>
                          <button 
                            className={styles.itemActionBtn} 
                            onClick={() => terminateSession(s.session_id)}
                            title="Terminate Session"
                          >
                            <LogOut size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
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
              <h1 className={styles.pageTitle}>Teams & Access</h1>
              <p className={styles.pageSubtitle}>Manage analyst permissions and role assignment.</p>
            </div>
            <div className={styles.settingsCard} style={{ padding: 0, overflow: 'visible' }}>
               <table className={styles.userTable} style={{ overflow: 'visible' }}>
                  <thead><tr><th>Analyst</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody style={{ overflow: 'visible' }}>
                    {team.map((u, i) => (
                      <tr key={u.username || i} style={{ overflow: 'visible' }}>
                        <td>
                          <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>{getInitials(u.full_name)}</div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{u.full_name}</div>
                              <div className={styles.userEmail}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={styles.roleBadge}>{u.role}</span></td>
                        <td>
                          <span className={`${styles.securityStatus} ${u.is_active ? styles.statusGood : styles.statusWarning}`}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', position: 'relative', overflow: 'visible' }}>
                          <button 
                            className={styles.itemActionBtn} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenUserMenu(openUserMenu === u.username ? null : u.username);
                            }}
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {openUserMenu === u.username && (
                            <div className={styles.dropdownMenu}>
                              <div className={styles.dropdownHeader}>Role Assignment</div>
                              <button onClick={() => handleUpdateUserRole(u.username, "Admin")}>Promote to Admin</button>
                              <button onClick={() => handleUpdateUserRole(u.username, "Compliance Officer")}>Make Compliance Officer</button>
                              <button onClick={() => handleUpdateUserRole(u.username, "Viewer")}>Set as Viewer</button>
                              <div className={styles.dropdownDivider} />
                              <button onClick={() => handleToggleUserStatus(u.username, u.is_active)}>
                                {u.is_active ? "Deactivate Account" : "Activate Account"}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.username)}
                                style={{ color: '#ef4444' }}
                              >
                                Remove Investigator
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
            <button className={styles.saveBtn} onClick={() => setShowInviteModal(true)}><UserPlus size={18} /> Invite Investigator</button>
          </>
        );

      case "integrations":
        return (
          <>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Ecosystem Connect</h1>
              <p className={styles.pageSubtitle}>Bridge your screening engine with external platforms.</p>
            </div>
            <div className={styles.integrationGrid}>
              {integrations.length > 0 ? integrations.map((int, i) => (
                <div key={int.id || i} className={styles.integrationCard}>
                  <div className={styles.integrationHeader}>
                    <div className={styles.iconBox}><Zap size={24} /></div>
                    <div className={styles.integrationMeta}>
                      <h3 className={styles.integrationName}>{int.integration_type}</h3>
                      <div className={`${styles.integrationStatus} ${styles.statusActive}`}>
                        <Check size={12} /> Connected
                      </div>
                    </div>
                  </div>
                  <p className={styles.cardDesc}>
                    Continuous watchlist monitoring active. Last sync: {int.last_sync || "Just now"}
                  </p>
                  <button className={`${styles.saveBtn} ${styles.secondaryBtn}`} style={{ width: '100%', justifyContent: 'center' }}>
                    Configure Node
                  </button>
                </div>
              )) : (
                <div className={styles.settingsCard} style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px' }}>
                   <p className={styles.cardDesc}>No active screening nodes configured.</p>
                   <button className={styles.saveBtn} style={{ margin: '24px auto' }} onClick={() => setShowIntegrationModal(true)}>
                     <Plus size={18} /> Add Integration
                   </button>
                </div>
              )}
            </div>

            <div className={styles.sectionHeader} style={{ marginTop: '48px' }}>
              <h2 className={styles.cardTitle}>Available Integrations</h2>
              <p className={styles.cardDesc}>Connect other platforms in your risk management stack.</p>
            </div>
            
            <div className={styles.integrationGrid}>
              {[
                { name: 'Salesforce', icon: <Building2 />, desc: 'Sync screening results with CRM profiles.' },
                { name: 'Slack', icon: <ShieldCheck />, desc: 'Receive real-time alerts for high-risk matches.' },
                { name: 'BigQuery', icon: <Database />, desc: 'Export audit logs for institutional BI.' }
              ].map(ext => (
                <div key={ext.name} className={styles.integrationCard} style={{ opacity: 0.8, borderStyle: 'dashed' }}>
                  <div className={styles.integrationHeader}>
                    <div className={styles.iconBox} style={{ color: 'var(--secondary)' }}>{ext.icon}</div>
                    <div className={styles.integrationMeta}>
                      <h3 className={styles.integrationName}>{ext.name}</h3>
                      <div className={`${styles.integrationStatus} ${styles.statusInactive}`}>Coming Soon</div>
                    </div>
                  </div>
                  <p className={styles.cardDesc}>{ext.desc}</p>
                </div>
              ))}
            </div>
          </>
        );

      default: // Billing
        return (
          <>
            <div className={styles.sectionHeader}>
              <h1 className={styles.pageTitle}>Subscription & Plans</h1>
              <p className={styles.pageSubtitle}>Manage your institutional license and monitor resource usage.</p>
            </div>

            {billing && (
              <div className={styles.settingsCard} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 className={styles.cardTitle}>Current Plan: <span style={{ color: 'var(--primary)', marginLeft: '8px' }}>{billing.plan?.toUpperCase()}</span></h3>
                  <span className={`${styles.securityStatus} ${billing.status === 'active' ? styles.statusGood : styles.statusWarning}`}>
                    {billing.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </div>
                
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Seats Utilization</label>
                    <input type="text" className={styles.input} readOnly value={`${billing.seats_used || 0} / ${billing.seats_limit || "Unlimited"}`} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Screening Quota</label>
                    <input type="text" className={styles.input} readOnly value={`${billing.screenings_used || 0} / ${billing.screenings_limit || "Unlimited"}`} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Next Billing Period</label>
                    <input type="text" className={styles.input} readOnly value={billing.next_billing_date ? new Date(billing.next_billing_date).toLocaleDateString() : "N/A"} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Payment Method</label>
                    <input type="text" className={styles.input} readOnly value="Institutional Credit Card (**** 4242)" />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.planGrid}>
              {[
                { 
                  name: 'Starter', 
                  price: '0', 
                  period: '/mo',
                  desc: 'Perfect for small teams and pre-seed startups.',
                  features: ['1,000 screenings /mo', 'Standard support', 'Single organization', 'API access (limited)'],
                  disabled: ['Advanced analytics', 'SSO & SAML', 'Custom reports']
                },
                { 
                  name: 'Professional', 
                  price: '299', 
                  period: '/mo',
                  popular: true,
                  desc: 'Advanced features for scaling compliance operations.',
                  features: ['10,000 screenings /mo', 'Priority 24/7 support', 'Unlimited members', 'Bulk screening tool', 'Advanced analytics'],
                  disabled: ['Custom SLAs']
                },
                { 
                  name: 'Enterprise', 
                  price: '999', 
                  period: '/mo',
                  desc: 'Institutional grade security and unlimited scale.',
                  features: ['Unlimited screenings', 'Dedicated account manager', 'SSO & SAML integration', 'Custom reporting engine', 'White-labeling', '99.9% Uptime SLA'],
                  disabled: []
                }
              ].map((p) => (
                <div key={p.name} className={`${styles.planCard} ${p.popular ? styles.planCardPopular : ''}`}>
                  {p.popular && <div className={styles.popularBadge}>Most Popular</div>}
                  <h3 className={styles.planName}>{p.name}</h3>
                  <p className={styles.cardDesc} style={{ marginTop: '8px' }}>{p.desc}</p>
                  
                  <div className={styles.planPrice}>
                    <span className={styles.priceAmount}>${p.price}</span>
                    <span className={styles.pricePeriod}>{p.period}</span>
                  </div>

                  <ul className={styles.planFeatures}>
                    {p.features.map(f => (
                      <li key={f} className={styles.featureItem}>
                        <Check size={16} className={styles.featureIcon} /> {f}
                      </li>
                    ))}
                    {p.disabled.map(f => (
                      <li key={f} className={`${styles.featureItem} ${styles.featureDisabled}`}>
                        <X size={16} /> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={styles.saveBtn}
                    style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', background: p.popular ? 'var(--primary)' : 'var(--surface-dark)', color: p.popular ? 'white' : 'var(--foreground)', border: p.popular ? 'none' : '1px solid var(--border)' }}
                    disabled={billing?.plan?.toLowerCase() === p.name.toLowerCase() || saving}
                    onClick={() => handleChangePlan(p.name)}
                  >
                    {billing?.plan?.toLowerCase() === p.name.toLowerCase() ? 'Current Plan' : `Upgrade to ${p.name}`}
                  </button>
                </div>
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Control Plane</div>
        {sidebarTabs.map(t => (
          <button key={t.id} className={styles.sideTab + ' ' + (activeTab === t.id ? styles.sideTabActive : '')} onClick={() => handleTabChange(t.id as TabType)}>
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </aside>
      <main className={styles.contentArea}>
        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} /> 
            {error}
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        {successMessage && (
          <div className={styles.successBanner}>
            <ShieldCheck size={18} /> 
            {successMessage}
            <button onClick={() => setSuccessMessage(null)}>Dismiss</button>
          </div>
        )}
        {renderContent()}
      </main>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Invite Team Member</h3>
            <button className={styles.modalClose} onClick={() => setShowInviteModal(false)}>×</button>
            <form onSubmit={handleInviteUser} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
                <input name="full_name" type="text" className={styles.input} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <input name="email" type="email" className={styles.input} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Username</label>
                <input name="username" type="text" className={styles.input} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Role</label>
                <select name="role" className={styles.input} required>
                  <option value="analyst">Analyst</option>
                  <option value="compliance_officer">Compliance Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className={`${styles.saveBtn} ${styles.secondaryBtn}`} onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? <RefreshCw size={18} className={styles.spinning} /> : <UserPlus size={18} />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Integration Modal */}
      {showIntegrationModal && (
        <div className={styles.modalOverlay} onClick={() => setShowIntegrationModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Add Integration</h3>
            <button className={styles.modalClose} onClick={() => setShowIntegrationModal(false)}>×</button>
            <form onSubmit={handleAddIntegration} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Integration Type</label>
                <select name="integration_type" className={styles.input} required>
                  <option value="webhook">Webhook</option>
                  <option value="api">API Connection</option>
                  <option value="database">Database Sync</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>API Key / Token</label>
                <input name="api_key" type="password" className={styles.input} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Endpoint URL</label>
                <input name="endpoint" type="url" className={styles.input} placeholder="https://api.example.com/v1" />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className={`${styles.saveBtn} ${styles.secondaryBtn}`} onClick={() => setShowIntegrationModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? <RefreshCw size={18} className={styles.spinning} /> : <Plus size={18} />}
                  Add Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Verification Modal */}
      {show2FAModal && (
        <div className={styles.modalOverlay} onClick={() => setShow2FAModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Enable Two-Factor Authentication</h3>
            <button className={styles.modalClose} onClick={() => setShow2FAModal(false)}>×</button>
            <div className={styles.modalForm}>
              <div className={styles.qrContainer}>
                <div className={styles.qrCode}>
                  <QRCodeSVG 
                    value={`otpauth://totp/AMLtab:${currentUser?.email || 'user'}?secret=${twoFASecret}&issuer=AMLtab`}
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/logo_brand_v1.png",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
                <p className={styles.cardDesc}>Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)</p>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Your Secret Key</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={twoFASecret}
                  readOnly
                  style={{ fontFamily: 'monospace', fontSize: '1.1rem', textAlign: 'center' }}
                />
                <p className={styles.cardDesc}>Or enter this secret key manually if you cannot scan the QR code.</p>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Verification Code</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  placeholder="Enter 6-digit code from your app"
                  maxLength={6}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className={`${styles.saveBtn} ${styles.secondaryBtn}`} onClick={() => setShow2FAModal(false)}>
                  Cancel
                </button>
                <button type="button" className={styles.saveBtn} onClick={handleVerify2FA} disabled={saving || !twoFACode}>
                  {saving ? <RefreshCw size={18} className={styles.spinning} /> : <ShieldCheck size={18} />}
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Disable 2FA Modal */}
      {showDisable2FAModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDisable2FAModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Disable Two-Factor Authentication</h3>
            <button className={styles.modalClose} onClick={() => setShowDisable2FAModal(false)}>×</button>
            <div className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <p className={styles.cardDesc} style={{ color: '#ef4444', fontWeight: 600, marginBottom: '12px' }}>
                  Warning: Disabling 2FA will make your account less secure.
                </p>
                <label className={styles.label}>Current Verification Code</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={disable2FACode}
                  onChange={(e) => setDisable2FACode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="Enter 6-digit code to confirm"
                  maxLength={6}
                  required
                  autoFocus
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4em', fontWeight: 'bold' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className={`${styles.saveBtn} ${styles.secondaryBtn}`} onClick={() => setShowDisable2FAModal(false)}>
                  Keep 2FA Enabled
                </button>
                <button type="button" className={styles.saveBtn} onClick={confirmDisable2FA} disabled={saving || disable2FACode.length !== 6} style={{ background: '#ef4444' }}>
                  {saving ? <RefreshCw size={18} className={styles.spinning} /> : <Trash2 size={18} />}
                  Disable Protection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete User Confirmation Modal */}
      {showDeleteUserModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteUserModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ef4444' }}>Remove Investigator</h3>
            <button className={styles.modalClose} onClick={() => setShowDeleteUserModal(false)}>×</button>
            <div className={styles.modalForm}>
              <p className={styles.cardDesc} style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                Are you sure you want to remove investigator <strong>"{userToDelete}"</strong>?
              </p>
              <p className={styles.cardDesc} style={{ color: '#ef4444', fontWeight: 600 }}>
                This action cannot be undone and will revoke all access immediately.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className={`${styles.saveBtn} ${styles.secondaryBtn}`} onClick={() => setShowDeleteUserModal(false)} style={{ flex: 1 }}>
                  Keep User
                </button>
                <button 
                  type="button" 
                  className={styles.saveBtn} 
                  onClick={confirmDeleteUser} 
                  disabled={saving} 
                  style={{ background: '#ef4444', flex: 1, justifyContent: 'center' }}
                >
                  {saving ? <RefreshCw size={18} className={styles.spinning} /> : "Remove User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
