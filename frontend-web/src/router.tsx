import { createBrowserRouter } from "react-router";
import { AuthLayout } from "./authentication/AuthLayout";
import { LoginPage } from "./authentication/LoginPage";
import { MainPageLoggedOut } from "./authentication/MainPageLoggedOut";
import { AppLayout } from "./AppLayout";
import { MainPage } from "./MainPage";
import { PasswordRecoveryPage } from "./authentication/PasswordRecoveryPage";
import { PasswordRecoverySuccessPage } from "./authentication/PasswordRecoverySuccessPage";
import { PasswordChangePage } from "./authentication/PasswordChangePage";
import { PasswordChangeSuccessPage } from "./authentication/PasswordChangeSuccessPage";

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
    ],
  },
]);
