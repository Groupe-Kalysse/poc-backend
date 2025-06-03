import { createBrowserRouter } from "react-router";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import OpenLocker from "./pages/OpenLocker";
import ScanBadge from "./pages/ScanBadge";

 const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "/door/:id",
        Component: ScanBadge,
      },
      {
        path: "/badge/:id",
        Component: OpenLocker,
      },
      {
        path: "/",
        Component: Home,
      },
    ],
  },
]);
export default router