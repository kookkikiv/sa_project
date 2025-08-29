import { lazy } from "react";
import { type RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
import FullLayout from "../layout/FullLayout";

const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));
const Dashboard = Loadable(lazy(() => import("../pages/dashboard")));
const Admin = Loadable(lazy(() => import("../pages/Admin")));
const CreateAdmin = Loadable(lazy(() => import("../pages/Admin/create")));
const EditAdmin = Loadable(lazy(() => import("../pages/Admin/edit")));
const Accommodation = Loadable(lazy(() => import("../pages/Accommodation")));
const CreateAccommodation = Loadable(lazy(() => import("../pages/Accommodation/create")));
const EditAccommodation = Loadable(lazy(() => import("../pages/Accommodation/edit")));

const AdminRoutes = (isLoggedIn: boolean): RouteObject => {
  return {
    path: "/",
    element: isLoggedIn ? <FullLayout /> : <MainPages />,
    children: [
      // default page for "/"
      { index: true, element: <Dashboard /> },

      {
        path: "admin",
        children: [
          { index: true, element: <Admin /> },              // "/admin"
          { path: "create", element: <CreateAdmin /> },     // "/admin/create"
          { path: "edit/:id", element: <EditAdmin /> },     // "/admin/edit/:id"
        ],
      },

      {
        path: "accommodation",
        children: [
          { index: true, element: <Accommodation /> },          // "/accommodation"
          { path: "create", element: <CreateAccommodation /> }, // "/accommodation/create"
          { path: "edit/:id", element: <EditAccommodation /> }, // "/accommodation/edit/:id"
        ],
      },
    ],
  };
};

export default AdminRoutes;
