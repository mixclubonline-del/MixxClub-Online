import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

// Redirect to unified Artist CRM portal
export default function Artist() {
  return (
    <>
      <Helmet>
        <title>Artist Portal — MIXXCLUB</title>
      </Helmet>
      <Navigate to="/artist-crm?tab=dashboard" replace />
    </>
  );
}
