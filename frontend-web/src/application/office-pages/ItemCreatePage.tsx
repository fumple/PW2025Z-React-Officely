import { useState } from "react";
import { MdSave, MdCancel, MdAddPhotoAlternate } from "react-icons/md";
import { useNavigate } from "react-router";

export const ItemCreatePage = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [canAddMore, setCanAddMore] = useState(imageUrl === "" ? true : false);
  const navigate = useNavigate();

  const itemId = "A459";

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files === null) return;

    setCanAddMore(false);
    setImageUrl(URL.createObjectURL(files[0]));

    e.target.value = "";
  };

  const removePhoto = () => {
    setImageUrl("");
    setCanAddMore(true);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Create item</h1>
        <form>
          <label>Name</label>
          <input type="text" />
          <label>Floor</label>
          <input type="text" />
          <label>Room</label>
          <input type="text" />
          <label>Number of desks</label>
          <input type="number" />
          <label>Pricing Table</label>
          <select value="Shared Room Pricing" className="form-select">
            <option value="Shared Room Pricing">Shared Room Pricing</option>
          </select>

          <p className="page-label">Properties</p>

          <div className="properties-block">
            <div className="properties-field">
              <label className="properties-label">Desk:</label>
              <div className="properties-hint">(Choose 1 or 2)</div>

              <div className="check-row-group">
                <label className="check-row">
                  <input type="checkbox" />
                  <span>Standing Desk</span>
                </label>

                <label className="check-row">
                  <input type="checkbox" />
                  <span>Sitting Desk</span>
                </label>
              </div>

              <div className="properties-hint">(Choose 0 or 1)</div>

              <label className="check-row">
                <input type="checkbox" />
                <span>Desk with adjustable height</span>
              </label>
            </div>
          </div>

          <p className="page-label">Photo</p>
          {imageUrl === "" ? (
            <label
              className={`gallery-add-tile ${!canAddMore ? "gallery-add-tile--disabled" : ""}`}
              title={canAddMore ? "Add image" : "Max images reached"}
            >
              <MdAddPhotoAlternate size={28} />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                disabled={!canAddMore}
                style={{ display: "none" }}
              />
            </label>
          ) : (
            <div className="gallery-thumb">
              <img src={imageUrl} />
              <button
                type="button"
                className="gallery-remove"
                onClick={removePhoto}
              >
                ×
              </button>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`../item/${itemId}`)}
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
