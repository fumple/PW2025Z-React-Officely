import { MdArrowDropDown, MdFilterList } from "react-icons/md";
import { useMemo, useState } from "react";

const BASE_PAGE_SIZES = [10, 20, 50, 60] as const;

type PaymentRow = {
  id: string;
  reservationId: string;
  type: string;
  amount: string;
  status: string;
  creationDate: string; //DATE TYPE????
  dueDate: string; //DATE TYPE????
};

const allPayments: PaymentRow[] = Array.from({ length: 123 }).map(() => ({
  id: "Text line",
  reservationId: "Text line",
  type: "Text line",
  amount: "Text line",
  status: "Text line",
  creationDate: "Text line",
  dueDate: "Text line",
}));
const allPaymentsCount: number = allPayments.length;

export const PaymentsOverviewPage = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalCount = allPayments.length;

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
  const pagedPayments = useMemo(() => {
    const start = (currentPage - 1) * effectiveRowsPerPage;
    const end = start + effectiveRowsPerPage;
    return allPayments.slice(start, end);
  }, [currentPage, effectiveRowsPerPage]);

  const from =
    allPaymentsCount === 0 ? 0 : (page - 1) * effectiveRowsPerPage + 1;
  const to = Math.min(page * effectiveRowsPerPage, allPaymentsCount);

  const pageItems: Array<number | "ellipsis"> =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [1, 2, 3, "ellipsis", totalPages - 1, totalPages];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
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
                  <span>Reservation ID</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Type</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Amount</span>
                  <span className="th-icons">
                    <MdArrowDropDown size={18} />
                    <MdFilterList size={16} />
                  </span>
                </div>
              </th>
              <th>
                <div className="th-inner">
                  <span>Status</span>
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
                  <span>Due date</span>
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
            {pagedPayments.map((r, idx) => (
              <tr key={idx}>
                <td>{r.id}</td>
                <td>{r.reservationId}</td>
                <td>{r.type}</td>
                <td>{r.amount}</td>
                <td>{r.status}</td>
                <td>{r.creationDate}</td>
                <td>{r.dueDate}</td>
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
            {from}-{to} of {allPaymentsCount}
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
