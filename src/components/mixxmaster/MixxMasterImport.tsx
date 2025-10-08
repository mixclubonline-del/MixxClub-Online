import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MixxMasterValidator } from '@/lib/mixxmaster/validator';

interface MixxMasterImportProps {
  projectId?: string;
  onImportComplete?: (sessionId: string) => void;
}

export const MixxMasterImport = ({ projectId, onImportComplete }: MixxMasterImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [engineerSignature, setEngineerSignature] = useState('');
  const [changesSummary, setChangesSummary] = useState('');
  const [importing, setImporting] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationError, setValidationError] = useState<string>('');
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationStatus('validating');
    setValidationError('');

    try {
      const text = await selectedFile.text();
      const manifest = JSON.parse(text);

      // Validate manifest structure
      const isValid = MixxMasterValidator.validateManifest(manifest);
      
      if (isValid) {
        // Verify checksum
        const checksumValid = await MixxMasterValidator.verifyChecksum(
          manifest,
          manifest.checksum
        );

        if (checksumValid) {
          setValidationStatus('valid');
          toast({
            title: 'Validation Passed',
            description: 'MixxMaster file is valid and ready to import',
          });
        } else {
          setValidationStatus('invalid');
          setValidationError('Checksum verification failed - file may be corrupted');
          toast({
            title: 'Validation Failed',
            description: 'Checksum verification failed',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      setValidationStatus('invalid');
      setValidationError(error instanceof Error ? error.message : 'Invalid file format');
      toast({
        title: 'Validation Failed',
        description: 'Invalid MixxMaster file format',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleImport = async () => {
    if (!file || validationStatus !== 'valid') return;

    setImporting(true);
    try {
      const text = await file.text();
      const manifest = JSON.parse(text);

      // Import via edge function
      const { data, error } = await supabase.functions.invoke('mixxmaster-parse', {
        body: {
          session_id: manifest.sessionId,
          manifest,
          engineer_signature: engineerSignature,
          changes_summary: changesSummary || 'Imported from .mixxmaster file',
        },
      });

      if (error) throw error;

      toast({
        title: 'Import Successful',
        description: `Session imported as version ${data.version_number}`,
      });

      if (onImportComplete && data.session_id) {
        onImportComplete(data.session_id);
      }

      // Reset form
      setFile(null);
      setEngineerSignature('');
      setChangesSummary('');
      setValidationStatus('idle');
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import session',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import MixxMaster Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mixxmaster-file">Select .mixxmaster File</Label>
          <div className="flex gap-2">
            <Input
              id="mixxmaster-file"
              type="file"
              accept=".mixxmaster,.json"
              onChange={handleFileSelect}
              disabled={importing}
            />
            {validationStatus === 'validating' && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
            {validationStatus === 'valid' && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {validationStatus === 'invalid' && (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
        </div>

        {file && validationStatus === 'valid' && (
          <>
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="engineer-signature">Engineer Signature (Optional)</Label>
              <Input
                id="engineer-signature"
                placeholder="Your signature..."
                value={engineerSignature}
                onChange={(e) => setEngineerSignature(e.target.value)}
                disabled={importing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="changes-summary">Changes Summary</Label>
              <Textarea
                id="changes-summary"
                placeholder="Describe the changes in this version..."
                value={changesSummary}
                onChange={(e) => setChangesSummary(e.target.value)}
                disabled={importing}
                rows={3}
              />
            </div>

            <Button
              onClick={handleImport}
              disabled={importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Session
                </>
              )}
            </Button>
          </>
        )}

        {validationStatus === 'idle' && (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a .mixxmaster file to begin</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
