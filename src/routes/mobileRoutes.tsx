import React from "react";
import { Route } from "react-router-dom";

// Mobile-specific pages
import MobileHome from "@/pages/MobileHome";
import MobileLanding from "@/pages/MobileLanding";
import MobileAdmin from "@/pages/MobileAdmin";
import MobileAdminPayouts from "@/pages/MobileAdminPayouts";
import MobileAdminUsers from "@/pages/MobileAdminUsers";
import MobileMixxBot from "@/pages/MobileMixxBot";

const MobileAdminBot = React.lazy(() => import("@/pages/MobileAdminBot"));

export const mobileRoutes = (
  <>
    <Route path="/mobile-home" element={<MobileHome />} />
    <Route path="/mobile-landing" element={<MobileLanding />} />
    <Route path="/mobile-admin" element={<MobileAdmin />} />
    <Route path="/mobile-mixxbot" element={<MobileMixxBot />} />
    <Route path="/mobile-admin/payouts" element={<MobileAdminPayouts />} />
    <Route path="/mobile-admin/users" element={<MobileAdminUsers />} />
    <Route path="/mobile-admin-bot" element={<MobileAdminBot />} />
  </>
);
