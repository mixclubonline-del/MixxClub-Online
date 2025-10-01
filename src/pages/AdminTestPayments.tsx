import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiPaymentModal } from '@/components/payment/MultiPaymentModal';
import { CreditCard } from 'lucide-react';

export default function AdminTestPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testData, setTestData] = useState({
    projectId: 'test-project-' + Date.now(),
    amount: 100,
    engineerSplitPercent: 70
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Payment System</h1>
          <p className="text-muted-foreground mt-2">Test all payment methods and receipt generation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
            <CardDescription>Configure test payment parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                value={testData.projectId}
                onChange={(e) => setTestData({ ...testData, projectId: e.target.value })}
                placeholder="test-project-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={testData.amount}
                onChange={(e) => setTestData({ ...testData, amount: parseFloat(e.target.value) })}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="split">Engineer Split (%)</Label>
              <Input
                id="split"
                type="number"
                value={testData.engineerSplitPercent}
                onChange={(e) => setTestData({ ...testData, engineerSplitPercent: parseFloat(e.target.value) })}
                placeholder="70"
                min="0"
                max="100"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold">Payment Breakdown:</p>
              <p className="text-sm">Total: ${testData.amount.toFixed(2)}</p>
              <p className="text-sm">Engineer Share ({testData.engineerSplitPercent}%): ${((testData.amount * testData.engineerSplitPercent) / 100).toFixed(2)}</p>
              <p className="text-sm">Platform Fee: ${(testData.amount - (testData.amount * testData.engineerSplitPercent) / 100).toFixed(2)}</p>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full"
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Open Payment Modal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Cards & Methods</CardTitle>
            <CardDescription>Use these for testing payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Stripe Test Cards:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Success: <code className="bg-muted px-2 py-1 rounded">4242 4242 4242 4242</code></li>
                <li>Requires 3D Secure: <code className="bg-muted px-2 py-1 rounded">4000 0027 6000 3184</code></li>
                <li>Declined: <code className="bg-muted px-2 py-1 rounded">4000 0000 0000 0002</code></li>
                <li>Any future expiry date, any CVC</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">PayPal:</h3>
              <p className="text-sm text-muted-foreground">Using test PayPal sandbox environment</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Apple Pay / Google Pay:</h3>
              <p className="text-sm text-muted-foreground">Available on supported devices and browsers</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Results</CardTitle>
            <CardDescription>What happens after successful payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✅ Payment intent created via Stripe</p>
            <p>✅ PDF receipt auto-downloaded to device</p>
            <p>✅ Email receipt sent via Resend</p>
            <p>✅ Payment recorded in database</p>
            <p>✅ Engineer earnings calculated (70/30 split)</p>
          </CardContent>
        </Card>
      </div>

      <MultiPaymentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        projectId={testData.projectId}
        amount={testData.amount}
        engineerSplitPercent={testData.engineerSplitPercent}
      />
    </AdminLayout>
  );
}
