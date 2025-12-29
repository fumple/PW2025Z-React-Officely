import {
  MdLocationOn,
  MdCalendarMonth,
  MdCheckBox,
  MdAttachMoney,
} from "react-icons/md";

export const MainPage = () => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-icon">
          <MdLocationOn size={28} />
        </span>
        <div className="stat-number">100</div>
        <div className="stat-label">Active offices</div>
      </div>
      <div className="stat-card">
        <span className="stat-icon">
          <MdCalendarMonth size={28} />
        </span>
        <div className="stat-number">100</div>
        <div className="stat-label">Future bookings</div>
      </div>
      <div className="stat-card">
        <span className="stat-icon">
          <MdCheckBox size={28} />
        </span>
        <div className="stat-number">100</div>
        <div className="stat-label">Past bookings</div>
      </div>
      <div className="stat-card">
        <span className="stat-icon">
          <MdAttachMoney size={28} />
        </span>
        <div className="stat-number">0</div>
        <div className="stat-label">Pending payments</div>
      </div>
    </div>
  );
};
