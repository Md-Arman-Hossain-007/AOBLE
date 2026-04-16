"use client";

import styles from "../auth.module.css";
import Link from "next/link";
import { useState } from "react";
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from "lucide-react";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Backend always returns success (200) to prevent email enumeration
      setSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Unable to process request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.formHeader}>
        <div className={styles.logoHeader}>
          <Image src="/logo_brand_v1.png" alt="AMLTAB" width={40} height={40} />
        </div>
        <h2>Reset Password</h2>
        <p>Enter your professional email to receive a recovery link.</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className={styles.successBanner} style={{ padding: '24px', textAlign: 'center', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '50%' }}>
            <Mail size={32} color="#10b981" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Check your email</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              If an account is associated with <strong>{email}</strong>, you will receive a reset link shortly.
            </p>
          </div>
          <Link href="/signin" className={styles.submitBtn} style={{ textDecoration: 'none', width: '100%', display: 'flex' }}>
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Work Email</label>
            <input
              type="email"
              id="email"
              placeholder="you@company.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Processing..." : "Send Reset Link"}
          </button>

          <div className={styles.switchAuth} style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <Link href="/signin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ArrowLeft size={16} /> Back to Log In
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
