import React from "react";
import { Route } from "react-router-dom";

// MixClub City - lazy loaded as a bundle
const CityGates = React.lazy(() => import("@/pages/city/CityGates"));
const MixxTechTower = React.lazy(() => import("@/pages/city/MixxTechTower"));
const RSDChamber = React.lazy(() => import("@/pages/city/RSDChamber"));

export const cityRoutes = (
  <>
    <Route path="/city" element={<CityGates />} />
    <Route path="/city/tower" element={<MixxTechTower />} />
    <Route path="/city/studio" element={<RSDChamber />} />
  </>
);
