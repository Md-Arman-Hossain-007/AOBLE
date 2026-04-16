"use client";

import styles from "../auth.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function ResetPasswordConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to reset password. The link may have expired.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/signin"), 3000);
    } catch (err) {
      console.error("Reset password confirm error:", err);
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
        <h2>Create New Password</h2>
        <p>Ensure your new password meets the institutional security policy.</p>
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
            <ShieldCheck size={32} color="#10b981" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Password Updated</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Your password has been reset successfully. Redirecting you to the sign-in page...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="password">New Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!token}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirm_password">Confirm New Password</label>
            <input
              type="password"
              id="confirm_password"
              placeholder="••••••••"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!token}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading || !token}>
            {loading ? "Updating..." : "Reset Password"}
          </button>

          {!token && (
            <div className={styles.switchAuth}>
              <Link href="/forgot">Request a new reset link</Link>
            </div>
          )}
        </form>
      )}
    </>
  );
}
