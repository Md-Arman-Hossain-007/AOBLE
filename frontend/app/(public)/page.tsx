import styles from "./landing.module.css";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Search, Globe, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Next-Gen AML Screening</div>
          <h1 className={styles.heroTitle}>
            Enterprise screening, <span className={styles.highlight}>automated</span> & <span className={styles.highlight}>secure</span>.
          </h1>
          <p className={styles.heroSubtitle}>
            Protect your business from financial crimes with our real-time, AI-driven AML and KYC screening platform. Trusted by forward-thinking compliance teams.
          </p>
          <div className={styles.heroActions}>
            <Link href="/signup" className={styles.primaryBtn}>
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="/features" className={styles.secondaryBtn}>
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Why choose AMLTAB?</h2>
            <p>Everything you need to stay compliant, without the operational overhead.</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}><Shield size={24} /></div>
              <h3>Continuous Monitoring</h3>
              <p>Automatically rescreen your entities daily against global watchlists, PEPs, and sanctions.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}><Zap size={24} /></div>
              <h3>Lightning Fast API</h3>
              <p>Integrate our sub-second REST API seamlessly into your existing onboarding flow.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}><Globe size={24} /></div>
              <h3>Global Coverage</h3>
              <p>Access data from 200+ countries, continuously updated directly from official sources.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2>Ready to streamline your compliance?</h2>
            <p>Join thousands of businesses managing risk with AMLTAB.</p>
            <Link href="/signup" className={styles.primaryBtnWhite}>
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
