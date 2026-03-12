import { Route } from "react-router-dom";
import { ROUTES } from "@/config/routes";

// Mobile-specific pages
import MobileLanding from "@/pages/MobileLanding";
import MobileMixxBot from "@/pages/MobileMixxBot";
import MobileProHome from "@/pages/MobileProHome";
import MobileFanHome from "@/pages/MobileFanHome";

export const mobileRoutes = (
  <>
    <Route path={ROUTES.MOBILE_LANDING} element={<MobileLanding />} />
    <Route path={ROUTES.MOBILE_MIXXBOT} element={<MobileMixxBot />} />
    <Route path={ROUTES.MOBILE_PRO} element={<MobileProHome />} />
    <Route path={ROUTES.MOBILE_FAN} element={<MobileFanHome />} />
  </>
);
