import { useNavigate } from "react-router";

export const PasswordRecoverySuccessPage = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-box auth-box--form">
      <p className="auth-title auth-title--center">Email sent!</p>
      <p className="auth-subtitle">
        If the provided email <br />
        was valid, a recovery link
        <br /> was sent.
        <br />
        <br />
        Check your email for
        <br /> the recovery link!
      </p>

      <button
        className="auth-button auth-button--full"
        type="submit"
        onClick={() => navigate("..")}
      >
        Return to login page
      </button>
    </div>
  );
};
