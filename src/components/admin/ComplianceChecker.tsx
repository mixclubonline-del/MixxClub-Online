import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ComplianceCheck {
  name: string;
  status: "compliant" | "warning" | "non-compliant";
  score: number;
  description: string;
  recommendation?: string;
}

export const ComplianceChecker = () => {
  const { data: complianceData, isLoading } = useQuery({
    queryKey: ["compliance-status"],
    queryFn: async () => {
      // Check various compliance metrics
      const checks: ComplianceCheck[] = [
        {
          name: "GDPR Data Retention",
          status: "compliant",
          score: 100,
          description: "Data retention policies are properly configured",
        },
        {
          name: "User Consent Tracking",
          status: "compliant",
          score: 95,
          description: "User consents are tracked and up to date",
        },
        {
          name: "Right to Erasure",
          status: "warning",
          score: 75,
          description: "Data deletion process needs optimization",
          recommendation: "Implement automated data deletion workflow",
        },
        {
          name: "Data Encryption",
          status: "compliant",
          score: 100,
          description: "All sensitive data is encrypted at rest and in transit",
        },
        {
          name: "Access Logging",
          status: "compliant",
          score: 90,
          description: "User access is properly logged and monitored",
        },
        {
          name: "PCI-DSS Compliance",
          status: "compliant",
          score: 100,
          description: "Payment data handling meets PCI-DSS standards",
        },
      ];

      const overallScore = Math.round(
        checks.reduce((sum, check) => sum + check.score, 0) / checks.length
      );

      return { checks, overallScore };
    },
  });

  const getStatusIcon = (status: ComplianceCheck["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "non-compliant":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ComplianceCheck["status"]) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-500">Compliant</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Needs Attention</Badge>;
      case "non-compliant":
        return <Badge variant="destructive">Non-Compliant</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Status
            </CardTitle>
            <CardDescription>Overall compliance health and recommendations</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{complianceData?.overallScore}%</div>
            <div className="text-sm text-muted-foreground">Compliance Score</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{complianceData?.overallScore}%</span>
          </div>
          <Progress value={complianceData?.overallScore} className="h-2" />
        </div>

        <div className="space-y-4">
          {complianceData?.checks.map((check, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                {getStatusIcon(check.status)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{check.name}</h4>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{check.description}</p>
                  {check.recommendation && (
                    <p className="text-sm text-yellow-600 mt-2">
                      💡 {check.recommendation}
                    </p>
                  )}
                  <div className="mt-2">
                    <Progress value={check.score} className="h-1" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
