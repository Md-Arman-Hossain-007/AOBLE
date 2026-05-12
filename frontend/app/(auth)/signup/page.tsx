"use client";

import styles from "../auth.module.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import Image from "next/image";

type Fields = {
  username: string;
  email: string;
  full_name: string;
  organization_name: string;
  password: string;
  confirm_password: string;
};
type FieldErrors = Partial<Record<keyof Fields, string>>;

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState<Fields>({
    username: "",
    email: "",
    full_name: "",
    organization_name: "",
    password: "",
    confirm_password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name as keyof Fields]) {
      setFieldErrors((p) => ({ ...p, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!formData.full_name.trim()) errs.full_name = "Full name is required.";
    if (!formData.username.trim()) errs.username = "Username is required.";
    else if (formData.username.length < 3) errs.username = "Username must be at least 3 characters.";
    if (!formData.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Please enter a valid email.";
    if (!formData.organization_name.trim()) errs.organization_name = "Company name is required.";
    if (!formData.password) errs.password = "Password is required.";
    else if (formData.password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!formData.confirm_password) errs.confirm_password = "Please confirm your password.";
    else if (formData.password !== formData.confirm_password) errs.confirm_password = "Passwords do not match.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          organization_name: formData.organization_name,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner during registration
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <LoadingSpinner size="medium" text="Creating your account..." />
      </div>
    );
  }

  return (
    <>
      <div className={styles.formHeader}>
        <div className={styles.logoHeader}>
          <Image src="/logo_transparent.png" alt="AMLTAB" width={40} height={40} />
        </div>
        <h2>Create an account</h2>
        <p>Start your 14-day free trial, no credit card required</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={styles.successBanner}>
          <CheckCircle size={16} />
          <span>Account created! Redirecting to Sign In...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className={styles.formGroup}>
          <label htmlFor="full_name">Full Name</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            placeholder="John Doe"
            className={`${styles.input} ${fieldErrors.full_name ? styles.inputError : ""}`}
            value={formData.full_name}
            onChange={handleChange}
            autoComplete="name"
          />
          {fieldErrors.full_name && (
            <p className={styles.fieldError}><AlertCircle size={13} /> {fieldErrors.full_name}</p>
          )}
        </div>

        {/* Company Name */}
        <div className={styles.formGroup}>
          <label htmlFor="organization_name">Company Name</label>
          <input
            type="text"
            id="organization_name"
            name="organization_name"
            placeholder="Acme Corp"
            className={`${styles.input} ${fieldErrors.organization_name ? styles.inputError : ""}`}
            value={formData.organization_name}
            onChange={handleChange}
            autoComplete="organization"
          />
          {fieldErrors.organization_name && (
            <p className={styles.fieldError}><AlertCircle size={13} /> {fieldErrors.organization_name}</p>
          )}
        </div>

        {/* Username */}
        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="john_doe"
            className={`${styles.input} ${fieldErrors.username ? styles.inputError : ""}`}
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
          />
          {fieldErrors.username && (
            <p className={styles.fieldError}><AlertCircle size={13} /> {fieldErrors.username}</p>
          )}
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email">Work Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@company.com"
            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p className={styles.fieldError}><AlertCircle size={13} /> {fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Create a strong password"
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
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
            <p className={styles.fieldError}><AlertCircle size={13} /> {fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className={styles.formGroup}>
          <label htmlFor="confirm_password">Confirm Password</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm_password"
              name="confirm_password"
              placeholder="Repeat your password"
              className={`${styles.input} ${fieldErrors.confirm_password ? styles.inputError : ""}`}
              value={formData.confirm_password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.confirm_password && (
            <p className={styles.fieldError}><AlertCircle size={13} /> {fieldErrors.confirm_password}</p>
          )}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={success}>
          Create Account
        </button>
      </form>

      <div className={styles.switchAuth}>
        Already have an account?{" "}
        <Link href="/signin">Sign in</Link>
      </div>
    </>
  );
}
