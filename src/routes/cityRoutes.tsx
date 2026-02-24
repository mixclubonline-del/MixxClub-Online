import React from "react";
import { Route } from "react-router-dom";
import { ROUTES } from "@/config/routes";

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
    <Route path={ROUTES.CITY} element={<CityGates />} />
    <Route path={ROUTES.CITY_TOWER} element={<MixxTechTower />} />
    <Route path={ROUTES.CITY_STUDIO} element={<RSDChamber />} />
    <Route path={ROUTES.CITY_CREATOR} element={<CreatorHub />} />
    <Route path={ROUTES.CITY_PRIME} element={<NeuralEngine />} />
    <Route path={ROUTES.CITY_ANALYTICS} element={<DataRealm />} />
    <Route path={ROUTES.CITY_COMMERCE} element={<CommerceDistrict />} />
    <Route path={ROUTES.CITY_BROADCAST} element={<BroadcastTower />} />
    <Route path={ROUTES.CITY_ARENA} element={<TheArena />} />
  </>
);
