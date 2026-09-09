import { createBrowserRouter } from "react-router-dom";
import Shop from "./pages/Shop";
import EngagementTasksPage from "./pages/EngagementTasksPage.tsx";
import PioneerMapPage from "./pages/PioneerMapPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
]);

export default router;
