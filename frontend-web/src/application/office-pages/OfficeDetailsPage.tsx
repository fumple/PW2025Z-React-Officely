import {
  MdAdd,
  MdEditSquare,
  MdOutlineBackspace,
  MdOutlineVisibilityOff,
  MdArrowDropDown,
  MdFilterList,
  MdDeleteOutline,
} from "react-icons/md";
import { useNavigate, useParams } from "react-router";
import { useMemo, useState } from "react";
import { Modal } from "../Modal";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type ItemRow = {
  name: string;
  floor: string;
  room: string;
  currentCapacity: string;
  totalCapacity: string;
};

type PricingRow = {
  id: string;
  name: string;
  price: string;
  usedBy: string;
  timeForPayment: string;
  timeForCancellation: string;
};

const allItems: ItemRow[] = Array.from({ length: 60 }).map((_, i) => ({
  name: String("A" + (i + 1)),
  floor: "Text line",
  room: "Text line",
  currentCapacity: "Text line",
  totalCapacity: "Text line",
}));

const allPricings: PricingRow[] = Array.from({ length: 80 }).map((_, i) => ({
  id: String(i + 1),
  name: "Text line",
  price: "Text line",
  usedBy: "Text line",
  timeForPayment: "Text line",
  timeForCancellation: "Text line",
}));

function getRowsPerPageOptions(totalCount: number) {
  if (totalCount === 0) return [10];
  const filtered = BASE_PAGE_SIZES.filter((n) => n <= totalCount);
  return filtered.length > 0 ? filtered : [totalCount];
}

function getEffectiveRowsPerPage(rowsPerPage: number, totalCount: number) {
  return totalCount === 0 ? rowsPerPage : Math.min(rowsPerPage, totalCount);
}

function getPageItems(totalPages: number): Array<number | "ellipsis"> {
  return totalPages <= 5
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : [1, 2, 3, "ellipsis", totalPages - 1, totalPages];
}

