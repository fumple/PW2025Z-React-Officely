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
import { OfficesManagementPage } from "./application/OfficesManagementPage";
import { BookingsManagementPage } from "./application/BookingsManagementPage";
import { UsersManagementPage } from "./application/UsersManagementPage";
import { PaymentsOverviewPage } from "./application/PaymentsOverviewPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthLayout,
    children: [
      {
        index: true, //defines a component that is passed for this route where no additional part is defined
        Component: MainPageLoggedOut,
      },
      {
        path: "login",
        Component: LoginPage,
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
    path: "/app",
    Component: AppLayout,
    children: [
      {
        index: true, //defines a component that is passed for this route where no additional part is defined
        Component: MainPage,
      },
      {
        path: "offices",
        Component: OfficesManagementPage,
      },
      {
        path: "bookings",
        Component: BookingsManagementPage,
      },
      {
        path: "users",
        Component: UsersManagementPage,
      },
      {
        path: "payments",
        Component: PaymentsOverviewPage,
      },
    ],
  },
]);
