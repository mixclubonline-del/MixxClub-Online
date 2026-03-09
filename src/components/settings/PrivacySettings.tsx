import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Download, Trash2, Shield } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PrivacyPrefs {
  profile_visibility: string;
  show_email: boolean;
  show_location: boolean;
  show_earnings: boolean;
}

export function PrivacySettings() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<PrivacyPrefs>({
    profile_visibility: 'public',
    show_email: false,
    show_location: true,
    show_earnings: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('profile_visibility, show_email, show_location, show_earnings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPrefs({
          profile_visibility: data.profile_visibility ?? 'public',
          show_email: data.show_email ?? false,
          show_location: data.show_location ?? true,
          show_earnings: data.show_earnings ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePref = async (key: keyof PrivacyPrefs, value: any) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...newPrefs,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({ title: 'Privacy settings saved' });
    } catch (error: any) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile,
        projects,
        achievements,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mixxclub-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Data exported',
        description: 'Your data has been downloaded as a JSON file',
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast({
      title: 'Account deletion requested',
      description: 'Please contact support at support@mixxclub.com to complete account deletion',
    });
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading privacy settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Visibility</h3>
        <RadioGroup
          value={prefs.profile_visibility}
          onValueChange={(value) => updatePref('profile_visibility', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="public" id="vis-public" />
            <Label htmlFor="vis-public" className="cursor-pointer">
              <div>
                <span className="font-medium">Public</span>
                <p className="text-sm text-muted-foreground">Anyone can find and view your profile</p>
              </div>
            </Label>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="community" id="vis-community" />
            <Label htmlFor="vis-community" className="cursor-pointer">
              <div>
                <span className="font-medium">Community Only</span>
                <p className="text-sm text-muted-foreground">Only Mixx Club members can view your profile</p>
              </div>
            </Label>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="private" id="vis-private" />
            <Label htmlFor="vis-private" className="cursor-pointer">
              <div>
                <span className="font-medium">Private</span>
                <p className="text-sm text-muted-foreground">Only people you follow can view your profile</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Information Visibility</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-email" className="font-medium">Show Email Address</Label>
              <p className="text-sm text-muted-foreground">Display your email on your public profile</p>
            </div>
            <Switch
              id="show-email"
              checked={prefs.show_email}
              onCheckedChange={(checked) => updatePref('show_email', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-location" className="font-medium">Show Location</Label>
              <p className="text-sm text-muted-foreground">Display your city/region on your profile</p>
            </div>
            <Switch
              id="show-location"
              checked={prefs.show_location}
              onCheckedChange={(checked) => updatePref('show_location', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-earnings" className="font-medium">Show Earnings</Label>
              <p className="text-sm text-muted-foreground">Display your earnings on your engineer profile</p>
            </div>
            <Switch
              id="show-earnings"
              checked={prefs.show_earnings}
              onCheckedChange={(checked) => updatePref('show_earnings', checked)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Data</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Your Data</p>
              <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
            </div>
            <Button variant="outline" onClick={handleExportData} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Download'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently remove your account and all data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your projects, sessions, reviews, and profile data will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
                    Yes, Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </div>
  );
}
