"use client";

import styles from "../auth.module.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import Image from "next/image";

type FieldErrors = { username?: string; password?: string };

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA States
  const [is2FARequired, setIs2FARequired] = useState(false)
  const [twoFACode, setTwoFACode] = useState("");

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!username.trim()) errs.username = "Username is required.";
    if (!password) errs.password = "Password is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const storeLoginData = (data: any) => {
    localStorage.setItem("amltab_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("amltab_refresh_token", data.refresh_token);
    }
    if (data.user) {
      localStorage.setItem("amltab_user", JSON.stringify(data.user));
    }
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid credentials. Please try again.");
        return;
      }

      // Handle 2FA requirement
      const is2FA = data.twofa_required === true || data['2fa_required'] === true;
      
      if (is2FA) {
        if (data.username) setUsername(data.username);
        setIs2FARequired(true);
        setError("");
        return;
      }

      // Check for successful login
      if (data.access_token) {
        storeLoginData(data);
      } else {
        // Fallback for unexpected response structure
        setError("Account security check required, but system state is ambiguous. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFACode.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: twoFACode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid 2FA code. Please try again.");
        return;
      }

      storeLoginData(data);
    } catch (err) {
      console.error("2FA Error:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner during login
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <LoadingSpinner size="medium" text={is2FARequired ? "Verifying code..." : "Signing in..."} />
      </div>
    );
  }

  if (is2FARequired) {
    return (
      <>
        <div className={styles.formHeader}>
          <div className={styles.logoHeader}>
            <Image src="/logo_transparent.png" alt="AMLTAB" width={40} height={40} />
          </div>
          <h2>Verification Required</h2>
          <p>Please enter the 6-digit code from your authenticator app.</p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify2FA}>
          <div className={styles.formGroup}>
            <label htmlFor="2facode">Security Code</label>
            <input
              type="text"
              id="2facode"
              placeholder="000000"
              className={styles.input}
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').substring(0, 6))}
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 'bold' }}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={twoFACode.length !== 6}>
            Verify & Sign In
          </button>

          <button 
            type="button" 
            className={styles.secondaryBtn} 
            onClick={() => setIs2FARequired(false)} 
            style={{ width: '100%', marginTop: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--secondary)' }}
          >
            Back to Sign In
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <div className={styles.formHeader}>
        <div className={styles.logoHeader}>
          <Image src="/logo_transparent.png" alt="AMLTAB" width={40} height={40} />
        </div>
        <h2>Welcome back</h2>
        <p>Log in to your AMLTAB account to continue</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="username">Username or Email</label>
          <input
            type="text"
            id="username"
            placeholder="e.g., admin or admin@example.com"
            className={`${styles.input} ${fieldErrors.username ? styles.inputError : ""}`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: undefined }));
            }}
            autoComplete="username"
          />
          {fieldErrors.username && (
            <p className={styles.fieldError}>
              <AlertCircle size={13} /> {fieldErrors.username}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">
            Password
            <Link href="/forgot" className={styles.forgotPassword}>Forgot password?</Link>
          </label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className={styles.fieldError}>
              <AlertCircle size={13} /> {fieldErrors.password}
            </p>
          )}
        </div>

        <button type="submit" className={styles.submitBtn}>
          Sign In
        </button>
      </form>

      <div className={styles.switchAuth}>
        Don&apos;t have an account?{" "}
        <Link href="/signup">Sign up</Link>
      </div>
    </>
  );
}
