"use client";

import { useState } from "react";
import { loginAdmin } from "./actions";
import styles from "./manage.module.css";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        window.location.reload();
      } else {
        setError(res.error || "Login failed.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Header Bar */}
      <header className={styles.pageHeader}>
        <Link href="/" className={styles.headerLogo}>
          MATCON <span>2026</span>
        </Link>
        <div className={styles.headerMeta}>
          <span className={styles.metaTag}>// ADMIN_AUTH</span>
        </div>
      </header>

      <main className={styles.loginMain}>
        <div className={styles.loginCard}>
          <div className={styles.lockIcon}>
            <LockIcon />
          </div>
          <h1 className={styles.loginTitle}>Admin Portal</h1>
          <p className={styles.loginSubtitle}>
            Access the MATCON 2026 registration dashboard
          </p>

          {error && (
            <div className={styles.errorAlert}>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@matcon26.org"
                className={styles.input}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={styles.input}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              <span>{loading ? "Verifying..." : "Access Dashboard"}</span>
              {loading ? <SpinnerIcon /> : <KeyIcon />}
            </button>
          </form>
          
          <div className={styles.cardFooter}>
            <Link href="/" className={styles.backHomeLink}>
              ← Back to main site
            </Link>
          </div>
        </div>
      </main>

      <footer className={styles.pageFooter}>
        <span>© 2026 Department of Applied Chemistry, CUSAT</span>
        <span className={styles.metaTag}>// SECURE_SYSTEM</span>
      </footer>
    </div>
  );
}

// Icons
const LockIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "var(--accent, #c8f04a)" }}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const KeyIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    className={styles.spinner}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);
