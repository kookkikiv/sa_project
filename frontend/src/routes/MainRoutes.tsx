import { lazy } from "react";
import { type RouteObject } from "react-router-dom";
import MinimalLayout from "../layout/MinimalLayout";
import Loadable from "../components/third-patry/Loadable";

const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));
const RegisterPages = Loadable(
  lazy(() => import("../pages/authentication/Register"))
);

const MainRoutes = (): RouteObject => {
  return {
    path: "/",
    element: <MinimalLayout />,
    children: [
      {
        index: true, // ใช้ index แทน path: "/"
        element: <MainPages />,
      },
      {
        path: "signup",
        element: <RegisterPages />,
      },
    ],
  };
};

export default MainRoutes;