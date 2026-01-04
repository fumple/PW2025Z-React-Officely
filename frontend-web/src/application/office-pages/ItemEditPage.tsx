import { useState } from "react";
import { MdSave, MdCancel, MdAddPhotoAlternate } from "react-icons/md";
import { useParams, useNavigate } from "react-router";
import testPhotoUrl from "../../assets/test-photo.jpg";

export const ItemEditPage = () => {
  const [imageUrl, setImageUrl] = useState(testPhotoUrl);
  const [canAddMore, setCanAddMore] = useState(imageUrl === "" ? true : false);
  const navigate = useNavigate();

  const { itemName } = useParams<{ itemName: string }>();
  if (!itemName) return null;

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
        <h1 className="page-title">Edit item</h1>
        <form>
          <label>Name</label>
          <input type="text" value={itemName} />
          <label>Floor</label>
          <input type="text" />
          <label>Room</label>
          <input type="text" />

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
              onClick={() => navigate(`../${itemName}`)}
            >
              <MdSave />
              <span>Save</span>
            </button>
            <button
              type="button"
              className="btn-link-danger"
              onClick={() => navigate(`../${itemName}`)}
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
