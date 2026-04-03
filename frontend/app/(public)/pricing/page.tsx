"use client";

import { useState } from "react";
import styles from "./pricing.module.css";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className={styles.pricingSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Transparent pricing for teams of all sizes</h1>
          <p>Start for free, upgrade when you need more power and advanced compliance features.</p>
          
          <div className={styles.toggleWrapper}>
            <span className={!annual ? styles.activeLabel : ""}>Monthly</span>
            <button 
              className={`${styles.toggle} ${annual ? styles.toggleActive : ""}`} 
              onClick={() => setAnnual(!annual)}
            >
              <div className={styles.toggleHandle}></div>
            </button>
            <span className={annual ? styles.activeLabel : ""}>
              Annually <span className={styles.discountBadge}>Save 20%</span>
            </span>
          </div>
        </div>

        <div className={styles.pricingGrid}>
          {/* Starter Plan */}
          <div className={styles.pricingCard}>
            <div className={styles.planName}>Starter</div>
            <div className={styles.price}>
              ${annual ? "49" : "59"}<span>/mo</span>
            </div>
            <p className={styles.planDesc}>Perfect for early-stage startups and small businesses.</p>
            <Link href="/signup" className={styles.btnSecondary}>Start Free Trial</Link>
            
            <div className={styles.featureList}>
              <div className={styles.feature}><Check size={18} /> Up to 1,000 checks/mo</div>
              <div className={styles.feature}><Check size={18} /> Global Sanctions & Watchlists</div>
              <div className={styles.feature}><Check size={18} /> Basic API Access</div>
              <div className={styles.feature}><Check size={18} /> Community Support</div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className={`${styles.pricingCard} ${styles.popular}`}>
            <div className={styles.popularBadge}>Most Popular</div>
            <div className={styles.planName}>Professional</div>
            <div className={styles.price}>
              ${annual ? "199" : "249"}<span>/mo</span>
            </div>
            <p className={styles.planDesc}>For growing companies with continuous compliance needs.</p>
            <Link href="/signup" className={styles.btnPrimary}>Get Started</Link>
            
            <div className={styles.featureList}>
              <div className={styles.feature}><Check size={18} /> Up to 10,000 checks/mo</div>
              <div className={styles.feature}><Check size={18} /> PEP & Adverse Media</div>
              <div className={styles.feature}><Check size={18} /> Continuous Monitoring</div>
              <div className={styles.feature}><Check size={18} /> Advanced Fuzzy Matching</div>
              <div className={styles.feature}><Check size={18} /> Priority Email Support</div>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className={styles.pricingCard}>
            <div className={styles.planName}>Enterprise</div>
            <div className={styles.price}>
              Custom
            </div>
            <p className={styles.planDesc}>Tailored solutions for large institutions and banks.</p>
            <Link href="#" className={styles.btnSecondary}>Contact Sales</Link>
            
            <div className={styles.featureList}>
              <div className={styles.feature}><Check size={18} /> Unlimited checks</div>
              <div className={styles.feature}><Check size={18} /> Batch Processing via SFTP</div>
              <div className={styles.feature}><Check size={18} /> Custom Risk Scoring</div>
              <div className={styles.feature}><Check size={18} /> Dedicated Success Manager</div>
              <div className={styles.feature}><Check size={18} /> 99.99% Core Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
