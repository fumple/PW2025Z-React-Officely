import {
  MdArrowDropDown,
  MdFilterList,
  MdOutlineCheck,
  MdOutlineWarningAmber,
} from "react-icons/md";
import { useParams, useNavigate } from "react-router";
import { useMemo, useState } from "react";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type ItemRow = {
  name: string;
  user: string;
  date: string;
};

const allItems: ItemRow[] = Array.from({ length: 60 }).map(() => ({
  name: "Text line",
  user: "Text line",
  date: "Text line",
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

export const BookingDetailsPage = () => {
  const [openCancelNoRefund, setOpenCancelNoRefund] = useState(false);
  const [openCancelWithRefund, setOpenCancelWithRefund] = useState(false);
  const navigate = useNavigate();

  const officeId = "7";
  const officeName = "Lorem Ipsum Office";
  const deskId = "A131";
  const pricingTableCategory = "Standard";
  const userId = "19";
  const userEmail = "bob.react@example.com";

  const [itemsPage, setItemsPage] = useState(1);
  const [itemsRowsPerPage, setItemsRowsPerPage] = useState(10);

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

  const { bookingId } = useParams<{ bookingId: string }>();
  if (!bookingId) return null;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="office-top">
          <div className="office-meta">
            <h1 className="page-title">Booking #{bookingId}</h1>
            <label>
              Office:{" "}
              <span
                className="booking-link"
                onClick={() => navigate(`/app/offices/${officeId}`)}
              >
                {officeName}
              </span>
            </label>
            <label>
              Desk: <span className="booking-link">{deskId}</span>
            </label>
            <label>
              Pricing table:{" "}
              <span className="booking-link">{pricingTableCategory}</span>
            </label>
            <label>
              User:{" "}
              <span
                className="booking-link"
                onClick={() => navigate(`/app/users/${userId}`)}
              >
                {userEmail}
              </span>
            </label>
            <br />
            <label>Status: Future</label>
            <label>Starts:</label>
            <label>Ends:</label>
            <br />
            <label>Price due:</label>
            <label>Payment method: Bank transfer</label>
            <label>
              Payment status: Due &#40;Awaiting bank transfer confirmation from
              staff&#41;
            </label>

            <div className="office-actions">
              <button className="btn-primary" type="button">
                <MdOutlineCheck />
                <span>Mark as paid</span>
              </button>

              <button
                className="btn-link-danger"
                type="button"
                onClick={() => setOpenCancelNoRefund(true)}
              >
                <MdOutlineWarningAmber />
                <span>Cancel as not paid</span>
              </button>

              <Modal
                open={openCancelNoRefund}
                title="Cancel reservation as not paid"
                onClose={() => setOpenCancelNoRefund(false)}
              >
                <p>Are you sure that you want to cancel this reservation?</p>
                <div className="form-actions">
                  <button className="btn-primary">Yes</button>
                  <button
                    className="btn-link-danger"
                    onClick={() => setOpenCancelNoRefund(false)}
                  >
                    No
                  </button>
                </div>
              </Modal>

              <button
                className="btn-link-danger"
                type="button"
                onClick={() => setOpenCancelWithRefund(true)}
              >
                <MdOutlineWarningAmber />
                <span>Cancel with refund</span>
              </button>

              <Modal
                open={openCancelWithRefund}
                title="Cancel reservation"
                onClose={() => setOpenCancelWithRefund(false)}
              >
                <p>
                  Are you sure that you want to cancel this reservation?
                  <br />
                  This user will be given a full refund.
                </p>

                <p>Reason for cancellation</p>
                <textarea className="form-textarea" />
                <br />

                <div className="form-actions">
                  <button className="btn-primary">Yes</button>
                  <button
                    className="btn-link-danger"
                    onClick={() => setOpenCancelWithRefund(false)}
                  >
                    No
                  </button>
                </div>
              </Modal>
            </div>
          </div>
        </div>

        <p className="page-label">Change history:</p>

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
                    <span>User</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">
                    <span>Date</span>
                    <span className="th-icons">
                      <MdArrowDropDown size={18} />
                      <MdFilterList size={16} />
                    </span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {pagedItems.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.name}</td>
                  <td>{r.user}</td>
                  <td>{r.date}</td>
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
      </div>
    </div>
  );
};
