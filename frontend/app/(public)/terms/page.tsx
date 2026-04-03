import styles from "../legal.module.css";

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Terms of Condition</h1>
        <p>Last updated: October 24, 2026</p>
      </div>
      
      <div className={styles.content}>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using the AMLTAB platform ("Service"), you agree to be bound by these Terms of Condition. If you do not agree to these terms, please do not use our Service.
        </p>

        <h2>2. Use of Service</h2>
        <p>
          AMLTAB provides an enterprise SaaS solution for Anti-Money Laundering (AML) and Know Your Customer (KYC) screening. The service is intended for business use only. You agree to use the Service exclusively for lawful purposes and in a way that respects the rights of others.
        </p>

        <h2>3. User Responsibilities</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You agree not to share your account access with unauthorized users.</li>
          <li>You must ensure that all data provided for screening is collected legally and complies with applicable privacy laws in your jurisdiction.</li>
        </ul>

        <h2>4. Data Accuracy and Liability</h2>
        <p>
          While we strive to provide the most accurate and up-to-date sanctions and PEP data, the Service is provided "as is." AMLTAB cannot be held liable for any false positives or false negatives during the screening process. The final compliance decision always rests with your organization.
        </p>

        <h2>5. Termination</h2>
        <p>
          We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </div>
    </div>
  );
}
