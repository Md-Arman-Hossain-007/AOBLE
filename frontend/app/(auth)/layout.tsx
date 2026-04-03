import styles from "./auth.module.css";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link href="/" className={styles.logo}>
            <Image src="/logo_brand_v1.png" alt="AMLTAB Logo" width={40} height={40} />
            AMLTAB
          </Link>
          <div className={styles.authIntro}>
            <h1>Secure Enterprise Screening</h1>
            <p>Join thousands of compliance teams managing risks seamlessly and in fully automated ways.</p>
          </div>
          <div className={styles.authFeatures}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Real-time PEP & Sanctions Screening</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Global Watchlist Coverage</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Batch Processing for Large Files</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Compliance Reporting & Audit Trails</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.authRight}>
        <div className={styles.formContainer}>
          {children}
        </div>
      </div>
    </div>
  );
}
