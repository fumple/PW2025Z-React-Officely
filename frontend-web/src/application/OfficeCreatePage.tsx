import { useState, useEffect } from "react";
import { MdSave, MdAddPhotoAlternate, MdOutlineCancel } from "react-icons/md";
import { useNavigate } from "react-router";

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const MAX_IMAGES = 10;

export const OfficeCreatePage = () => {
  const [images, setImages] = useState<SelectedImage[]>([]);
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const canAddMore = images.length < MAX_IMAGES;
  const navigate = useNavigate();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newItems: SelectedImage[] = filesToAdd.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);

    // IMPORTANT: allow selecting the same file again next time
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const toRemove = prev.find((x) => x.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Create a new office</h1>
        <form>
          <label>Name</label>
          <input />
          <label>Description</label>
          <textarea className="form-textarea" />
          <label>Address</label>
          <input />
          {/* MAP */}
          <label>Gallery</label>

          <div className="gallery-strip">
            {images.map((img) => (
              <div key={img.id} className="gallery-thumb">
                <img src={img.previewUrl} alt={img.file.name} />
                <button
                  type="button"
                  className="gallery-remove"
                  onClick={() => removeImage(img.id)}
                >
                  ×
                </button>
              </div>
            ))}

            <label
              className={`gallery-add-tile ${!canAddMore ? "gallery-add-tile--disabled" : ""}`}
              title={canAddMore ? "Add image" : "Max images reached"}
            >
              <MdAddPhotoAlternate size={28} />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                disabled={!canAddMore}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-primary">
              <MdSave />
              <span>Save</span>
            </button>
            <button
              type="button"
              className="btn-link-danger"
              onClick={() => navigate("..")}
            >
              <MdOutlineCancel />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
