import React from "react";
import { Route } from "react-router-dom";

// MixClub City - lazy loaded as a bundle
const CityGates = React.lazy(() => import("@/pages/city/CityGates"));
const MixxTechTower = React.lazy(() => import("@/pages/city/MixxTechTower"));
const RSDChamber = React.lazy(() => import("@/pages/city/RSDChamber"));
const CreatorHub = React.lazy(() => import("@/pages/city/CreatorHub"));
const NeuralEngine = React.lazy(() => import("@/pages/city/NeuralEngine"));
const DataRealm = React.lazy(() => import("@/pages/city/DataRealm"));
const CommerceDistrict = React.lazy(() => import("@/pages/city/CommerceDistrict"));
const BroadcastTower = React.lazy(() => import("@/pages/city/BroadcastTower"));
const TheArena = React.lazy(() => import("@/pages/city/TheArena"));

export const cityRoutes = (
  <>
    <Route path="/city" element={<CityGates />} />
    <Route path="/city/tower" element={<MixxTechTower />} />
    <Route path="/city/studio" element={<RSDChamber />} />
    <Route path="/city/creator" element={<CreatorHub />} />
    <Route path="/city/prime" element={<NeuralEngine />} />
    <Route path="/city/analytics" element={<DataRealm />} />
    <Route path="/city/commerce" element={<CommerceDistrict />} />
    <Route path="/city/broadcast" element={<BroadcastTower />} />
    <Route path="/city/arena" element={<TheArena />} />
  </>
);
