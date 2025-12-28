import { useNavigate } from "react-router";

export const MainPageLoggedOut = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-box">
      <p className="auth-title">This website is for administrators only.</p>
      <p className="auth-subtitle">Log in to access the website</p>
      <button className="auth-button" onClick={() => navigate("/login")}>
        Log in
      </button>
    </div>
  );
};
