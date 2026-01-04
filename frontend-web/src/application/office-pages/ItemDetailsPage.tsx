import {
  MdOutlineBackspace,
  MdEditSquare,
  MdOutlineVisibilityOff,
} from "react-icons/md";
import { useParams, useNavigate } from "react-router";
import testPhotoUrl from "../../assets/test-photo.jpg";

export const ItemDetailsPage = () => {
  const navigate = useNavigate();

  const { itemName } = useParams<{ itemName: string }>();
  if (!itemName) return null;

  const officeName = "Lorem Ipsum Office";

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="office-top">
          <div className="office-meta">
            <h1 className="page-title">
              {officeName} - Desk #{itemName}
            </h1>
            <label>Type:</label>
            <label>Floor: </label>
            <label>Room:</label>
            <label>Pricing:</label>

            <div className="office-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={() => navigate("./edit")}
              >
                <MdEditSquare />
                <span>Edit</span>
              </button>

              <button
                className="btn-secondary"
                type="button"
                onClick={() => navigate("/app/bookings")}
              >
                <span>View bookings</span>
              </button>

              <button className="btn-link-danger" type="button">
                <MdOutlineVisibilityOff />
                <span>Unpublish</span>
              </button>

              <button className="btn-link-danger" type="button">
                <MdOutlineBackspace />
                <span>Delete</span>
              </button>
            </div>
            <br />

            <p className="page-label">Properties</p>

            <div className="properties-block">
              <div className="properties-field">
                <label className="properties-label">Desk:</label>
                <div className="properties-hint">(Choose 1 or 2)</div>

                <div className="check-row-group">
                  <label className="check-row">
                    <input type="checkbox" checked disabled />
                    <span>Standing Desk</span>
                  </label>

                  <label className="check-row">
                    <input type="checkbox" disabled />
                    <span>Sitting Desk</span>
                  </label>
                </div>

                <div className="properties-hint">(Choose 0 or 1)</div>

                <label className="check-row">
                  <input type="checkbox" checked disabled />
                  <span>Desk with adjustable height</span>
                </label>
              </div>
            </div>
          </div>
          <div className="office-side">
            <div className="office-side-card">
              <img className="office-side-img" src={testPhotoUrl} alt="Desk" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
