import { Link } from "react-router";
import { useState } from "react";

export const LoginPage = () => {
  const [hasError, setError] = useState(false);

  return (
    <div className="auth-box auth-box--form">
      <p className="auth-title auth-title--center">Welcome back!</p>

      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <label className="auth-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className={`auth-input ${hasError ? "auth-input--error" : ""}`}
          type="email"
        />

        <label className="auth-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className={`auth-input ${hasError ? "auth-input--error" : ""}`}
          type="password"
        />

        {hasError && (
          <p className="auth-error">Invalid email and/or password</p>
        )}

        <button
          className="auth-button auth-button--full"
          type="submit"
          onClick={() => setError(true)}
        >
          Log in
        </button>
      </form>

      <Link to="/password-recovery" className="auth-link">
        Forgot your password?
      </Link>
    </div>
  );
};
