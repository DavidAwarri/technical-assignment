import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h1 style={styles.title}>Team Boards</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          {(error || localError) && (
            <div style={styles.error}>
              {error || localError}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            style={styles.switchButton}
            disabled={isLoading}
          >
            Register
          </button>
        </p>

        <div style={styles.demoInfo}>
          <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>Demo Credentials:</p>
          <p style={{ margin: "4px 0", fontSize: 14 }}>Email: demo@example.com</p>
          <p style={{ margin: "4px 0", fontSize: 14 }}>Password: password123</p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "16px",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "32px",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 24px 0",
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
  },
  input: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
  },
  button: {
    padding: "10px",
    fontSize: "14px",
    fontWeight: 600,
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "4px",
    marginTop: "8px",
  },
  error: {
    padding: "8px 12px",
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#c00",
  },
  switchText: {
    margin: "16px 0 0 0",
    fontSize: "14px",
    textAlign: "center",
  },
  switchButton: {
    background: "none",
    border: "none",
    color: "#0066cc",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
    fontSize: "14px",
    fontFamily: "inherit",
  },
  demoInfo: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#666",
    border: "1px solid #eee",
  },
};
