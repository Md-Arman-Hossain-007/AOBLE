import styles from "../legal.module.css";

export default function PolicyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Cookie Policy</h1>
        <p>Last updated: October 24, 2026</p>
      </div>
      
      <div className={styles.content}>
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your computer or mobile device by websites you visit. They are widely used to make websites work more efficiently and securely, as well as to provide reporting information to the site owners.
        </p>

        <h2>2. How AMLTAB Uses Cookies</h2>
        <p>
          AMLTAB uses cookies strictly for essential operational purposes and to enhance the functionality of our enterprise screening service. Specifically, we use them for:
        </p>
        <ul>
          <li><strong>Authentication:</strong> Keeping you logged in securely while you navigate the dashboard.</li>
          <li><strong>Security:</strong> Detecting and preventing fraud or malicious activities.</li>
          <li><strong>Preferences:</strong> Remembering your UI choices, such as dark mode or dashboard layout preferences.</li>
        </ul>

        <h2>3. Types of Cookies We Use</h2>
        <p>
          We use First-Party cookies (set by AMLTAB) and Third-Party cookies (set by our trusted analytics and infrastructure partners). 
        </p>
        <ul>
          <li><strong>Essential/Strictly Necessary Cookies:</strong> These cannot be switched off in our systems. They are usually set in response to actions made by you, like setting privacy preferences or logging in.</li>
          <li><strong>Performance & Analytics Cookies:</strong> Allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
        </ul>

        <h2>4. Managing Your Cookie Preferences</h2>
        <p>
          You have the right to decide whether to accept or reject non-essential cookies. You can exercise your preferences by adjusting your browser settings. However, if you choose to reject cookies, some areas of the AMLTAB dashboard may not function correctly.
        </p>
      </div>
    </div>
  );
}
