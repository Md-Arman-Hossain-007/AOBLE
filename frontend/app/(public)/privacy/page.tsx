import styles from "../legal.module.css";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Privacy Policy</h1>
        <p>Last updated: October 24, 2026</p>
      </div>
      
      <div className={styles.content}>
        <h2>1. Information We Collect</h2>
        <p>
          We collect information that you and your users provide directly to us through the use of the AMLTAB SaaS platform. This includes account creation data, billing details, and the entities/individuals submitted for AML screening.
        </p>
        <p>
          We automatically collect certain information when you visit, use, or navigate the platform, such as IP address, browser type, and usage patterns. We use <Link href="/policy">Cookies</Link> and similar tracking technologies to enhance your experience.
        </p>

        <h2>2. Data Security & Encryption</h2>
        <p>
          Security is fundamental to AMLTAB. We implement robust, bank-grade technical and organizational measures to secure your personal data against accidental or unlawful destruction, loss, alteration, and unauthorized disclosure. Data is encrypted in transit using TLS 1.3 and at rest using AES-256 standards.
        </p>

        <h2>3. How We Use Your Data</h2>
        <ul>
          <li>To provide, operate, and maintain our screening and compliance services.</li>
          <li>To process transactions and send related information (e.g., invoices).</li>
          <li>To communicate with you regarding updates, support queries, and promotional materials.</li>
          <li>To analyze usage to improve our platform's algorithms, matching engines, and UX.</li>
        </ul>

        <h2>4. Data Sharing & Third Parties</h2>
        <p>
          We do not sell your data. We may share data with trusted third-party service providers (e.g., cloud hosting, payment processors) strictly for fulfilling the service. We may also disclose data if required by law enforcement or regulatory authorities.
        </p>

        <h2>5. Your Privacy Rights</h2>
        <p>
          Depending on your location (such as under GDPR or CCPA), you may have the right to request access to, correction of, or erasure of your personal data. Contact our Data Protection Officer at <code>privacy@amltab.com</code> to exercise your rights.
        </p>
      </div>
    </div>
  );
}
