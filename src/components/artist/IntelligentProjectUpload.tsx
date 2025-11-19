import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Upload, FileAudio, X, Music, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface IntelligentProjectUploadProps {
  onUploadComplete?: (projectId: string) => void;
}

const MIXING_GOALS = [
  { id: 'radio_ready', label: 'Radio-ready loudness', description: 'Competitive streaming levels' },
  { id: 'punchy_low', label: 'Punchy low-end', description: '808s and bass hit hard' },
  { id: 'clear_vocals', label: 'Crystal-clear vocals', description: 'Vocal presence and clarity' },
  { id: 'vintage_warmth', label: 'Vintage analog warmth', description: 'Saturated, warm tone' },
  { id: 'wide_stereo', label: 'Wide stereo image', description: 'Spacious and immersive' },
  { id: 'tight_dynamics', label: 'Tight & controlled', description: 'Consistent dynamic range' },
];

export const IntelligentProjectUpload = ({ onUploadComplete }: IntelligentProjectUploadProps) => {
  const { user } = useAuth();
  const [projectTitle, setProjectTitle] = useState("");
  const [stems, setStems] = useState<File[]>([]);
  const [referenceTrack, setReferenceTrack] = useState<File | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['radio_ready', 'clear_vocals']);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      setStems([...stems, ...Array.from(e.dataTransfer.files)]);
    }
  }, [stems]);

  const handleStemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStems([...stems, ...Array.from(e.target.files)]);
    }
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReferenceTrack(e.target.files[0]);
    }
  };

  const removeStem = (index: number) => {
    setStems(stems.filter((_, i) => i !== index));
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSubmit = async () => {
    if (!projectTitle.trim() || stems.length === 0) {
      toast.error("Please add a project title and at least one stem");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: projectTitle,
          user_id: user?.id,
          status: 'pending',
          mixing_goals: selectedGoals,
          special_instructions: specialInstructions.trim() || null,
        })
        .select()
        .single();

      if (projectError) throw projectError;
      setUploadProgress(30);

      // Upload stems
      const totalFiles = stems.length + (referenceTrack ? 1 : 0);
      let uploadedFiles = 0;

      for (const stem of stems) {
        const fileName = `${project.id}/${stem.name}`;
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(fileName, stem);

        if (uploadError) throw uploadError;

        // Create audio file record
        const { error: audioError } = await supabase
          .from('audio_files')
          .insert({
            project_id: project.id,
            file_name: stem.name,
            file_path: fileName,
            file_size: stem.size,
            user_id: user?.id,
            uploaded_by: user?.id
          });

        if (audioError) throw audioError;

        uploadedFiles++;
        setUploadProgress(30 + (uploadedFiles / totalFiles) * 60);
      }

      // Upload reference track if provided
      if (referenceTrack) {
        const refFileName = `${project.id}/reference/${referenceTrack.name}`;
        const { error: refUploadError } = await supabase.storage
          .from('project-files')
          .upload(refFileName, referenceTrack);

        if (refUploadError) throw refUploadError;

        await supabase
          .from('audio_files')
          .insert({
            project_id: project.id,
            file_name: referenceTrack.name,
            file_path: refFileName,
            file_size: referenceTrack.size,
            user_id: user?.id,
            uploaded_by: user?.id
          });

        uploadedFiles++;
        setUploadProgress(30 + (uploadedFiles / totalFiles) * 60);
      }

      setUploadProgress(100);
      toast.success("Project uploaded successfully! We'll match you with the perfect engineer.");
      
      // Reset form
      setProjectTitle("");
      setStems([]);
      setReferenceTrack(null);
      setSelectedGoals(['radio_ready', 'clear_vocals']);
      setSpecialInstructions("");
      
      onUploadComplete?.(project.id);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload project. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          Upload Your Project
        </h3>
        <p className="text-sm text-muted-foreground">AI will help match you with the perfect engineer</p>
      </div>

      {/* Project Title */}
      <div>
        <label className="text-sm font-medium mb-2 block">Project Title</label>
        <Input
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="e.g., Summer Vibes - Final Mix"
          className="h-12"
        />
      </div>

      {/* Stems Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">Upload Stems</label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="audio/*,.wav,.mp3,.aiff,.flac"
            multiple
            onChange={handleStemChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {stems.length === 0 ? (
            <div className="space-y-2">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">Drag & Drop Stems Here</p>
              <p className="text-xs text-muted-foreground">or click to browse (WAV, MP3, AIFF, FLAC)</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium mb-3">{stems.length} stems uploaded</p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {stems.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-left">
                    <div className="flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-primary" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStem(index);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reference Track */}
      <div>
        <label className="text-sm font-medium mb-2 block">Reference Track (Optional)</label>
        <div className="relative">
          <input
            type="file"
            accept="audio/*,.wav,.mp3,.aiff,.flac"
            onChange={handleReferenceChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="border-2 border-dashed rounded-lg p-4 text-center border-muted-foreground/25 hover:border-primary/50 transition-colors">
            {referenceTrack ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  <span className="text-sm">{referenceTrack.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReferenceTrack(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Upload a song that inspires this mix</p>
            )}
          </div>
        </div>
      </div>

      {/* Mixing Goals */}
      <div>
        <label className="text-sm font-medium mb-3 block flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Mixing Goals (AI will analyze)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MIXING_GOALS.map(goal => (
            <div
              key={goal.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                selectedGoals.includes(goal.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => toggleGoal(goal.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedGoals.includes(goal.id)}
                  onCheckedChange={() => toggleGoal(goal.id)}
                />
                <div>
                  <p className="text-sm font-medium">{goal.label}</p>
                  <p className="text-xs text-muted-foreground">{goal.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Instructions */}
      <div>
        <label className="text-sm font-medium mb-2 block">Special Instructions</label>
        <Textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g., Keep the snare tight, but give the hi-hats some space. I want it to slap!"
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Tell the engineer what's important to you
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading project...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isUploading || !projectTitle.trim() || stems.length === 0}
        className="w-full"
        size="lg"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Submit to Engineer'}
      </Button>
    </Card>
  );
};