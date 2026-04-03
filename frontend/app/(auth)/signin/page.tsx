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

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!username.trim()) errs.username = "Username is required.";
    if (!password) errs.password = "Password is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
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
        // Handle 2FA requirement
        if (data.twofa_required) {
          setError("Two-factor authentication required. Please use your authenticator app.");
          return;
        }
        setError(data.detail || "Invalid credentials. Please try again.");
        return;
      }

      // Store tokens
      localStorage.setItem("amltab_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("amltab_refresh_token", data.refresh_token);
      }
      if (data.user) {
        localStorage.setItem("amltab_user", JSON.stringify(data.user));
      }
      
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner during login
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <LoadingSpinner size="medium" text="Signing in..." />
      </div>
    );
  }

  return (
    <>
      <div className={styles.formHeader}>
        <div className={styles.logoHeader}>
          <Image src="/logo_brand_v1.png" alt="AMLTAB" width={40} height={40} />
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
