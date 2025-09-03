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
const Package = Loadable(lazy(() => import("../pages/Package")));
const CreatePackage = Loadable(lazy(() => import("../pages/Package/create")));
const EditPackage = Loadable(lazy(() => import("../pages/Package/edit")));
const Room = Loadable(lazy(() => import("../pages/Room")));
const CreateRoom = Loadable(lazy(() => import("../pages/Room/create")));
const EditRoom = Loadable(lazy(() => import("../pages/Room/edit")));
const Facility = Loadable(lazy(() => import("../pages/Room")));
const CreateFacility = Loadable(lazy(() => import("../pages/Room/create")));
const EditFacility = Loadable(lazy(() => import("../pages/Room/edit")));

const AdminRoutes = (isLoggedIn: boolean): RouteObject => {
  return {
    path: "/*", // Fixed: Added /* to prevent routing issues
    element: isLoggedIn ? <FullLayout /> : <MainPages />,
    children: [
      // default page for "/"
      { index: true, element: <Dashboard /> },

      {
        path: "admin/*", // Fixed: Added /*
        children: [
          { index: true, element: <Admin /> },              
          { path: "create", element: <CreateAdmin /> },     
          { path: "edit/:id", element: <EditAdmin /> },     
        ],
      },

      {
        path: "accommodation/*", // Fixed: Added /*
        children: [
          { index: true, element: <Accommodation /> },          
          { path: "create", element: <CreateAccommodation /> }, 
          { path: "edit/:id", element: <EditAccommodation /> }, 
        ],
      },

      {
        path: "package/*", // Added package routes
        children: [
          { index: true, element: <Package /> },          
          { path: "create", element: <CreatePackage /> }, 
          { path: "edit/:id", element: <EditPackage /> }, 
        ],
      },
      {
        path: "room/*", // Fixed: Added /*
        children: [
          { index: true, element: <Room /> },          
          { path: "create", element: <CreateRoom /> }, 
          { path: "edit/:id", element: <EditRoom /> }, 
        ],
      },
            {
        path: "facility/*", // Fixed: Added /*
        children: [
          { index: true, element: <Facility /> },          
          { path: "create", element: <CreateFacility /> }, 
          { path: "edit/:id", element: <EditFacility /> }, 
        ],
      },
    ],
  };
};

export default AdminRoutes;