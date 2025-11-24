import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

export default function EngineerCRM() {
  return (
    <>
      <Helmet>
        <title>Engineer CRM — MIXXCLUB</title>
      </Helmet>
      <Navigate to="/engineer-crm?tab=dashboard" replace />
    </>
  );
}
