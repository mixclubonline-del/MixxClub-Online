import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

export default function ArtistCRM() {
  return (
    <>
      <Helmet>
        <title>Artist CRM — MIXXCLUB</title>
      </Helmet>
      <Navigate to="/artist-crm?tab=dashboard" replace />
    </>
  );
}
