import styles from "./public.module.css";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "../components/ThemeToggle";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.publicContainer}>
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <Image src="/logo_brand_v1.png" alt="AMLTAB Logo" width={32} height={32} />
            AMLTAB
          </Link>

          <nav className={styles.navLinks}>
            <Link href="/features" className={styles.navLink}>Features</Link>
            <Link href="/pricing" className={styles.navLink}>Pricing</Link>
            <Link href="/enterprise" className={styles.navLink}>Enterprise</Link>
          </nav>

          <div className={styles.navActions}>
            <ThemeToggle />
            <Link href="/signin" className={styles.navLogin}>
              Log in
            </Link>
            <Link href="/signup" className={styles.navButton}>
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <Image src="/logo_brand_v1.png" alt="AMLTAB Logo" width={28} height={28} />
              AMLTAB
            </div>
            <p>Next-generation enterprise screening built for modern compliance teams.</p>
          </div>
          
          <div className={styles.footerLinksGrid}>
            <div className={styles.footerColumn}>
              <h4>Product</h4>
              <Link href="/features">Features</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="#">Integrations</Link>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <Link href="#">About</Link>
              <Link href="#">Customers</Link>
              <Link href="#">Careers</Link>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/policy">Cookie Policy</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} AMLTAB Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
