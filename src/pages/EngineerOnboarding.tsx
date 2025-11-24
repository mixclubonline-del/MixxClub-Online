import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EngineerOnboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/engineer-crm');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Feature Being Rebuilt</h1>
        <p className="text-muted-foreground">Redirecting to Engineer CRM...</p>
      </div>
    </div>
  );
}
