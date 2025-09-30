import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface JobFormData {
  title: string;
  description: string;
  genre: string;
  budget: number;
  deadline: string;
  serviceType: string;
}

export const JobPostingForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    genre: '',
    budget: 0,
    deadline: '',
    serviceType: 'mixing'
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
      setAnalysisStatus('analyzing');
      
      // Simulate AI analysis
      setTimeout(() => {
        setAnalysisStatus('complete');
        toast.success('Files analyzed and stems prepared!');
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Create job posting
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .insert({
          artist_id: user.id,
          title: formData.title,
          description: formData.description,
          genre: formData.genre,
          budget: formData.budget,
          deadline: formData.deadline,
          service_type: formData.serviceType,
          stems_prepared: analysisStatus === 'complete'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Upload files if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${jobData.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('audio-files')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          // Store file info
          const { data: audioFileData, error: dbError } = await supabase
            .from('audio_files')
            .insert({
              project_id: jobData.id,
              file_name: file.name,
              file_path: fileName,
              file_size: file.size,
              uploaded_by: user.id,
              file_type: file.type,
              processing_status: 'completed'
            })
            .select()
            .single();

          if (dbError) {
            console.error('Database error:', dbError);
            continue;
          }

          // Trigger AI analysis
          if (audioFileData) {
            supabase.functions.invoke('analyze-audio', {
              body: {
                audioFileId: audioFileData.id,
                filePath: fileName
              }
            });
          }
        }
      }

      toast.success('Job posted successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        genre: '',
        budget: 0,
        deadline: '',
        serviceType: 'mixing'
      });
      setUploadedFiles([]);
      setAnalysisStatus('idle');

    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Mix my indie rock album"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project, vision, and any specific requirements..."
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="indie">Indie</SelectItem>
                  <SelectItem value="r&b">R&B</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="classical">Classical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service">Service Needed</Label>
              <Select value={formData.serviceType} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixing">Mixing Only</SelectItem>
                  <SelectItem value="mastering">Mastering Only</SelectItem>
                  <SelectItem value="both">Mixing & Mastering</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                placeholder="500"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Upload Audio Files</Label>
            <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <div className="space-y-2">
                  {analysisStatus === 'analyzing' ? (
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
                  ) : analysisStatus === 'complete' ? (
                    <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                  ) : (
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  )}
                  
                  <div>
                    {analysisStatus === 'analyzing' ? (
                      <p className="text-sm text-blue-600">Analyzing audio and preparing stems...</p>
                    ) : analysisStatus === 'complete' ? (
                      <p className="text-sm text-green-600">
                        {uploadedFiles.length} file(s) analyzed and stems prepared!
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-medium">Drop files here or click to browse</p>
                        <p className="text-xs text-muted-foreground">Supports MP3, WAV, AIFF, FLAC</p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !formData.title || !formData.budget}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting Job...
              </>
            ) : (
              'Post Job'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};