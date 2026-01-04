import { MdOutlineBackspace, MdEditSquare } from "react-icons/md";
import { useParams, useNavigate } from "react-router";

export const PricingTableDetailsPage = () => {
  const navigate = useNavigate();

  const { pricingTableId } = useParams<{ pricingTableId: string }>();
  if (!pricingTableId) return null;

  const officeName = "Lorem Ipsum Office";
  const pricingTableName = "Regular";

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="office-top">
          <div className="office-meta">
            <h1 className="page-title">
              {officeName} - Pricing Table {pricingTableName}
            </h1>
            <label>Price per day:</label>
            <label>Free cancellation: 24h before reservation</label>
            <label>Payment required by: 24h after reservation was made</label>

            <div className="office-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={() => navigate("./edit")}
              >
                <MdEditSquare />
                <span>Edit</span>
              </button>

              <button className="btn-link-danger" type="button">
                <MdOutlineBackspace />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
