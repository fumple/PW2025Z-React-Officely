import { MdOutlineWarningAmber, MdLockOutline } from "react-icons/md";
import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { Modal } from "../Modal";

export const UserDetailsPage = () => {
  const [openCancelNoRefund, setOpenCancelNoRefund] = useState(false);
  const [openCancelWithRefund, setOpenCancelWithRefund] = useState(false);
  const navigate = useNavigate();

  const { userId } = useParams<{ userId: string }>();
  if (!userId) return null;

  const firstName = "Bob";
  const lastName = "React";

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="office-top">
          <div className="office-meta">
            <h1 className="page-title">
              User #{userId}: {firstName} {lastName}
            </h1>
            <label>Email:</label>
            <label>First Name: {firstName}</label>
            <label>Last Name: {lastName}</label>
            <label>Nationality: </label>
            <label>Date of Birth:</label>
            <label>Phone number:</label>

            <div className="office-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={() => navigate("/app/bookings")}
              >
                <span>View past bookings</span>
              </button>

              <button
                className="btn-primary"
                type="button"
                onClick={() => navigate("/app/bookings")}
              >
                <span>View active bookings</span>
              </button>

              <button
                className="btn-link-danger"
                type="button"
                onClick={() => setOpenCancelNoRefund(true)}
              >
                <MdOutlineWarningAmber />
                <span>Block from making new reservations</span>
              </button>

              <Modal
                open={openCancelNoRefund}
                title="Block from making new reservations"
                onClose={() => setOpenCancelNoRefund(false)}
              >
                <p>
                  Are you sure that you want to block this user from maing new
                  reservations?
                </p>
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
                <MdLockOutline />
                <span>Invalidate all sessions and require password change</span>
              </button>

              <Modal
                open={openCancelWithRefund}
                title="Invalidate user's sessions"
                onClose={() => setOpenCancelWithRefund(false)}
              >
                <p>
                  Are you sure that you want to invalidate all of this user's
                  sessions and require password change upon next login?
                </p>
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
      </div>
    </div>
  );
};
