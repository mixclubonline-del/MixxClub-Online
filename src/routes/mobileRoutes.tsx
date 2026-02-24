import { Route } from "react-router-dom";
import { ROUTES } from "@/config/routes";

// Mobile-specific pages
import MobileHome from "@/pages/MobileHome";
import MobileLanding from "@/pages/MobileLanding";
import MobileMixxBot from "@/pages/MobileMixxBot";

export const mobileRoutes = (
  <>
    <Route path={ROUTES.MOBILE_HOME} element={<MobileHome />} />
    <Route path={ROUTES.MOBILE_LANDING} element={<MobileLanding />} />
    <Route path={ROUTES.MOBILE_MIXXBOT} element={<MobileMixxBot />} />
  </>
);
