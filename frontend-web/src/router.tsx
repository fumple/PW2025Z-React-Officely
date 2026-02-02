import { createBrowserRouter } from "react-router";
import { AuthLayout } from "./authentication/AuthLayout";
import { LoginPage } from "./authentication/LoginPage";
import { MainPageLoggedOut } from "./authentication/MainPageLoggedOut";
import { AppLayout } from "./application/AppLayout";
import { MainPage } from "./application/MainPage";
import { PasswordRecoveryPage } from "./authentication/PasswordRecoveryPage";
import { PasswordRecoverySuccessPage } from "./authentication/PasswordRecoverySuccessPage";
import { PasswordChangePage } from "./authentication/PasswordChangePage";
import { PasswordChangeSuccessPage } from "./authentication/PasswordChangeSuccessPage";
import { OfficesManagementPage } from "./application/office-pages/OfficesManagementPage";
import { BookingsManagementPage } from "./application/booking-pages/BookingsManagementPage";
import { OfficeCreatePage } from "./application/office-pages/OfficeCreatePage";
import { OfficeDetailsPage } from "./application/office-pages/OfficeDetailsPage";
import { OfficeEditPage } from "./application/office-pages/OfficeEditPage";
import { BookingDetailsPage } from "./application/booking-pages/BookingDetailsPage";
import { UserDetailsPage } from "./application/office-pages/employee-and-user-pages/UserDetailsPage";
import { ItemDetailsPage } from "./application/office-pages/item-pages/ItemDetailsPage";
import { ItemEditPage } from "./application/office-pages/item-pages/ItemEditPage";
import { OfferDetailsPage } from "./application/office-pages/offer-pages/OfferDetailsPage";
import { OfferEditPage } from "./application/office-pages/offer-pages/OfferEditPage";
import { OfferCreatePage } from "./application/office-pages/offer-pages/OfferCreatePage";
import { ItemCreatePage } from "./application/office-pages/item-pages/ItemCreatePage";
import { EmployeeDetailsPage } from "./application/office-pages/employee-and-user-pages/EmployeeDetailsPage";
import { SignupPage } from "./authentication/SignupPage";
import { RequireAuth } from "./authentication/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthLayout,
    children: [
      {
        index: true,
        Component: MainPageLoggedOut,
      },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "signup",
        Component: SignupPage,
      },
      {
        path: "password-recovery",
        Component: PasswordRecoveryPage,
      },
      {
        path: "password-recovery/success",
        Component: PasswordRecoverySuccessPage,
      },
      {
        path: "password-change",
        Component: PasswordChangePage,
      },
      {
        path: "password-change/success",
        Component: PasswordChangeSuccessPage,
      },
    ],
  },
  {
    Component: RequireAuth,
    children: [
      {
        path: "/app",
        Component: AppLayout,
        children: [
          {
            index: true,
            Component: MainPage,
          },
          {
            path: "offices",
            children: [
              {
                index: true,
                Component: OfficesManagementPage,
              },
              {
                path: "new",
                Component: OfficeCreatePage,
              },
              {
                path: ":officeId",
                children: [
                  {
                    index: true,
                    Component: OfficeDetailsPage,
                  },
                  {
                    path: "item/:itemId",
                    Component: ItemDetailsPage,
                  },
                  {
                    path: "item/:itemId/edit",
                    Component: ItemEditPage,
                  },
                  {
                    path: "item/new",
                    Component: ItemCreatePage,
                  },
                  {
                    path: "offer/:offerId",
                    Component: OfferDetailsPage,
                  },
                  {
                    path: "offer/:offerId/edit",
                    Component: OfferEditPage,
                  },
                  {
                    path: "offer/new",
                    Component: OfferCreatePage,
                  },
                  {
                    path: "employee/:employeeId",
                    Component: EmployeeDetailsPage,
                  },
                  {
                    path: "user/:userId",
                    Component: UserDetailsPage,
                  },
                ],
              },
              {
                path: ":officeId/edit",
                Component: OfficeEditPage,
              },
            ],
          },
          {
            path: "bookings",
            children: [
              {
                index: true,
                Component: BookingsManagementPage,
              },
              {
                path: ":bookingId",
                Component: BookingDetailsPage,
              },
            ],
          },
        ],
      },
    ],
  },
]);
