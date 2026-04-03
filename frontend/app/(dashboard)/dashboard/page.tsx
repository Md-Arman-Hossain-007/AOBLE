"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  AlertTriangle,
  Clock,
  Activity,
  DollarSign,
  Eye,
  Globe,
  FileText,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  ShieldCheck,
  Search,
  Filter,
  X,
  Calendar,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { KPICard } from "@/app/components/dashboard/KPICard";
import { AreaChartWidget } from "@/app/components/dashboard/AreaChartWidget";
import { DonutChartWidget } from "@/app/components/dashboard/DonutChartWidget";
import { BarChartWidget } from "@/app/components/dashboard/BarChartWidget";
import { ActivityFeed } from "@/app/components/dashboard/ActivityFeed";
import { StatCard } from "@/app/components/dashboard/StatCard";
import { LoadingSpinner, ErrorState } from "@/app/components/LoadingSpinner";
import styles from "./page.module.css";

// Types
interface DashboardData {
  summary: {
    total_screenings: number;
    total_rescreenings: number;
    total_billing: number;
    total_active_monitoring: number;
  };
  monthly_chart: any[];
  quarter_chart: any[];
  yearly_chart_data: any[];
  billing_chart: any[];
  service_summary: any[];
  breakdown_individual: any[];
  breakdown_corporate: any[];
  total_matches: number;
  database_names: number;
  match_rate: number;
}

interface ActivityStats {
  activity: any[];
  risk_profile: { name: string; value: number; color: string }[];
  stats: {
    total: number;
    alerts: number;
    pending: number;
    success_rate: number;
    breakdown: {
      individual: number;
      entity: number;
      pep: number;
      sanctions: number;
      others: number;
    };
  };
}

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Period mapping for API calls
const periodToDays: Record<string, number> = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

