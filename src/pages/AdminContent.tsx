import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileText, Save } from 'lucide-react';

export default function AdminContent() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [dataLoading, setDataLoading] = useState(false);

  // Content fields
  const [platformAnnouncement, setPlatformAnnouncement] = useState('');
  const [mixingDescription, setMixingDescription] = useState('');
  const [masteringDescription, setMasteringDescription] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
      loadContent();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user?.id });
    if (error || !data) {
      navigate('/');
    }
  };

  const loadContent = () => {
    // In a real implementation, this would load from a database table
    // For now, we'll use placeholder values
    setPlatformAnnouncement('Welcome to our music production platform!');
    setMixingDescription('Professional mixing services for all genres');
    setMasteringDescription('Industry-standard mastering for your tracks');
    setTermsOfService('Terms of Service content...');
    setPrivacyPolicy('Privacy Policy content...');
    setDataLoading(false);
  };

  const handleSaveAnnouncement = () => {
    toast.info('Content management requires database table setup');
    toast.success('Announcement saved to local state');
  };

  const handleSaveServiceDescriptions = () => {
    toast.info('Content management requires database table setup');
    toast.success('Service descriptions saved to local state');
  };

  const handleSavePolicies = () => {
    toast.info('Content management requires database table setup');
    toast.success('Policies saved to local state');
  };

  if (loading || dataLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage platform announcements, service descriptions, and policies
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Platform Announcement
            </CardTitle>
            <CardDescription>Display an announcement banner across the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement">Announcement Message</Label>
              <Textarea
                id="announcement"
                value={platformAnnouncement}
                onChange={(e) => setPlatformAnnouncement(e.target.value)}
                placeholder="Enter announcement message..."
                rows={3}
              />
            </div>
            <Button onClick={handleSaveAnnouncement}>
              <Save className="h-4 w-4 mr-2" />
              Save Announcement
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Descriptions</CardTitle>
            <CardDescription>Update marketing copy for services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mixing">Mixing Service Description</Label>
              <Textarea
                id="mixing"
                value={mixingDescription}
                onChange={(e) => setMixingDescription(e.target.value)}
                placeholder="Describe your mixing service..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mastering">Mastering Service Description</Label>
              <Textarea
                id="mastering"
                value={masteringDescription}
                onChange={(e) => setMasteringDescription(e.target.value)}
                placeholder="Describe your mastering service..."
                rows={4}
              />
            </div>

            <Button onClick={handleSaveServiceDescriptions}>
              <Save className="h-4 w-4 mr-2" />
              Save Descriptions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legal & Policies</CardTitle>
            <CardDescription>Manage terms of service and privacy policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="terms">Terms of Service</Label>
              <Textarea
                id="terms"
                value={termsOfService}
                onChange={(e) => setTermsOfService(e.target.value)}
                placeholder="Enter terms of service..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy Policy</Label>
              <Textarea
                id="privacy"
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                placeholder="Enter privacy policy..."
                rows={6}
              />
            </div>

            <Button onClick={handleSavePolicies}>
              <Save className="h-4 w-4 mr-2" />
              Save Policies
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-500">
              💡 Note: Full content management functionality requires a database table to store
              content. This interface provides the UI structure for managing platform content once
              the backend is set up.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