export const OfficeDetailsPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const officeName = "Lorem Ipsum Office";
  const officeDescription = "The perfect office for everyone!";
  const officeAddress = "al. Jerozolimskie 179, 02-222 Warszawa";
  const officeCountry = "Poland";

  const [itemsPage, setItemsPage] = useState(1);
  const [itemsRowsPerPage, setItemsRowsPerPage] = useState(10);

  const [pricingPage, setPricingPage] = useState(1);
  const [pricingRowsPerPage, setPricingRowsPerPage] = useState(10);

  const itemsTotalCount = allItems.length;
  const itemsRowsOptions = getRowsPerPageOptions(itemsTotalCount);
  const itemsEffectiveRows = getEffectiveRowsPerPage(
    itemsRowsPerPage,
    itemsTotalCount,
  );
  const itemsTotalPages = Math.max(
    1,
    Math.ceil(itemsTotalCount / itemsEffectiveRows),
  );
  const itemsCurrentPage = Math.min(itemsPage, itemsTotalPages);

  const pagedItems = useMemo(() => {
    const start = (itemsCurrentPage - 1) * itemsEffectiveRows;
    const end = start + itemsEffectiveRows;
    return allItems.slice(start, end);
  }, [itemsCurrentPage, itemsEffectiveRows]);

  const itemsFrom =
    itemsTotalCount === 0 ? 0 : (itemsCurrentPage - 1) * itemsEffectiveRows + 1;
  const itemsTo = Math.min(
    itemsCurrentPage * itemsEffectiveRows,
    itemsTotalCount,
  );
  const itemsPageItems = getPageItems(itemsTotalPages);

  const pricingTotalCount = allPricings.length;
  const pricingRowsOptions = getRowsPerPageOptions(pricingTotalCount);
  const pricingEffectiveRows = getEffectiveRowsPerPage(
    pricingRowsPerPage,
    pricingTotalCount,
  );
  const pricingTotalPages = Math.max(
    1,
    Math.ceil(pricingTotalCount / pricingEffectiveRows),
  );
  const pricingCurrentPage = Math.min(pricingPage, pricingTotalPages);

  const pagedPricings = useMemo(() => {
    const start = (pricingCurrentPage - 1) * pricingEffectiveRows;
    const end = start + pricingEffectiveRows;
    return allPricings.slice(start, end);
  }, [pricingCurrentPage, pricingEffectiveRows]);

  const pricingFrom =
    pricingTotalCount === 0
      ? 0
      : (pricingCurrentPage - 1) * pricingEffectiveRows + 1;
  const pricingTo = Math.min(
    pricingCurrentPage * pricingEffectiveRows,
    pricingTotalCount,
  );
  const pricingPageItems = getPageItems(pricingTotalPages);

  const { officeId } = useParams<{ officeId: string }>();
  if (!officeId) return null;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="office-top">
          <div className="office-meta">
            <h1 className="page-title">{officeName}</h1>
            <label>{officeDescription}</label>
            <label>Address: {officeAddress}</label>
            <label>Country: {officeCountry}</label>

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
                View bookings
              </button>

              <button className="btn-link-danger" type="button">
                <MdOutlineVisibilityOff />
                <span>Unpublish</span>
              </button>

              <button
                className="btn-link-danger"
                type="button"
                onClick={() => setOpen(true)}
              >
                <MdOutlineBackspace />
                <span>Delete</span>
              </button>

              <Modal
                open={open}
                title="Office deletion"
                onClose={() => setOpen(false)}
              >
                <p>
                  To delete an office the following requirements must be met:
                </p>
                <ul>
                  <li>
                    There may not be any upcoming or active reservations on the
                    office
                  </li>
                </ul>
                <p>
                  Unpublishing the office is preferred to deleting, since it
                  prevents new reservations from being made and hides the office
                  in search results, while still allowing users to view details
                  of this office in their reservations.
                </p>
                <p>Are you sure you want to delete the office?</p>

                <div className="form-actions">
                  <button
                    className="btn-primary"
                    onClick={() => alert("deleted")}
                  >
                    <MdDeleteOutline />
                    Yes
                  </button>
                  <button
                    className="btn-link-danger"
                    onClick={() => setOpen(false)}
                  >
                    No
                  </button>
                </div>
              </Modal>
            </div>
          </div>

          {/* ignore map for now */}
          {/* <div className="office-map-slot" /> */}
        </div>

        <div className="gallery-strip">{/* thumbnails */}</div>
        <p className="page-label">Bookable items</p>
        <button
          className="btn-primary"
          type="button"
          onClick={() => navigate("./item/new")}
        >
          <MdAdd />
          <span>Add</span>
        </button>

        <div className="page-table-card">
          <table className="page-table">
            <thead>
              <tr>
                <th>
                  <div className="th-inner">
                    <span>Name</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">
                    <span>Floor</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">
                    <span>Room</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">
                    <span>Current capacity</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">
                    <span>Total capacity</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th className="th-actions" />
                <th className="th-actions" />
              </tr>
            </thead>

            <tbody>
              {pagedItems.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td>{r.floor}</td>
                  <td>{r.room}</td>
                  <td>{r.currentCapacity}</td>
                  <td>{r.totalCapacity}</td>
                  <td className="td-actions">
                    <button
                      className="page-details-link"
                      type="button"
                      onClick={() => navigate(`./item/${r.name}`)}
                    >
                      Details
                    </button>
                  </td>
                  <td className="td-actions">
                    <button
                      className="page-details-link"
                      type="button"
                      onClick={() => navigate(`./item/${r.name}/edit`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="page-footer">
            <button className="page-footer-btn" type="button">
              Change columns
            </button>

            <div className="page-footer-left">
              <span className="page-footer-label">Rows per page:</span>
              <select
                className="page-select"
                value={itemsEffectiveRows}
                onChange={(e) => {
                  setItemsRowsPerPage(Number(e.target.value));
                  setItemsPage(1);
                }}
              >
                {itemsRowsOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="page-footer-center">
              {itemsFrom}-{itemsTo} of {itemsTotalCount}
            </div>

            <div className="pagination">
              <button
                className={`page-btn ${itemsCurrentPage === 1 ? "page-btn--disabled" : ""}`}
                type="button"
                disabled={itemsCurrentPage === 1}
                onClick={() => setItemsPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>

              {itemsPageItems.map((item, idx) =>
                item === "ellipsis" ? (
                  <span key={`i-e-${idx}`} className="page-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    className={`page-number ${itemsCurrentPage === item ? "page-number--active" : ""}`}
                    type="button"
                    onClick={() => setItemsPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                className={`page-btn ${itemsCurrentPage === itemsTotalPages ? "page-btn--disabled" : ""}`}
                type="button"
                disabled={itemsCurrentPage === itemsTotalPages}
                onClick={() =>
                  setItemsPage((p) => Math.min(itemsTotalPages, p + 1))
                }
              >
                Next →
              </button>
            </div>
          </div>
        </div>
        <p className="page-label">Pricing tables</p>
        <button
          className="btn-primary"
          type="button"
          onClick={() => navigate("./pricing-table/new")}
        >
          <MdAdd />
          <span>Add</span>
        </button>

        <div className="page-table-card">
          <table className="page-table">
            <thead>
              <tr>
                <th>
                  <div className="th-inner">
                    <span>Name</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">
                    <span>Price</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">
                    <span>Used by</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">
                    <span>Time for payment</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">
                    <span>Time for cancellation</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th className="th-actions" />
                <th className="th-actions" />
              </tr>
            </thead>

            <tbody>
              {pagedPricings.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.price}</td>
                  <td>{r.usedBy}</td>
                  <td>{r.timeForPayment}</td>
                  <td>{r.timeForCancellation}</td>
                  <td className="td-actions">
                    <button
                      className="page-details-link"
                      type="button"
                      onClick={() => navigate(`./pricing-table/${r.id}`)}
                    >
                      Details
                    </button>
                  </td>
                  <td className="td-actions">
                    <button
                      className="page-details-link"
                      type="button"
                      onClick={() => navigate(`./pricing-table/${r.id}/edit`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="page-footer">
            <button className="page-footer-btn" type="button">
              Change columns
            </button>

            <div className="page-footer-left">
              <span className="page-footer-label">Rows per page:</span>
              <select
                className="page-select"
                value={pricingEffectiveRows}
                onChange={(e) => {
                  setPricingRowsPerPage(Number(e.target.value));
                  setPricingPage(1);
                }}
              >
                {pricingRowsOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="page-footer-center">
              {pricingFrom}-{pricingTo} of {pricingTotalCount}
            </div>

            <div className="pagination">
              <button
                className={`page-btn ${pricingCurrentPage === 1 ? "page-btn--disabled" : ""}`}
                type="button"
                disabled={pricingCurrentPage === 1}
                onClick={() => setPricingPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>

              {pricingPageItems.map((item, idx) =>
                item === "ellipsis" ? (
                  <span key={`p-e-${idx}`} className="page-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    className={`page-number ${pricingCurrentPage === item ? "page-number--active" : ""}`}
                    type="button"
                    onClick={() => setPricingPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                className={`page-btn ${pricingCurrentPage === pricingTotalPages ? "page-btn--disabled" : ""}`}
                type="button"
                disabled={pricingCurrentPage === pricingTotalPages}
                onClick={() =>
                  setPricingPage((p) => Math.min(pricingTotalPages, p + 1))
                }
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
