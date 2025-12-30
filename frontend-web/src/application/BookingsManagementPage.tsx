import { MdArrowDropDown, MdFilterList } from "react-icons/md";
import { useMemo, useState } from "react";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type BookingRow = {
  id: string;
  office: string;
  price: string; //NUMBER TYPE???
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  creationDate: string; //DATE TYPE????
  bookingPeriod: string; //ALSOO ??
};

const allBookings: BookingRow[] = Array.from({ length: 40 }).map(() => ({
  id: "Text line",
  office: "Text line",
  price: "Text line",
  paymentMethod: "Text line",
  paymentStatus: "Text line",
  bookingStatus: "Text line",
  creationDate: "Text line",
  bookingPeriod: "Text line",
}));
const allBookingsCount: number = allBookings.length;

export const BookingsManagementPage = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalCount = allBookings.length;

  const rowsPerPageOptions =
    totalCount === 0
      ? [10]
      : BASE_PAGE_SIZES.filter((n) => n <= totalCount).length > 0
        ? BASE_PAGE_SIZES.filter((n) => n <= totalCount)
        : [totalCount];

  const effectiveRowsPerPage =
    totalCount === 0 ? rowsPerPage : Math.min(rowsPerPage, totalCount);

  const totalPages = Math.max(1, Math.ceil(totalCount / effectiveRowsPerPage));
  const currentPage = Math.min(page, totalPages); // safety
  const pagedBookings = useMemo(() => {
    const start = (currentPage - 1) * effectiveRowsPerPage;
    const end = start + effectiveRowsPerPage;
    return allBookings.slice(start, end);
  }, [currentPage, effectiveRowsPerPage]);

  const from =
    allBookingsCount === 0 ? 0 : (page - 1) * effectiveRowsPerPage + 1;
  const to = Math.min(page * effectiveRowsPerPage, allBookingsCount);

  const pageItems: Array<number | "ellipsis"> =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [1, 2, 3, "ellipsis", totalPages - 1, totalPages];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Bookings</h1>
      </div>

      <div className="page-table-card">
        <table className="page-table">
          <thead>
            <tr>
              <th>
                <div className="th-inner">
                  <span>ID</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Office</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Price paid/due</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Payment method</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Payment status</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Booking status</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Creation date</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Booking period</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th className="th-actions" />
            </tr>
          </thead>

          <tbody>
            {pagedBookings.map((r, idx) => (
              <tr key={idx}>
                <td>{r.id}</td>
                <td>{r.office}</td>
                <td>{r.price}</td>
                <td>{r.paymentMethod}</td>
                <td>{r.paymentStatus}</td>
                <td>{r.bookingStatus}</td>
                <td>{r.creationDate}</td>
                <td>{r.bookingPeriod}</td>
                <td className="td-actions">
                  <button className="page-details-link" type="button">
                    Details
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
              value={effectiveRowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {rowsPerPageOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="page-footer-center">
            {from}-{to} of {allBookingsCount}
          </div>

          <div className="pagination">
            <button
              className={`page-btn ${page === 1 ? "page-btn--disabled" : ""}`}
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>

            {pageItems.map((item, idx) =>
              item === "ellipsis" ? (
                <span key={`e-${idx}`} className="page-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  className={`page-number ${
                    page === item ? "offices-page-number--active" : ""
                  }`}
                  type="button"
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ),
            )}
            <button
              className={`page-btn ${
                page === totalPages ? "page-btn--disabled" : ""
              }`}
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
