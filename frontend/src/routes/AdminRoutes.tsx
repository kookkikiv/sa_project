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

const AdminRoutes = (isLoggedIn : boolean): RouteObject => {
  return {
    path: "/",
    element: isLoggedIn ? <FullLayout /> : <MainPages />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/admin",
        children: [
          {
            path: "/admin",
            element: <Admin />,
          },
          {
            path: "/admin/create",
            element: <CreateAdmin />,
          },
          {
            path: "/admin/edit/:id",
            element: <EditAdmin />,
          },
        ],
      },
       {
        path: "/accommodation",
        children: [
          {
            path: "/accommodation",
            element: <Accommodation />,
          },
          {
            path: "/accommodation/create",
            element: <CreateAccommodation />,
          },
          {
            path: "/accommodation/edit/:id",
            element: <EditAccommodation />,
          },
        ],
      },
    ],
  };
};

export default AdminRoutes;