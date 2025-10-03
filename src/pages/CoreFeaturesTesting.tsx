import { AdminLayout } from "@/components/admin/AdminLayout";
import { MatchingAlgorithmTester } from "@/components/admin/MatchingAlgorithmTester";
import { RealtimeCollabTester } from "@/components/admin/RealtimeCollabTester";
import { PaymentFlowTester } from "@/components/admin/PaymentFlowTester";
import { DatabasePerformanceTester } from "@/components/admin/DatabasePerformanceTester";
import { TestTube2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CoreFeaturesTesting() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TestTube2 className="h-8 w-8" />
              Core Features Testing
            </h1>
            <p className="text-muted-foreground mt-2">
              Validate critical platform functionality before launch
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <MatchingAlgorithmTester />
          <RealtimeCollabTester />
          <PaymentFlowTester />
          <DatabasePerformanceTester />
        </div>

        <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border">
          <h3 className="font-bold text-lg mb-4">Testing Checklist</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Matching Algorithm</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ AI compatibility scores calculated</li>
                <li>✓ Genre, style, technical matching</li>
                <li>✓ Response time under 200ms</li>
                <li>✓ Match quality above 70%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Real-time Collaboration</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ WebSocket connections stable</li>
                <li>✓ Presence tracking working</li>
                <li>✓ Message broadcast under 100ms</li>
                <li>✓ Multi-user sync functional</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Payment Processing</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Stripe integration operational</li>
                <li>✓ Webhook processing working</li>
                <li>✓ Database updates confirmed</li>
                <li>✓ Receipt generation functional</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Database Performance</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ All queries under target time</li>
                <li>✓ Indexes properly configured</li>
                <li>✓ RLS policies not impacting speed</li>
                <li>✓ Connection pooling optimized</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <h4 className="font-semibold text-sm mb-2">Next Steps After Testing</h4>
          <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
            <li>Fix any failed or slow tests</li>
            <li>Optimize queries showing high latency</li>
            <li>Add error tracking for production monitoring</li>
            <li>Set up alerting for performance degradation</li>
            <li>Document any known limitations or edge cases</li>
            <li>Proceed to Phase 5: Revenue Features completion</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
}
