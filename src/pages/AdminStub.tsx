import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function AdminStub({ title }: { title: string }) {
  return (
    <AdminLayout title={title}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This admin feature is being rebuilt as part of the CRM reimagination.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
