import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

// Redirect to unified Engineer CRM portal
export default function Engineer() {
  return (
    <>
      <Helmet>
        <title>Engineer Portal — MIXXCLUB</title>
      </Helmet>
      <Navigate to="/engineer-crm?tab=dashboard" replace />
    </>
  );
}
