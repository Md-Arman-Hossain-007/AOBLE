import styles from "../landing.module.css";
import { Shield, Zap, Globe, Lock, Code, Activity, Search, Fingerprint, Database } from "lucide-react";

export default function FeaturesPage() {
  const featureList = [
    { icon: <Shield />, title: "Real-time Sanctions", desc: "Screen against OFAC, UN, EU, and HM Treasury lists instantly." },
    { icon: <Globe />, title: "Global PEP Data", desc: "Identify Politically Exposed Persons across 240+ countries and territories." },
    { icon: <Activity />, title: "Adverse Media", desc: "AI-driven continuous monitoring of global news for negative sentiment." },
    { icon: <Code />, title: "Developer First API", desc: "Integrate our sub-second REST API into your onboarding in minutes." },
    { icon: <Zap />, title: "Automated Rescreening", desc: "Set and forget. We continuously monitor your entities and alert you to changes." },
    { icon: <Lock />, title: "Bank-Grade Security", desc: "SOC2 Type II certified infrastructure with end-to-end encryption." },
    { icon: <Fingerprint />, title: "Entity Resolution", desc: "Advanced fuzzy matching reduces false positives by up to 80%." },
    { icon: <Search />, title: "Batch Processing", desc: "Screen millions of records asynchronously with high throughput." },
    { icon: <Database />, title: "Audit Trails", desc: "Immutable logs of every screening decision for regulatory audits." }
  ];

  return (
    <div style={{ padding: '64px 0', backgroundColor: 'var(--background)' }}>
      <div className={styles.container}>
        <div className={styles.sectionHeader} style={{ marginBottom: '80px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '16px' }}>Enterprise Features</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--secondary)', maxWidth: '700px', margin: '0 auto' }}>
            Everything compliance teams and developers need to build secure, compliant, and scalable onboarding flows.
          </p>
        </div>

        <div className={styles.grid}>
          {featureList.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.iconWrapper}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
