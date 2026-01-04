import { useState } from "react";
import { MdSave, MdCancel } from "react-icons/md";
import { useNavigate } from "react-router";

export const PricingTableCreatePage = () => {
  const [unit, setUnit] = useState("PLN");
  const units = ["PLN", "USD", "EUR"];
  const navigate = useNavigate();

  const pricingTableId = "189";

  const pricingTableName = "Standard";
  const pricingTableType = "Regular";
  const officeName = "Lorem Ipsum Office";

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">
          {officeName} - Pricing Table {pricingTableType}
        </h1>
        <form>
          <label>Name (visible to customers)</label>
          <input type="text" value={pricingTableName} required />
          <div className="form-row-labels">
            <label className="form-row-label">Price per day</label>
            <label className="form-row-label form-row-label--right">Unit</label>
          </div>

          <div className="form-row">
            <input className="form-row-input" type="number" required />
            <select
              className="form-select form-row-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <label>Hours for free cancellation</label>
          <div className="properties-hint">
            The user has the number of hours written here befpre the reservation
            <br />
            starts to cancel it and receive a full refund
          </div>
          <input type="number" required />

          <label>Time for payment (hours)</label>
          <div className="properties-hint">
            After this time passes and the user still hasn't submitted payment,
            <br />
            the reservation is automatically cancelled
          </div>

          <div className="form-row">
            <input className="form-row-input" type="number" required />
            <select
              className="form-select form-row-select"
              value="before start"
              required
            >
              <option value="before start">before start</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`../pricing-table/${pricingTableId}`)}
            >
              <MdSave />
              <span>Save</span>
            </button>
            <button
              type="button"
              className="btn-link-danger"
              onClick={() => navigate("..")}
            >
              <MdCancel />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