export default function EnterpriseDashboard() {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d" | "1y">("30d");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [exportDateRange, setExportDateRange] = useState<"today" | "7d" | "30d" | "90d" | "custom">("30d");
  const [exportStartDate, setExportStartDate] = useState<string>("");
  const [exportEndDate, setExportEndDate] = useState<string>("");

  // Fetch data from API
  const fetchData = useCallback(async (selectedPeriod?: string) => {
    const token = localStorage.getItem("amltab_token");
    
    if (!token) {
      setError("Please login to view the dashboard");
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const days = periodToDays[selectedPeriod || period];

    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        fetch(`${API_URL}/stats`, { headers }),
        fetch(`${API_URL}/stats/activity-stats?days=${days}`, { headers }),
      ]);

      if (!statsRes.ok) {
        if (statsRes.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("amltab_token");
          return;
        }
        throw new Error("Failed to fetch stats");
      }

      if (!activityRes.ok) {
        throw new Error("Failed to fetch activity stats");
      }

      const statsData = await statsRes.json();
      const activityData = await activityRes.json();

      // Transform stats API response to dashboard format
      const transformedData: DashboardData = {
        summary: {
          total_screenings: statsData.summary?.total_screenings || statsData.stats?.total || 0,
          total_rescreenings: statsData.summary?.total_rescreenings || 0,
          total_billing: statsData.summary?.total_billing || 0,
          total_active_monitoring: statsData.summary?.total_active_monitoring || 0,
        },
        monthly_chart: statsData.monthly_chart || [],
        quarter_chart: statsData.quarter_chart || [],
        yearly_chart_data: statsData.yearly_chart_data || [],
        billing_chart: statsData.billing_chart || [],
        service_summary: statsData.service_summary || [],
        breakdown_individual: statsData.breakdown_individual || [],
        breakdown_corporate: statsData.breakdown_corporate || [],
        total_matches: statsData.total_matches || 0,
        database_names: statsData.database_names || 5000000,
        match_rate: statsData.match_rate || 0,
      };

      setDashboardData(transformedData);
      setActivityStats(activityData);

      // Generate activities from activity stats
      const generatedActivities = (activityData.activity || []).map((item: any, i: number) => ({
        id: `activity-${i}`,
        type: item.alerts > 0 ? "alert" : "screening",
        title: item.alerts > 0 
          ? `${item.alerts} alerts from screening activity` 
          : `${item.screenings} screenings completed`,
        description: `${item.name} - ${item.screenings} screenings, ${item.alerts} alerts`,
        timestamp: new Date(item.full_date).toISOString(),
        status: item.alerts > 0 ? "warning" : "success",
        metadata: { screenings: item.screenings, alerts: item.alerts },
      }));

      setActivities(generatedActivities);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod as typeof period);
    fetchData(newPeriod);
  };

  // Handle export
  const handleExport = () => {
    if (!dashboardData || !activityStats) return;

    const timestamp = new Date().toISOString().split('T')[0];
    
    // Calculate date range based on selection
    let reportStartDate = "";
    let reportEndDate = "";
    let periodLabel = "";

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (exportDateRange) {
      case "today":
        reportStartDate = todayStr;
        reportEndDate = todayStr;
        periodLabel = "Today";
        break;
      case "7d":
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        reportStartDate = weekAgo;
        reportEndDate = todayStr;
        periodLabel = "Last-7-Days";
        break;
      case "30d":
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        reportStartDate = monthAgo;
        reportEndDate = todayStr;
        periodLabel = "Last-30-Days";
        break;
      case "90d":
        const quarterAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        reportStartDate = quarterAgo;
        reportEndDate = todayStr;
        periodLabel = "Last-90-Days";
        break;
      case "custom":
        reportStartDate = exportStartDate;
        reportEndDate = exportEndDate;
        periodLabel = `${exportStartDate}-to-${exportEndDate}`;
        break;
      default:
        reportStartDate = todayStr;
        reportEndDate = todayStr;
        periodLabel = "Today";
    }

    if (exportFormat === "csv") {
      const csvContent = generateDetailedCSV(periodLabel);
      downloadFile(csvContent, `aml-dashboard-report-${periodLabel}-${timestamp}.csv`, "text/csv");
    } else if (exportFormat === "json") {
      const jsonContent = generateDetailedJSON(periodLabel);
      downloadFile(jsonContent, `aml-dashboard-report-${periodLabel}-${timestamp}.json`, "application/json");
    } else if (exportFormat === "pdf") {
      const htmlContent = generateDetailedHTML(periodLabel);
      downloadFile(htmlContent, `aml-dashboard-report-${periodLabel}-${timestamp}.html`, "text/html");
    }
    
    setShowExportModal(false);
  };

  const generateDetailedCSV = (periodLabel: string) => {
    const stats = activityStats?.stats;
    const rows: (string | number)[][] = [];

    // Header
    rows.push(["AMLTAB ENTERPRISE DASHBOARD REPORT"]);
    rows.push(["Generated", new Date().toLocaleString()]);
    rows.push(["Period", periodLabel]);
    rows.push([""]);

    // Executive Summary
    rows.push(["EXECUTIVE SUMMARY"]);
    rows.push(["Metric", "Value", "Trend"]);
    rows.push(["Total Screenings", dashboardData?.summary.total_screenings || stats?.total || 0, "+12.4%"]);
    rows.push(["Total Rescreenings", dashboardData?.summary.total_rescreenings || 0, "+8.2%"]);
    rows.push(["Critical Matches", dashboardData?.total_matches || stats?.alerts || 0, "-4.2%"]);
    rows.push(["Match Rate", `${dashboardData?.match_rate || 0}%`, "+2.1%"]);
    rows.push(["Monthly Cost", `${dashboardData?.summary.total_billing || 0}`, "+5.3%"]);
    rows.push(["Active Monitoring", dashboardData?.summary.total_active_monitoring || 0, "+8.7%"]);
    rows.push(["Database Names", (dashboardData?.database_names || 5000000).toLocaleString(), ""]);
    rows.push([""]);

    // Risk Distribution
    rows.push(["RISK DISTRIBUTION"]);
    rows.push(["Risk Level", "Count", "Percentage"]);
    const riskProfile = activityStats?.risk_profile || [];
    const totalRisk = riskProfile.reduce((sum, r) => sum + r.value, 0);
    riskProfile.forEach((risk: any) => {
      const percentage = totalRisk > 0 ? ((risk.value / totalRisk) * 100).toFixed(1) : "0";
      rows.push([risk.name, risk.value, `${percentage}%`]);
    });
    rows.push([""]);

    // Screening Breakdown
    rows.push(["SCREENING BREAKDOWN"]);
    rows.push(["Category", "Count", "Percentage"]);
    const breakdown: any = stats?.breakdown || {};
    const totalBreakdown = (breakdown.individual || 0) + (breakdown.entity || 0);
    rows.push(["Individuals", breakdown.individual || 0, totalBreakdown > 0 ? ((breakdown.individual / totalBreakdown) * 100).toFixed(1) + "%" : "0%"]);
    rows.push(["Entities", breakdown.entity || 0, totalBreakdown > 0 ? ((breakdown.entity / totalBreakdown) * 100).toFixed(1) + "%" : "0%"]);
    rows.push(["PEP Matches", breakdown.pep || 0, ""]);
    rows.push(["Sanctions Matches", breakdown.sanctions || 0, ""]);
    rows.push(["Other Matches", breakdown.others || 0, ""]);
    rows.push(["Non-Matches (Clear)", breakdown.non_matches || 0, ""]);
    rows.push([""]);

    // Performance Metrics
    rows.push(["PERFORMANCE METRICS"]);
    rows.push(["Metric", "Value"]);
    rows.push(["Success Rate", `${stats?.success_rate || 0}%`]);
    rows.push(["Pending Reviews", stats?.pending || 0]);
    rows.push(["High Alerts", stats?.alerts || 0]);
    rows.push([""]);

    // Daily Activity
    rows.push(["DAILY ACTIVITY"]);
    rows.push(["Date", "Screenings", "Alerts"]);
    (activityStats?.activity || []).forEach((day: any) => {
      rows.push([day.full_date, day.screenings, day.alerts]);
    });
    rows.push([""]);

    // Service Summary
    rows.push(["SERVICE UTILIZATION"]);
    rows.push(["Service", "Count"]);
    (dashboardData?.service_summary || []).filter((s: any) => s.count > 0).forEach((service: any) => {
      rows.push([service.name, service.count]);
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
  };

  const generateDetailedJSON = (periodLabel: string) => {
    return JSON.stringify({
      reportMetadata: {
        title: "AMLTAB Enterprise Dashboard Report",
        generatedAt: new Date().toISOString(),
        period: periodLabel,
        version: "1.0"
      },
      executiveSummary: {
        totalScreenings: dashboardData?.summary.total_screenings || 0,
        totalRescreenings: dashboardData?.summary.total_rescreenings || 0,
        criticalMatches: dashboardData?.total_matches || 0,
        matchRate: dashboardData?.match_rate || 0,
        monthlyCost: dashboardData?.summary.total_billing || 0,
        activeMonitoring: dashboardData?.summary.total_active_monitoring || 0,
        databaseNames: dashboardData?.database_names || 0,
      },
      riskDistribution: activityStats?.risk_profile || [],
      screeningBreakdown: {
        individual: (activityStats?.stats?.breakdown as any)?.individual || 0,
        entity: (activityStats?.stats?.breakdown as any)?.entity || 0,
        pepMatches: (activityStats?.stats?.breakdown as any)?.pep || 0,
        sanctionsMatches: (activityStats?.stats?.breakdown as any)?.sanctions || 0,
        otherMatches: (activityStats?.stats?.breakdown as any)?.others || 0,
        nonMatches: (activityStats?.stats?.breakdown as any)?.non_matches || 0,
      },
      performanceMetrics: {
        successRate: activityStats?.stats?.success_rate || 0,
        pendingReviews: activityStats?.stats?.pending || 0,
        highAlerts: activityStats?.stats?.alerts || 0,
        totalScreenings: activityStats?.stats?.total || 0,
      },
      dailyActivity: activityStats?.activity || [],
      monthlyChart: dashboardData?.monthly_chart || [],
      quarterlyData: dashboardData?.quarter_chart || [],
      yearlyData: dashboardData?.yearly_chart_data || [],
      billingData: dashboardData?.billing_chart || [],
      serviceSummary: dashboardData?.service_summary || [],
      breakdownIndividual: dashboardData?.breakdown_individual || [],
      breakdownCorporate: dashboardData?.breakdown_corporate || [],
    }, null, 2);
  };

  const generateDetailedHTML = (periodLabel: string) => {
    const stats = activityStats?.stats;
    const riskProfile = activityStats?.risk_profile || [];
    const totalRisk = riskProfile.reduce((sum: number, r: any) => sum + r.value, 0);
    const breakdown: any = stats?.breakdown || {};
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>AMLTAB Dashboard Report - ${periodLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; padding: 40px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #4f46e5; }
    .logo-section { display: flex; align-items: center; gap: 16px; }
    .logo-badge { width: 48px; height: 48px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: white; }
    .logo-text h1 { font-size: 1.5rem; color: #4f46e5; margin: 0; }
    .logo-text p { color: #64748b; font-size: 0.875rem; margin: 4px 0 0 0; }
    .header-right { text-align: right; }
    .header-right .date { font-size: 0.875rem; color: #64748b; }
    .header-right .period { font-size: 1.25rem; font-weight: 700; color: #4f46e5; margin-top: 4px; }
    .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 32px; }
    .meta-item { text-align: center; padding: 16px; background: white; border-radius: 8px; }
    .meta-value { font-size: 1.75rem; font-weight: 700; color: #4f46e5; }
    .meta-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-top: 4px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 1.25rem; font-weight: 600; color: #1a1a2e; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .card-value { font-size: 2rem; font-weight: 700; color: #1a1a2e; }
    .card-label { font-size: 0.813rem; color: #64748b; margin-top: 4px; }
    .card.trend-up .card-value { color: #10b981; }
    .card.trend-down .card-value { color: #ef4444; }
    .card.highlight { border-color: #4f46e5; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    .card.highlight .card-value, .card.highlight .card-label { color: white; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; font-size: 0.813rem; text-transform: uppercase; color: #64748b; }
    td { font-size: 0.875rem; }
    .risk-low { color: #10b981; }
    .risk-medium { color: #f59e0b; }
    .risk-high { color: #ef4444; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.75rem; }
    .footer-logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; font-weight: 600; color: #4f46e5; }
    @media print { body { padding: 20px; } .grid { grid-template-columns: repeat(2, 1fr); } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <div class="logo-badge">A</div>
      <div class="logo-text">
        <h1>AMLTAB</h1>
        <p>Enterprise Compliance Platform</p>
      </div>
    </div>
    <div class="header-right">
      <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
      <div class="period">${periodLabel}</div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-value">${periodLabel}</div>
      <div class="meta-label">Report Period</div>
    </div>
    <div class="meta-item">
      <div class="meta-value">${stats?.total || 0}</div>
      <div class="meta-label">Total Screenings</div>
    </div>
    <div class="meta-item">
      <div class="meta-value">${stats?.success_rate || 0}%</div>
      <div class="meta-label">Success Rate</div>
    </div>
    <div class="meta-item">
      <div class="meta-value">${dashboardData?.match_rate || 0}%</div>
      <div class="meta-label">Match Rate</div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-value">${periodLabel}</div>
      <div class="meta-label">Report Period</div>
    </div>
    <div class="meta-item">
      <div class="meta-value">${new Date().toLocaleDateString()}</div>
      <div class="meta-label">Generated On</div>
    </div>
    <div class="meta-item">
      <div class="meta-value">${stats?.total || 0}</div>
      <div class="meta-label">Total Screenings</div>
    </div>
    <div class="meta-item">
      <div class="meta-value">${stats?.success_rate || 0}%</div>
      <div class="meta-label">Success Rate</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">📊 Executive Summary</h2>
    <div class="grid">
      <div class="card trend-up">
        <div class="card-value">${(dashboardData?.summary.total_screenings || 0).toLocaleString()}</div>
        <div class="card-label">Total Screenings</div>
      </div>
      <div class="card trend-down">
        <div class="card-value">${(dashboardData?.total_matches || 0).toLocaleString()}</div>
        <div class="card-label">Critical Matches</div>
      </div>
      <div class="card trend-up">
        <div class="card-value">${dashboardData?.match_rate || 0}%</div>
        <div class="card-label">Match Rate</div>
      </div>
      <div class="card">
        <div class="card-value">${dashboardData?.summary.total_active_monitoring || 0}</div>
        <div class="card-label">Active Monitoring</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">⚠️ Risk Distribution</h2>
    <table>
      <thead>
        <tr>
          <th>Risk Level</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${riskProfile.map((risk: any) => {
          const pct = totalRisk > 0 ? ((risk.value / totalRisk) * 100).toFixed(1) : "0";
          const cssClass = risk.name.toLowerCase().includes('high') ? 'risk-high' : 
                          risk.name.toLowerCase().includes('medium') ? 'risk-medium' : 'risk-low';
          return `<tr><td class="${cssClass}">${risk.name}</td><td>${risk.value}</td><td>${pct}%</td></tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">📋 Screening Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Individuals</td><td>${breakdown.individual || 0}</td></tr>
        <tr><td>Entities</td><td>${breakdown.entity || 0}</td></tr>
        <tr><td>PEP Matches</td><td>${breakdown.pep || 0}</td></tr>
        <tr><td>Sanctions Matches</td><td>${breakdown.sanctions || 0}</td></tr>
        <tr><td>Other Matches</td><td>${breakdown.others || 0}</td></tr>
        <tr><td>Non-Matches (Clear)</td><td>${breakdown.non_matches || 0}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">📈 Daily Activity</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Screenings</th>
          <th>Alerts</th>
        </tr>
      </thead>
      <tbody>
        ${(activityStats?.activity || []).map((day: any) => 
          `<tr><td>${day.full_date}</td><td>${day.screenings}</td><td>${day.alerts}</td></tr>`
        ).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div class="footer-logo">AMLTAB - Enterprise Compliance Platform</div>
    <p>This report contains confidential information intended for authorized personnel only.</p>
    <p>Generated on ${new Date().toLocaleString()} | Report Period: ${periodLabel}</p>
  </div>
</body>
</html>`;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // KPI Cards Data
  const kpiCards = useMemo(() => {
    if (!dashboardData && !activityStats) return [];

    const stats = activityStats?.stats;
    const totalScreenings = dashboardData?.summary.total_screenings || stats?.total || 0;
    const alerts = dashboardData?.total_matches || stats?.alerts || 0;
    const matchRate = stats && stats.total > 0 
      ? (((stats.breakdown?.pep || 0) + (stats.breakdown?.sanctions || 0) + (stats.breakdown?.others || 0)) / stats.total * 100)
      : 0;

    return [
      {
        label: "Total Screenings",
        value: totalScreenings,
        change: 12.4,
        trend: "up" as const,
        color: "#6366f1",
        icon: <Shield size={18} />,
        format: "number" as const,
        trendData: activityStats?.activity?.slice(-14).map((d) => ({
          value: d.screenings,
        })) || [],
      },
      {
        label: "Critical Matches",
        value: alerts,
        change: -4.2,
        trend: "down" as const,
        color: "#ef4444",
        icon: <AlertTriangle size={18} />,
        format: "number" as const,
        trendData: activityStats?.activity?.slice(-14).map((d) => ({
          value: d.alerts,
        })) || [],
      },
      {
        label: "Match Rate",
        value: matchRate.toFixed(1),
        change: 2.1,
        trend: "up" as const,
        color: "#10b981",
        icon: <Target size={18} />,
        format: "number" as const,
      },
      {
        label: "Pending Review",
        value: stats?.pending || 0,
        change: stats?.pending ? -8 : 0,
        trend: "down" as const,
        color: "#f59e0b",
        icon: <Clock size={18} />,
        format: "number" as const,
        subtitle: "awaiting action",
      },
      {
        label: "Active Monitoring",
        value: dashboardData?.summary.total_active_monitoring || 0,
        change: 8.7,
        trend: "up" as const,
        color: "#06b6d4",
        icon: <Eye size={18} />,
        format: "number" as const,
        status: "success" as const,
      },
      {
        label: "Monthly Cost",
        value: dashboardData?.summary.total_billing || 0,
        change: 5.3,
        trend: "down" as const,
        color: "#8b5cf6",
        icon: <DollarSign size={18} />,
        format: "number" as const,
      },
    ];
  }, [dashboardData, activityStats]);

  // Quick Stats
  const quickStats = useMemo(() => {
    if (!activityStats) return [];
    const breakdown = activityStats.stats?.breakdown || {};
    return [
      {
        label: "Individuals",
        value: (breakdown.individual || 0).toLocaleString(),
        change: 15.2,
        trend: "up" as const,
        icon: <Users size={20} />,
        color: "#6366f1",
        href: "/screenings?type=individual",
      },
      {
        label: "Entities",
        value: (breakdown.entity || 0).toLocaleString(),
        change: 8.4,
        trend: "up" as const,
        icon: <Globe size={20} />,
        color: "#10b981",
        href: "/screenings?type=entity",
      },
      {
        label: "PEP Hits",
        value: (breakdown.pep || 0).toLocaleString(),
        change: -2.1,
        trend: "down" as const,
        icon: <FileText size={20} />,
        color: "#f59e0b",
        href: "/screenings?type=pep",
      },
      {
        label: "Sanctions",
        value: (breakdown.sanctions || 0).toLocaleString(),
        change: 0,
        trend: "neutral" as const,
        icon: <ShieldCheck size={20} />,
        color: "#ef4444",
        href: "/screenings?type=sanctions",
      },
    ];
  }, [activityStats]);

  // Chart data transformation
  const chartData = useMemo(() => {
    if (activityStats?.activity && activityStats.activity.length > 0) {
      // Use activity data for the area chart
      return activityStats.activity.map((d) => ({
        label: d.name,
        screenings: d.screenings,
        rescreenings: Math.floor(d.screenings * 0.2),
      }));
    }
    
    if (dashboardData?.yearly_chart_data && dashboardData.yearly_chart_data.length > 0) {
      // Use yearly chart data
      return dashboardData.yearly_chart_data.map((d) => ({
        label: d.label,
        screenings: d.value,
        rescreenings: Math.floor(d.value * 0.2),
      }));
    }
    
    // Generate sample data if no data available
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      label: day,
      screenings: Math.floor(Math.random() * 50) + 20,
      rescreenings: Math.floor(Math.random() * 10) + 5,
    }));
  }, [dashboardData, activityStats]);

  // Match breakdown data
  const matchBreakdownData = useMemo(() => {
    const breakdown: any = activityStats?.stats?.breakdown || {};
    return [
      { label: "PEP", new: breakdown.pep || 0 },
      { label: "Sanctions", new: breakdown.sanctions || 0 },
      { label: "Others", new: breakdown.others || 0 },
      { label: "Clear", new: breakdown.non_matches || 0 },
    ];
  }, [activityStats]);

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Synthesizing operational intelligence..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ErrorState 
          message={error} 
          onRetry={fetchData} 
          fullPage 
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Enterprise Dashboard</h1>
          <p className={styles.subtitle}>
            Real-time compliance monitoring and risk intelligence
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.periodSelector}>
            {(["24h", "7d", "30d", "90d", "1y"] as const).map((p) => (
              <button
                key={p}
                className={`${styles.periodBtn} ${period === p ? styles.active : ""}`}
                onClick={() => handlePeriodChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className={styles.iconBtn}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh Data"
          >
            <RefreshCw size={18} className={isRefreshing ? styles.spinning : ""} />
          </button>
          <button 
            className={styles.iconBtn} 
            onClick={() => setShowExportModal(true)}
            title="Export Report"
          >
            <Download size={18} />
          </button>
          <button 
            className={styles.iconBtn} 
            onClick={() => setShowSettingsPanel(true)}
            title="Dashboard Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* KPI Cards Row */}
      <section className={styles.kpiGrid}>
        {kpiCards.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </section>

      {/* Main Charts Row */}
      <section className={styles.mainCharts}>
        <div className={styles.chartMain}>
          <AreaChartWidget
            title="Screening Volume Trend"
            subtitle="Daily screening activity over the selected period"
            data={chartData}
            dataKey={["screenings", "rescreenings"]}
            xAxisKey="label"
            colors={["#6366f1", "#10b981"]}
            height={320}
            period={period}
            onPeriodChange={handlePeriodChange}
            icon={<Activity size={18} />}
            showLegend
            showGrid
          />
        </div>

        <div className={styles.chartSide}>
          <DonutChartWidget
            title="Risk Distribution"
            subtitle="Current portfolio breakdown"
            data={activityStats?.risk_profile || []}
            centerLabel="Total Risk"
            centerValue={activityStats?.stats?.total || 0}
            centerSubtext="Screenings"
            height={280}
            innerRadius={65}
            outerRadius={100}
            icon={<PieChartIcon size={18} />}
          />
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className={styles.quickStats}>
        <h2 className={styles.sectionTitle}>
          <BarChart3 size={20} />
          Screening Breakdown
        </h2>
        <div className={styles.statsGrid}>
          {quickStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Charts & Activity Row */}
      <section className={styles.bottomGrid}>
        <div className={styles.chartLeft}>
          <BarChartWidget
            title="Match Breakdown"
            subtitle="Hit distribution by category"
            data={matchBreakdownData}
            dataKey="new"
            xAxisKey="label"
            layout="vertical"
            colors={["#6366f1"]}
            height={280}
            icon={<Filter size={18} />}
            showValues
          />
        </div>

        <div className={styles.activityCenter}>
          <ActivityFeed
            title="Recent Activity"
            activities={activities}
            maxItems={8}
          />
        </div>

        <div className={styles.chartRight}>
          <div className={styles.ringCards}>
            <div className={styles.ringCardsHeader}>
              <Target size={20} />
              <h3>Key Metrics</h3>
            </div>
            <div className={styles.ringGrid}>
              <div className={styles.ringCard}>
                <div className={`${styles.ringCardValue} ${styles.success}`}>
                  {activityStats?.stats?.success_rate || 85}%
                </div>
                <div className={styles.ringCardLabel}>SLA Compliance</div>
                <div className={styles.ringCardProgress}>
                  <div 
                    className={`${styles.ringCardProgressFill} ${styles.green}`}
                    style={{ width: `${activityStats?.stats?.success_rate || 85}%` }}
                  />
                </div>
              </div>

              <div className={styles.ringCard}>
                <div className={`${styles.ringCardValue} ${styles.success}`}>
                  {dashboardData?.summary.total_active_monitoring || 0}
                </div>
                <div className={styles.ringCardLabel}>Active Monitoring</div>
                <div className={styles.ringCardProgress}>
                  <div 
                    className={`${styles.ringCardProgressFill} ${styles.blue}`}
                    style={{ width: "65%" }}
                  />
                </div>
              </div>

              <div className={styles.ringCard}>
                <div className={`${styles.ringCardValue} ${styles.warning}`}>
                  {activityStats?.stats?.pending || 0}
                </div>
                <div className={styles.ringCardLabel}>Pending Review</div>
                <div className={styles.ringCardProgress}>
                  <div 
                    className={`${styles.ringCardProgressFill} ${styles.orange}`}
                    style={{ width: "40%" }}
                  />
                </div>
              </div>

              <div className={styles.ringCard}>
                <div className={`${styles.ringCardValue}`}>
                  {dashboardData?.match_rate || 0}%
                </div>
                <div className={styles.ringCardLabel}>Match Rate</div>
                <div className={styles.ringCardProgress}>
                  <div 
                    className={`${styles.ringCardProgressFill} ${styles.blue}`}
                    style={{ width: `${dashboardData?.match_rate || 0}%` }}
                  />
                </div>
              </div>

              <div className={styles.ringCard}>
                <div className={`${styles.ringCardValue} ${styles.danger}`}>
                  {activityStats?.stats?.alerts || 0}
                </div>
                <div className={styles.ringCardLabel}>High Alerts</div>
                <div className={styles.ringCardProgress}>
                  <div 
                    className={`${styles.ringCardProgressFill} ${styles.red}`}
                    style={{ width: "25%" }}
                  />
                </div>
              </div>

              <div className={styles.ringCard}>
                <div className={`${styles.ringCardValue}`}>
                  {dashboardData?.summary.total_billing || 0}
                </div>
                <div className={styles.ringCardLabel}>Monthly Cost</div>
                <div className={styles.ringCardProgress}>
                  <div 
                    className={`${styles.ringCardProgressFill} ${styles.blue}`}
                    style={{ width: "55%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Actions */}
      <section className={styles.footerActions}>
        <Link href="/screen" className={styles.primaryAction}>
          <Search size={18} />
          New Screening
        </Link>
        <Link href="/cases" className={styles.secondaryAction}>
          <FileText size={18} />
          Review Cases
        </Link>
        <Link href="/monitoring" className={styles.secondaryAction}>
          <Eye size={18} />
          Monitoring
        </Link>
      </section>

      {/* Export Modal */}
      {showExportModal && (
        <div className={styles.modalOverlay} onClick={() => setShowExportModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalLogo}>
                <img src="/logo_brand_v1.png" alt="AMLTAB" width={32} height={32} />
                <h3>Export Dashboard Report</h3>
              </div>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowExportModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.exportDesc}>
                Download a comprehensive report with customizable date range and format.
              </p>

              {/* Date Range Selection */}
              <div className={styles.dateFilterSection}>
                <h4>
                  <CalendarDays size={16} />
                  Select Date Range
                </h4>
                <div className={styles.dateOptions}>
                  {[
                    { value: "today", label: "Today" },
                    { value: "7d", label: "Last 7 Days" },
                    { value: "30d", label: "Last 30 Days" },
                    { value: "90d", label: "Last 90 Days" },
                    { value: "custom", label: "Custom Range" },
                  ].map((option) => (
                    <label 
                      key={option.value}
                      className={`${styles.dateOption} ${exportDateRange === option.value ? styles.selected : ""}`}
                    >
                      <input
                        type="radio"
                        name="dateRange"
                        value={option.value}
                        checked={exportDateRange === option.value}
                        onChange={(e) => setExportDateRange(e.target.value as any)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                {/* Custom Date Inputs */}
                {exportDateRange === "custom" && (
                  <div className={styles.customDateInputs}>
                    <div className={styles.dateInput}>
                      <label>Start Date</label>
                      <input 
                        type="date" 
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        max={exportEndDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className={styles.dateSeparator}>→</div>
                    <div className={styles.dateInput}>
                      <label>End Date</label>
                      <input 
                        type="date" 
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        min={exportStartDate}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                )}

                {/* Selected Date Summary */}
                <div className={styles.dateSummary}>
                  <Calendar size={16} />
                  <span>
                    {exportDateRange === "today" && `Date: ${new Date().toLocaleDateString()}`}
                    {exportDateRange === "7d" && `7 Days: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} → ${new Date().toLocaleDateString()}`}
                    {exportDateRange === "30d" && `30 Days: ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} → ${new Date().toLocaleDateString()}`}
                    {exportDateRange === "90d" && `90 Days: ${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString()} → ${new Date().toLocaleDateString()}`}
                    {exportDateRange === "custom" && exportStartDate && exportEndDate && 
                      `${new Date(exportStartDate).toLocaleDateString()} → ${new Date(exportEndDate).toLocaleDateString()}`
                    }
                  </span>
                </div>
              </div>

              {/* Format Selection */}
              <div className={styles.formatSection}>
                <h4>
                  <FileText size={16} />
                  Select Format
                </h4>
                <div className={styles.exportOptions}>
                  <label className={`${styles.exportOption} ${exportFormat === 'csv' ? styles.selected : ''}`}>
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportFormat === "csv"}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <span className={styles.optionLabel}>
                      <FileText size={20} />
                      <strong>CSV</strong>
                      <small>Spreadsheet format</small>
                    </span>
                  </label>
                  <label className={`${styles.exportOption} ${exportFormat === 'json' ? styles.selected : ''}`}>
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={exportFormat === "json"}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <span className={styles.optionLabel}>
                      <BarChart3 size={20} />
                      <strong>JSON</strong>
                      <small>API integration</small>
                    </span>
                  </label>
                  <label className={`${styles.exportOption} ${exportFormat === 'pdf' ? styles.selected : ''}`}>
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={exportFormat === "pdf"}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <span className={styles.optionLabel}>
                      <FileText size={20} />
                      <strong>HTML Report</strong>
                      <small>Printable</small>
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Preview */}
              <div className={styles.exportPreview}>
                <h4>Report includes:</h4>
                <ul>
                  <li>📊 Executive Summary</li>
                  <li>⚠️ Risk Distribution</li>
                  <li>📋 Screening Breakdown</li>
                  <li>📈 Activity Timeline</li>
                </ul>
              </div>

              <button className={styles.exportBtn} onClick={handleExport}>
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettingsPanel && (
        <div className={styles.modalOverlay} onClick={() => setShowSettingsPanel(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Dashboard Settings</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowSettingsPanel(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.settingsSection}>
                <h4>Display Preferences</h4>
                <div className={styles.settingsRow}>
                  <span>Default Period</span>
                  <select className={styles.select} defaultValue="30d">
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>
                <div className={styles.settingsRow}>
                  <span>Currency</span>
                  <select className={styles.select} defaultValue="USD">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h4>Notifications</h4>
                <label className={styles.checkbox}>
                  <input type="checkbox" defaultChecked />
                  <span>Email alerts for high-risk matches</span>
                </label>
                <label className={styles.checkbox}>
                  <input type="checkbox" defaultChecked />
                  <span>Daily summary reports</span>
                </label>
                <label className={styles.checkbox}>
                  <input type="checkbox" />
                  <span>Weekly performance digest</span>
                </label>
              </div>
              
              <div className={styles.settingsSection}>
                <h4>Data Refresh</h4>
                <div className={styles.settingsRow}>
                  <span>Auto-refresh interval</span>
                  <select className={styles.select} defaultValue="5">
                    <option value="0">Manual only</option>
                    <option value="1">Every minute</option>
                    <option value="5">Every 5 minutes</option>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                  </select>
                </div>
              </div>

              <Link href="/settings" className={styles.settingsLink}>
                <Settings size={16} />
                Go to Full Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}