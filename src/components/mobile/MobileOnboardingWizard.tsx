import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Upload, Music, Zap } from 'lucide-react';

interface MobileOnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileOnboardingWizard = ({ open, onOpenChange }: MobileOnboardingWizardProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'service' | 'upload' | 'payment'>('welcome');
  const [projectTitle, setProjectTitle] = useState('');
  const [serviceType, setServiceType] = useState<'mix' | 'master' | 'ai-collab'>('mix');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive"
      });
      return;
    }

    if (!projectTitle || files.length === 0) {
      toast({
        title: "Missing information",
        description: "Please provide project title and files",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: projectTitle,
          client_id: user.id,
          service_type: serviceType,
          status: 'pending'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Upload files
      for (const file of files) {
        const filePath = `${user.id}/${project.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('audio-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create file record
        await supabase.from('audio_files').insert({
          project_id: project.id,
          uploaded_by: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type
        });
      }

      toast({
        title: "Upload successful!",
        description: "Your project has been created"
      });

      setStep('payment');
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setStep('welcome');
    setProjectTitle('');
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 'welcome' && '🎵 Welcome to MixClub'}
            {step === 'service' && '✨ Choose Your Service'}
            {step === 'upload' && '📤 Upload Your Files'}
            {step === 'payment' && '💳 Checkout'}
          </DialogTitle>
        </DialogHeader>

        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="space-y-6 py-4">
            <p className="text-muted-foreground text-center">
              Transform your tracks into modern hits with AI-enhanced mixing and professional engineers
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full h-14 text-lg" 
                onClick={() => setStep('service')}
              >
                <Music className="mr-2 h-5 w-5" />
                Start Your Project
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg"
                onClick={() => navigate('/engineer-onboarding')}
              >
                <Zap className="mr-2 h-5 w-5" />
                Join as Engineer
              </Button>
            </div>
          </div>
        )}

        {/* Service Selection Step */}
        {step === 'service' && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  serviceType === 'mix' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setServiceType('mix')}
              >
                <h3 className="font-semibold text-lg">🎚️ Mixing</h3>
                <p className="text-sm text-muted-foreground">Professional mixing services</p>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  serviceType === 'master' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setServiceType('master')}
              >
                <h3 className="font-semibold text-lg">🎼 Mastering</h3>
                <p className="text-sm text-muted-foreground">Final polish for your tracks</p>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  serviceType === 'ai-collab' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setServiceType('ai-collab')}
              >
                <h3 className="font-semibold text-lg">🤖 AI Collaboration</h3>
                <p className="text-sm text-muted-foreground">AI-powered music production</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep('upload')} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4 py-4">
            <Input
              placeholder="Project title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="h-12 text-base"
            />
            
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="audio/*,.zip"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {files.length > 0 
                    ? `${files.length} file(s) selected` 
                    : 'Tap to select audio files'}
                </p>
              </label>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('service')} 
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button 
                onClick={handleUpload} 
                className="flex-1"
                disabled={loading || !projectTitle || files.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload & Continue'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <div className="space-y-4 py-4">
            <div className="text-center py-6">
              <div className="mb-4 text-6xl">✅</div>
              <h3 className="text-xl font-semibold mb-2">Upload Complete!</h3>
              <p className="text-muted-foreground">
                Your files are ready for processing
              </p>
            </div>

            <Button 
              className="w-full h-12"
              onClick={resetWizard}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
