import { useNavigate } from "react-router";

export const PasswordChangeSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-box auth-box--form">
      <p className="auth-title auth-title--center">Success!</p>
      <p className="auth-subtitle">
        Your new password was saved <br />
        and you may now log in using <br />
        the new password.
      </p>

      <button
        className="auth-button auth-button--full"
        onClick={() => navigate("/login")}
        type="button"
      >
        Return to login page
      </button>
    </div>
  );
};
