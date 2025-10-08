import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportProgress {
  stage: 'idle' | 'uploading' | 'parsing' | 'validating' | 'complete' | 'error';
  progress: number;
  message: string;
  sessionId?: string;
}

interface MixxMasterImportProps {
  onImportComplete?: (sessionId: string) => void;
}

export function MixxMasterImport({ onImportComplete }: MixxMasterImportProps = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: 'idle',
    progress: 0,
    message: 'Select a .mixxmaster file to import'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.mixxmaster')) {
      toast.error('Please select a .mixxmaster file');
      return;
    }

    setFile(selectedFile);
    setProgress({
      stage: 'idle',
      progress: 0,
      message: `Ready to import: ${selectedFile.name}`
    });
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setProgress({ stage: 'uploading', progress: 10, message: 'Uploading file...' });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('session-packages')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setProgress({ stage: 'uploading', progress: 40, message: 'File uploaded successfully' });
      setProgress({ stage: 'parsing', progress: 50, message: 'Parsing session data...' });

      const { data: parseData, error: parseError } = await supabase.functions.invoke(
        'mixxmaster-parse',
        { body: { filePath } }
      );

      if (parseError) throw parseError;

      setProgress({ stage: 'parsing', progress: 70, message: 'Session parsed successfully' });
      setProgress({ stage: 'validating', progress: 80, message: 'Validating session...' });

      if (!parseData.sessionId) throw new Error('Invalid session data');

      setProgress({ stage: 'validating', progress: 90, message: 'Validation complete' });
      setProgress({
        stage: 'complete',
        progress: 100,
        message: 'Import complete!',
        sessionId: parseData.sessionId
      });

      onImportComplete?.(parseData.sessionId);
      toast.success('Session imported successfully');
    } catch (error: any) {
      console.error('Import error:', error);
      setProgress({
        stage: 'error',
        progress: 0,
        message: error.message || 'Import failed'
      });
      toast.error('Failed to import session');
    }
  };

  const getStageIcon = () => {
    switch (progress.stage) {
      case 'complete':
        return <FileCheck className="h-8 w-8 text-success" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-destructive" />;
      default:
        return <Upload className="h-8 w-8 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import MixxMaster Session</CardTitle>
        <CardDescription>
          Upload a .mixxmaster file to import and continue working on a session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
          {getStageIcon()}
        </div>

        <Input
          type="file"
          accept=".mixxmaster"
          onChange={handleFileChange}
          disabled={progress.stage === 'uploading' || progress.stage === 'parsing' || progress.stage === 'validating'}
        />

        {progress.progress > 0 && progress.stage !== 'idle' && (
          <div className="space-y-2">
            <Progress value={progress.progress} />
            <p className="text-sm text-muted-foreground text-center">
              {progress.message}
            </p>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || progress.stage === 'uploading' || progress.stage === 'parsing' || progress.stage === 'validating'}
          className="w-full"
        >
          {progress.stage === 'uploading' || progress.stage === 'parsing' || progress.stage === 'validating'
            ? 'Importing...'
            : 'Import Session'}
        </Button>

        {progress.stage === 'complete' && progress.sessionId && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = `/mixxmaster/session/${progress.sessionId}`}
          >
            Open Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
