import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Globe, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ThreatIntelligence = () => {
  const { data: threats, isLoading } = useQuery({
    queryKey: ["threat-intelligence"],
    queryFn: async () => {
      // Mock threat data
      return {
        suspiciousIPs: [
          { ip: "192.168.1.100", country: "Unknown", attempts: 45, lastSeen: new Date() },
          { ip: "10.0.0.55", country: "CN", attempts: 23, lastSeen: new Date(Date.now() - 3600000) },
        ],
        bruteForceAttempts: 68,
        sqlInjectionAttempts: 12,
        anomalies: 5,
        threatLevel: "medium",
      };
    },
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Threat Intelligence
        </CardTitle>
        <CardDescription>Real-time security threat monitoring and detection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="space-y-2">
              <Lock className="h-6 w-6 text-destructive" />
              <div className="text-2xl font-bold">{threats?.bruteForceAttempts}</div>
              <div className="text-sm text-muted-foreground">Brute Force</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div className="text-2xl font-bold">{threats?.sqlInjectionAttempts}</div>
              <div className="text-sm text-muted-foreground">SQL Injection</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Globe className="h-6 w-6 text-primary" />
              <div className="text-2xl font-bold">{threats?.suspiciousIPs.length}</div>
              <div className="text-sm text-muted-foreground">Suspicious IPs</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Shield className="h-6 w-6 text-green-500" />
              <div className="text-2xl font-bold">{threats?.anomalies}</div>
              <div className="text-sm text-muted-foreground">Anomalies</div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Threat Level</h3>
            <Badge
              variant={
                threats?.threatLevel === "high"
                  ? "destructive"
                  : threats?.threatLevel === "medium"
                  ? "secondary"
                  : "default"
              }
              className={threats?.threatLevel === "medium" ? "bg-yellow-500" : ""}
            >
              {threats?.threatLevel?.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            System is under moderate threat. Enhanced monitoring is active.
          </p>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold">Suspicious IP Addresses</h3>
          {threats?.suspiciousIPs.map((ip, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-mono font-medium">{ip.ip}</div>
                  <div className="text-sm text-muted-foreground">
                    {ip.attempts} failed attempts • Last seen: {ip.lastSeen.toLocaleTimeString()}
                  </div>
                </div>
                <Badge>{ip.country}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
