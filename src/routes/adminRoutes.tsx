import React from "react";
import { Route } from "react-router-dom";
import { AdminRoute } from "@/components/admin/AdminRoute";

// Single lazy-loaded admin bundle - ALL admin pages loaded together
const AdminBundle = React.lazy(() => import("./AdminBundle"));

// This creates a single chunk for all admin functionality
export const adminRoutes = (
  <Route path="/admin/*" element={<AdminRoute section="Admin"><AdminBundle /></AdminRoute>} />
);
