import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export const PasswordChangePage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = useMemo(() => params.get("token")?.trim() ?? "", [params]);

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid or expired link.");
      return;
    }
    if (!password || !repeat) {
      setError("Please fill in both fields.");
      return;
    }
    if (password !== repeat) {
      setError("Passwords do not match.");
      return;
    }

    // TODO (backend): call authApi.resetPassword({ token, password })
    navigate("/password-change/success", { replace: true });
  };

  // If token missing:
  if (!token) {
    return (
      <div className="auth-box auth-box--form">
        <p className="auth-title auth-title--center">Invalid link</p>
        <p className="auth-subtitle">
          This password reset link is missing a token.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="auth-button auth-button--full"
        >
          Return to login page
        </button>
      </div>
    );
  }

  return (
    <div className="auth-box auth-box--form">
      <p className="auth-title auth-title--center">Change your password</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="newPassword">
          New password
        </label>
        <input
          id="newPassword"
          className={`auth-input ${error ? "auth-input--error" : ""}`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="auth-label" htmlFor="repeatPassword">
          Repeat password
        </label>
        <input
          id="repeatPassword"
          className={`auth-input ${error ? "auth-input--error" : ""}`}
          type="password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-button auth-button--full" type="submit">
          Save
        </button>
      </form>
    </div>
  );
};
