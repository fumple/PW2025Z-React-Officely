import { Outlet, NavLink, type NavLinkRenderProps } from "react-router";
import "./AppLayout.css";
import appLogoUrl from "../assets/logo.svg";

export const AppLayout = () => {
  const linkClassName = ({ isActive }: NavLinkRenderProps) => {
    return isActive ? "app-active-link" : "app-link";
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-header-menu">
          <NavLink to="/app" className="app-logo-link">
            <img src={appLogoUrl} className="app-logo-badge" alt="logo" />
          </NavLink>
          <NavLink to="/app/offices" className={linkClassName}>
            Offices
          </NavLink>
          <NavLink to="/app/bookings" className={linkClassName}>
            Bookings
          </NavLink>
          <NavLink to="/app/users" className={linkClassName}>
            Users
          </NavLink>
          <NavLink to="/app/payments" className={linkClassName}>
            Payments
          </NavLink>
        </nav>
        <div className="app-header-user">
          <span className="app-user-avatar">A</span>
          <span className="app-user-name">Name Surname</span>
          <button className="app-logout-btn">Log Out</button>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};
