"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./enterprise.module.css";
import {
  Search, ShieldCheck, AlertTriangle, CheckCircle2,
  ArrowRight, Building2, Globe, Lock, Zap, Users,
  ChevronRight, Database, Filter, Cpu, FileCheck,
  Loader2, Circle, CheckCircle, XCircle
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_DATABASE = [
  { name: "Kim Jong-un", type: "Sanctioned Individual", list: "OFAC SDN List", risk: "Critical", country: "North Korea", detail: "Supreme Leader, DPRK — Under multiple international sanctions since 2010." },
  { name: "Muammar Gaddafi", type: "PEP (Deceased)", list: "UN Sanctions List", risk: "High", country: "Libya", detail: "Former Libyan leader — assets frozen under UN Resolution 1970." },
  { name: "Meng Wanzhou", type: "Politically Exposed Person", list: "PEP Database", risk: "Medium", country: "China", detail: "CFO of Huawei Technologies — subject to extradition proceedings (2018–2021)." },
  { name: "Petrov Alexandr", type: "Watchlist Match", list: "EU Consolidated List", risk: "High", country: "Russia", detail: "Alleged intelligence operative — linked to Salisbury poisoning." },
  { name: "Acme Holdings", type: "Sanctioned Entity", list: "OFAC SDN List", risk: "Critical", country: "Iran", detail: "Shell company linked to IRGC financing activities." },
  { name: "Viktor Bout", type: "Sanctioned Individual", list: "US OFAC / Interpol", risk: "Critical", country: "Russia", detail: "Arms dealer, convicted 2012, released in prisoner exchange 2022." },
];

const riskColor: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#6366f1",
  Low: "#10b981",
};

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (!q) return 0;
  if (t === q) return 100;
  if (t.includes(q)) return 88;
  const words = q.split(" ");
  const matches = words.filter((w) => w.length > 1 && t.includes(w));
  return Math.round((matches.length / words.length) * 72);
}

// ─── Pipeline step definition ─────────────────────────────────
type StepStatus = "pending" | "running" | "done" | "error";
interface PipelineStep {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  logMessages: string[];
  durationMs: number;
}

function buildPipeline(query: string, entityType: string): PipelineStep[] {
  return [
    {
      id: "parse",
      icon: Search,
      label: "Parsing Query",
      sublabel: "Tokenising input and normalising entity type",
      logMessages: [
        `[PARSER] Input received: "${query}"`,
        `[PARSER] Entity type: ${entityType === "individual" ? "NATURAL_PERSON" : "LEGAL_ENTITY"}`,
        `[PARSER] Applying Unicode normalisation…`,
        `[PARSER] Generating phonetic variants (Soundex/Metaphone)…`,
        `[PARSER] Tokens: [${query.split(" ").map(w => `"${w}"`).join(", ")}]`,
        `[PARSER] Query ready ✓`,
      ],
      durationMs: 900,
    },
    {
      id: "connect",
      icon: Database,
      label: "Connecting to Databases",
      sublabel: "Establishing connections to 6 watchlist sources",
      logMessages: [
        `[DB] Connecting to OFAC SDN List (us-east-1)…  ✓`,
        `[DB] Connecting to EU Consolidated Sanctions (eu-west-1)…  ✓`,
        `[DB] Connecting to UN Security Council List…  ✓`,
        `[DB] Connecting to PEP Global Database…  ✓`,
        `[DB] Connecting to Interpol Notices…  ✓`,
        `[DB] Connecting to Country-Level Sources (194 lists)…  ✓`,
        `[DB] All 6 sources live. Total entries indexed: 1,247,819`,
      ],
      durationMs: 1100,
    },
    {
      id: "scan",
      icon: Filter,
      label: "Running Fuzzy Match",
      sublabel: "Scanning 1.2M+ records with Levenshtein + phonetic scoring",
      logMessages: [
        `[MATCH] Candidate pre-filter: reduced to 84,321 candidates`,
        `[MATCH] Running Levenshtein distance (threshold ≤ 3)…`,
        `[MATCH] Running Jaro-Winkler scoring…`,
        `[MATCH] Applying phonetic fallback (Soundex)…`,
        `[MATCH] Cross-listing deduplication…`,
        `[MATCH] Match pass complete in 147ms`,
      ],
      durationMs: 1300,
    },
    {
      id: "risk",
      icon: Cpu,
      label: "Risk Scoring",
      sublabel: "Applying ML risk classifier and weighting model",
      logMessages: [
        `[RISK] Loading risk classification model v3.2…`,
        `[RISK] Applying entity type weights…`,
        `[RISK] Computing jurisdiction risk multipliers…`,
        `[RISK] Applying recency bias (last updated < 30d)…`,
        `[RISK] Final scores computed`,
      ],
      durationMs: 800,
    },
    {
      id: "report",
      icon: FileCheck,
      label: "Generating Report",
      sublabel: "Assembling compliance-ready structured output",
      logMessages: [
        `[REPORT] Formatting result payload…`,
        `[REPORT] Attaching source citations…`,
        `[REPORT] Writing audit log entry…`,
        `[REPORT] Response ready`,
      ],
      durationMs: 600,
    },
  ];
}

