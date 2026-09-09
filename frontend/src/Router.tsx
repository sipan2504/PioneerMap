import { createBrowserRouter } from "react-router-dom";
import Shop from "./pages/Shop";
import EngagementTasksPage from "./pages/EngagementTasksPage.tsx";
import PioneerMapPage from "./pages/PioneerMapPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PioneerMapPage />,
  },
  {
    path: "/shop",
    element: <Shop />,
  },
  {
    path: "/engagement-tasks",
    element: <EngagementTasksPage />,
  },
]);

export default router;
