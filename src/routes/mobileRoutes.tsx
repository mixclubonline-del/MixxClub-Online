import { Route } from "react-router-dom";

// Mobile-specific pages
import MobileHome from "@/pages/MobileHome";
import MobileLanding from "@/pages/MobileLanding";
import MobileMixxBot from "@/pages/MobileMixxBot";

export const mobileRoutes = (
  <>
    <Route path="/mobile-home" element={<MobileHome />} />
    <Route path="/mobile-landing" element={<MobileLanding />} />
    <Route path="/mobile-mixxbot" element={<MobileMixxBot />} />
  </>
);