// ─── Step indicator ───────────────────────────────────────────
function StepIndicator({ step, status }: { step: PipelineStep; status: StepStatus }) {
  const Icon = step.icon;
  return (
    <div className={`${styles.pipelineStep} ${styles[`step_${status}`]}`}>
      <div className={styles.stepIconWrap}>
        {status === "running" ? <Loader2 size={18} className={styles.spin} /> :
         status === "done" ? <CheckCircle size={18} /> :
         status === "error" ? <XCircle size={18} /> :
         <Icon size={18} />}
      </div>
      <div className={styles.stepText}>
        <span className={styles.stepLabel}>{step.label}</span>
        <span className={styles.stepSub}>{step.sublabel}</span>
      </div>
      {status === "done" && <span className={styles.stepDone}>✓</span>}
      {status === "running" && <span className={styles.stepRunning}>running</span>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
type Result = typeof MOCK_DATABASE[0] & { score: number };

type Phase = "idle" | "pipeline" | "done";

export default function EnterprisePage() {
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState("individual");
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [results, setResults] = useState<Result[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const pipeline = useRef<PipelineStep[]>([]);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const appendLog = (msg: string) =>
    setLogs((l) => [...l, `[${new Date().toLocaleTimeString("en-US", { hour12: false })}]  ${msg}`]);

  const runPipeline = async () => {
    if (!query.trim()) return;
    pipeline.current = buildPipeline(query, entityType);
    const steps = pipeline.current;

    setPhase("pipeline");
    setResults([]);
    setLogs([]);
    setCurrentStepIdx(-1);
    setStepStatuses(Object.fromEntries(steps.map((s) => [s.id, "pending" as StepStatus])));

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setCurrentStepIdx(i);
      setStepStatuses((s) => ({ ...s, [step.id]: "running" }));
      appendLog(`▶ Starting: ${step.label}…`);

      const msgInterval = step.durationMs / (step.logMessages.length + 1);
      for (const msg of step.logMessages) {
        await delay(msgInterval);
        appendLog(msg);
      }

      await delay(msgInterval);
      setStepStatuses((s) => ({ ...s, [step.id]: "done" }));
    }

    // Compute results
    const matched = MOCK_DATABASE
      .map((item) => ({ ...item, score: fuzzyScore(query, item.name) }))
      .filter((item) => item.score > 30)
      .sort((a, b) => b.score - a.score);

    appendLog(`\n[DONE] Screening complete. ${matched.length} match(es) found.`);
    setResults(matched);
    setPhase("done");
    setCurrentStepIdx(-1);
  };

  const handleReset = () => {
    setPhase("idle");
    setQuery("");
    setLogs([]);
    setResults([]);
    setStepStatuses({});
    setCurrentStepIdx(-1);
  };

  const hasHits = results.length > 0;
  const steps = pipeline.current.length
    ? pipeline.current
    : buildPipeline(query || "…", entityType);

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}><span className={styles.pulse}></span>Enterprise Solution</div>
        <h1>Global AML Screening<br /><span className={styles.gradient}>at Any Scale</span></h1>
        <p>Purpose-built for banks, fintechs, and compliance teams. Scan individuals and entities against 1,200+ global watchlists in milliseconds — with 99.8% accuracy.</p>
        <div className={styles.heroActions}>
          <Link href="/signup" className={styles.btnPrimary}>Start Free Trial <ArrowRight size={18} /></Link>
          <a href="#demo" className={styles.btnSecondary}>Try Live Demo</a>
        </div>
        <div className={styles.heroStats}>
          {[["1.2M+", "Watchlist Entries"], ["< 200ms", "Avg Response"], ["99.8%", "Accuracy"], ["200+", "Countries"]].map(([val, lbl]) => (
            <div key={lbl} className={styles.statItem}>
              <span className={styles.statVal}>{val}</span>
              <span className={styles.statLbl}>{lbl}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section className={styles.demoSection} id="demo">
        <div className={styles.demoContainer}>
          <div className={styles.demoHeader}>
            <div className={styles.demoBadge}>🔴 Live Demo</div>
            <h2>Try the AML Screening Engine</h2>
            <p>Enter any name and watch AMLTAB work through every stage of the compliance pipeline in real-time.</p>
          </div>

          <div className={styles.terminal}>
            {/* Terminal bar */}
            <div className={styles.terminalBar}>
              <span className={styles.dot} style={{ background: "#ef4444" }}></span>
              <span className={styles.dot} style={{ background: "#f59e0b" }}></span>
              <span className={styles.dot} style={{ background: "#10b981" }}></span>
              <span className={styles.terminalTitle}>amltab:screening-engine — live pipeline</span>
              {phase !== "idle" && (
                <button className={styles.resetBtn} onClick={handleReset}>↺ Reset</button>
              )}
            </div>

            <div className={styles.terminalBody}>
              {/* Search row — only in idle */}
              {phase === "idle" && (
                <>
                  <div className={styles.searchRow}>
                    <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className={styles.select}>
                      <option value="individual">Individual</option>
                      <option value="entity">Entity</option>
                    </select>
                    <div className={styles.inputWrapper}>
                      <Search size={18} className={styles.inputIcon} />
                      <input
                        type="text"
                        placeholder={entityType === "individual" ? "e.g. Kim Jong-un, Petrov Alexandr…" : "e.g. Acme Holdings…"}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && runPipeline()}
                        className={styles.searchInput}
                      />
                    </div>
                    <button onClick={runPipeline} disabled={!query.trim()} className={styles.scanBtn}>
                      Run Screening <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className={styles.hints}>
                    <span>💡 Try:</span>
                    {["Kim Jong-un", "Petrov Alexandr", "Acme Holdings", "Viktor Bout"].map((s) => (
                      <button key={s} className={styles.hintChip} onClick={() => setQuery(s)}>
                        {s} <ChevronRight size={13} />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Pipeline view */}
              {phase !== "idle" && (
                <div className={styles.pipelineLayout}>
                  {/* Left: steps */}
                  <div className={styles.pipelineSteps}>
                    <div className={styles.pipelineHeading}>
                      <Cpu size={14} /> Processing Pipeline
                    </div>
                    {steps.map((step) => (
                      <StepIndicator
                        key={step.id}
                        step={step}
                        status={stepStatuses[step.id] || "pending"}
                      />
                    ))}
                    {phase === "done" && (
                      <div className={`${styles.pipelineStep} ${styles.step_done}`} style={{ marginTop: 8, background: "rgba(16,185,129,0.06)", borderColor: "#10b981" }}>
                        <div className={styles.stepIconWrap} style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                          <CheckCircle2 size={18} />
                        </div>
                        <div className={styles.stepText}>
                          <span className={styles.stepLabel}>Pipeline Complete</span>
                          <span className={styles.stepSub}>{results.length} match(es) found</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: log console */}
                  <div className={styles.logPanel} ref={logRef}>
                    <div className={styles.logHeading}><Circle size={10} className={styles.logDot} /> Live Output</div>
                    {logs.map((line, i) => (
                      <div key={i} className={`${styles.logLine} ${
                        line.includes("[DONE]") ? styles.logSuccess :
                        line.includes("▶") ? styles.logSection :
                        line.includes("✓") || line.includes("✓") ? styles.logOk :
                        ""
                      }`}>
                        {line}
                      </div>
                    ))}
                    {phase === "pipeline" && <div className={styles.logCursor}></div>}
                  </div>
                </div>
              )}

              {/* Results */}
              {phase === "done" && (
                <div className={styles.results}>
                  <div className={styles.resultsHeader}>
                    {hasHits ? (
                      <div className={styles.resultAlert}><AlertTriangle size={16} /> {results.length} Match{results.length > 1 ? "es" : ""} Found — Review Required</div>
                    ) : (
                      <div className={styles.resultClear}><CheckCircle2 size={16} /> No Matches — Subject Appears Clear</div>
                    )}
                    <span className={styles.queryInfo}>Query: <em>"{query}"</em></span>
                  </div>
                  {hasHits && (
                    <div className={styles.resultCards}>
                      {results.map((r, i) => (
                        <div key={i} className={styles.resultCard} style={{ borderLeftColor: riskColor[r.risk], animationDelay: `${i * 0.1}s` }}>
                          <div className={styles.cardTop}>
                            <div>
                              <span className={styles.cardName}>{r.name}</span>
                              <span className={styles.cardCountry}>{r.country}</span>
                            </div>
                            <span className={styles.riskBadge} style={{ background: `${riskColor[r.risk]}20`, color: riskColor[r.risk] }}>
                              {r.risk} Risk
                            </span>
                          </div>
                          <p className={styles.cardDetail}>{r.detail}</p>
                          <div className={styles.cardMeta}>
                            <span className={styles.listTag}>{r.list}</span>
                            <span className={styles.matchScore}>Match Score: {r.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise Features ── */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <h2>Built for Enterprise-Grade Compliance</h2>
          <div className={styles.featureGrid}>
            {[
              { icon: Globe, title: "1,200+ Watchlists", desc: "OFAC SDN, EU Consolidated, UN Sanctions, Interpol Notices, 200+ country-level lists — updated hourly." },
              { icon: Zap, title: "Sub-200ms Latency", desc: "Proprietary in-memory indexing delivers results in milliseconds, even under peak load." },
              { icon: Users, title: "Bulk Batch Screening", desc: "Upload CSV with 1M+ records and receive structured results via webhook overnight." },
              { icon: ShieldCheck, title: "Continuous Monitoring", desc: "Automatically re-screen your entire customer base daily with instant alerts on status changes." },
              { icon: Lock, title: "SOC 2 Type II", desc: "Bank-grade security. AES-256 at rest, TLS 1.3 in transit. Full audit trail and GDPR compliance." },
              { icon: Building2, title: "Dedicated CSM", desc: "A dedicated Customer Success Manager to onboard your team and run quarterly reviews." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className={styles.featureCard}>
                <div className={styles.featureIcon}><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2>Ready for Enterprise?</h2>
          <p>Talk to our compliance experts to get a custom deployment, SLA guarantees, and volume pricing.</p>
          <div className={styles.ctaActions}>
            <Link href="/signup" className={styles.ctaBtn}>Schedule a Demo <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
