import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SeedingResults {
  profiles: number;
  engineerProfiles: number;
  producerBeats: number;
  sessions: number;
  reviews: number;
  follows: number;
  wallets: number;
  activities: number;
  achievements: number;
}

export function AdminSeedingPanel() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<SeedingResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async () => {
    setIsSeeding(true);
    setError(null);
    setResults(null);

    try {
      toast.info('Starting demo data seeding...', { duration: 3000 });

      const { data, error: seedError } = await supabase.functions.invoke('seed-comprehensive-demo-data');

      if (seedError) throw seedError;

      if (data?.success) {
        setResults(data.results);
        toast.success('Demo data seeded successfully!', {
          description: `Created ${data.results.profiles} profiles, ${data.results.sessions} sessions, and more.`
        });
      } else {
        throw new Error(data?.error || 'Seeding failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to seed demo data';
      setError(message);
      toast.error('Seeding failed', { description: message });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Demo Data Seeding
        </CardTitle>
        <CardDescription>
          Populate the platform with realistic demo data to make dashboards feel alive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">100 Profiles</Badge>
          <Badge variant="outline">50 Engineers</Badge>
          <Badge variant="outline">40 Beats</Badge>
          <Badge variant="outline">25 Sessions</Badge>
          <Badge variant="outline">100+ Reviews</Badge>
          <Badge variant="outline">200+ Follows</Badge>
        </div>

        <Button 
          onClick={handleSeedData} 
          disabled={isSeeding}
          className="w-full"
        >
          {isSeeding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Seeding Demo Data...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Seed Demo Data
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {results && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Seeding Complete!
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Profiles</span>
                <Badge variant="secondary">{results.profiles}</Badge>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Engineers</span>
                <Badge variant="secondary">{results.engineerProfiles}</Badge>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Beats</span>
                <Badge variant="secondary">{results.producerBeats}</Badge>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Sessions</span>
                <Badge variant="secondary">{results.sessions}</Badge>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Reviews</span>
                <Badge variant="secondary">{results.reviews}</Badge>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Follows</span>
                <Badge variant="secondary">{results.follows}</Badge>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Wallets</span>
                <Badge variant="secondary">{results.wallets}</Badge>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span>Activities</span>
                <Badge variant="secondary">{results.activities}</Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
