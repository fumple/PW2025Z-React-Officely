import { useNavigate } from "react-router";

export const PasswordRecoveryPage = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-box auth-box--form">
      <p className="auth-title auth-title--center">Forgot your password?</p>
      <p className="auth-subtitle">
        Enter your email and we'll <br />
        send you a recovery link!
      </p>

      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <label className="auth-label" htmlFor="email">
          Email
        </label>
        <input id="email" className="auth-input" type="email" />

        <button
          className="auth-button auth-button--full"
          type="submit"
          onClick={() => navigate("/password-recovery/success")}
        >
          Send Recovery Link
        </button>
      </form>
    </div>
  );
};
