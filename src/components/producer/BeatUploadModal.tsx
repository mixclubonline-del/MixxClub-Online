import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Music, FileAudio, Image, X, Check, 
  ChevronRight, ChevronLeft, Loader2, Save, Rocket
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useBeatUpload } from '@/hooks/useBeatUpload';
import { useProducerBeats, type CreateBeatInput } from '@/hooks/useProducerBeats';
import { PricingTierPresets, type PresetId } from './PricingTierPresets';

const GENRES = [
  'Hip Hop', 'Trap', 'R&B', 'Pop', 'Drill', 'Afrobeats', 
  'Lo-Fi', 'Boom Bap', 'Soul', 'Jazz', 'Electronic', 'Rock'
];

const KEY_SIGNATURES = [
  'C Major', 'C Minor', 'C# Major', 'C# Minor',
  'D Major', 'D Minor', 'D# Major', 'D# Minor',
  'E Major', 'E Minor',
  'F Major', 'F Minor', 'F# Major', 'F# Minor',
  'G Major', 'G Minor', 'G# Major', 'G# Minor',
  'A Major', 'A Minor', 'A# Major', 'A# Minor',
  'B Major', 'B Minor',
];

const MOODS = [
  'Dark', 'Energetic', 'Chill', 'Aggressive', 'Emotional',
  'Happy', 'Melancholic', 'Triumphant', 'Mysterious', 'Romantic'
];

const STEPS = ['Upload', 'Details', 'Pricing', 'Review'] as const;

interface BeatUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editBeat?: CreateBeatInput & { id?: string; audioUrl?: string; coverUrl?: string };
  mode?: 'create' | 'edit';
}

export function BeatUploadModal({ 
  open, 
  onOpenChange, 
  editBeat,
  mode = 'create' 
}: BeatUploadModalProps) {
  const [step, setStep] = useState(0);
  
  // Step 1: Files
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(editBeat?.audioUrl || '');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(editBeat?.coverUrl || '');
  
  // Step 2: Details
  const [title, setTitle] = useState(editBeat?.title || '');
  const [bpm, setBpm] = useState<string>(editBeat?.bpm?.toString() || '');
  const [keySignature, setKeySignature] = useState(editBeat?.key_signature || '');
  const [genre, setGenre] = useState(editBeat?.genre || '');
  const [description, setDescription] = useState(editBeat?.description || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(editBeat?.tags || []);
  const [moods, setMoods] = useState<string[]>(editBeat?.mood || []);
  
  // Step 3: Pricing
  const [selectedPreset, setSelectedPreset] = useState<PresetId | null>(null);
  const [leasePrice, setLeasePrice] = useState<string>(
    editBeat?.price_cents ? (editBeat.price_cents / 100).toFixed(2) : '29.99'
  );
  const [exclusivePrice, setExclusivePrice] = useState<string>(
    editBeat?.exclusive_price_cents ? (editBeat.exclusive_price_cents / 100).toFixed(2) : '299.00'
  );
  const [licenseType, setLicenseType] = useState<'lease' | 'exclusive' | 'both'>('both');
  
  const { uploadFiles, isUploading, progress } = useBeatUpload();
  const { createBeat, updateBeat, isCreating, isUpdating } = useProducerBeats();

  // Audio dropzone
  const onDropAudio = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setAudioFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps, isDragActive: isAudioDragActive } = useDropzone({
    onDrop: onDropAudio,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.m4a'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  // Cover dropzone
  const onDropCover = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    onDrop: onDropCover,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handlePresetSelect = (preset: { lease: number; exclusive: number; id: PresetId }) => {
    setSelectedPreset(preset.id);
    setLeasePrice((preset.lease / 100).toFixed(2));
    setExclusivePrice((preset.exclusive / 100).toFixed(2));
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const toggleMood = (mood: string) => {
    if (moods.includes(mood)) {
      setMoods(moods.filter(m => m !== mood));
    } else if (moods.length < 3) {
      setMoods([...moods, mood]);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return mode === 'edit' || audioFile !== null;
      case 1:
        return title.trim().length > 0;
      case 2:
        return parseFloat(leasePrice) > 0 || parseFloat(exclusivePrice) > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (saveAsDraft: boolean) => {
    try {
      // Upload files if new ones were selected
      let audioUrl = audioPreviewUrl;
      let coverUrl = coverPreviewUrl;

      if (audioFile || coverFile) {
        const result = await uploadFiles(audioFile, coverFile);
        if (result.audioUrl) audioUrl = result.audioUrl;
        if (result.coverUrl) coverUrl = result.coverUrl;
      }

      const beatData: CreateBeatInput = {
        title,
        bpm: bpm ? parseInt(bpm) : undefined,
        key_signature: keySignature || undefined,
        genre: genre || undefined,
        tags: tags.length > 0 ? tags : undefined,
        description: description || undefined,
        mood: moods.length > 0 ? moods : undefined,
        price_cents: Math.round(parseFloat(leasePrice) * 100),
        exclusive_price_cents: Math.round(parseFloat(exclusivePrice) * 100),
        license_type: licenseType,
      };

      if (mode === 'edit' && editBeat?.id) {
        await updateBeat({
          id: editBeat.id,
          ...beatData,
          audio_url: audioUrl || undefined,
          cover_image_url: coverUrl || undefined,
          status: saveAsDraft ? 'draft' : 'published',
        });
      } else {
        const newBeat = await createBeat(beatData);
        // Update with URLs in a second call
        if (newBeat && (audioUrl || coverUrl)) {
          await updateBeat({
            id: newBeat.id,
            audio_url: audioUrl || undefined,
            cover_image_url: coverUrl || undefined,
            status: saveAsDraft ? 'draft' : 'published',
          });
        }
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save beat:', error);
    }
  };

  const resetForm = () => {
    setStep(0);
    setAudioFile(null);
    setCoverFile(null);
    setAudioPreviewUrl('');
    setCoverPreviewUrl('');
    setTitle('');
    setBpm('');
    setKeySignature('');
    setGenre('');
    setDescription('');
    setTags([]);
    setMoods([]);
    setSelectedPreset(null);
    setLeasePrice('29.99');
    setExclusivePrice('299.00');
    setLicenseType('both');
  };

  const isLoading = isUploading || isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            {mode === 'edit' ? 'Edit Beat' : 'Upload New Beat'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update your beat details and pricing' : 'Add a new beat to your catalog'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4 py-2">
          {STEPS.map((stepName, i) => (
            <div key={stepName} className="flex items-center">
              <div 
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                  i <= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn(
                'ml-2 text-sm hidden sm:block',
                i <= step ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {stepName}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2 px-1">
            {audioFile && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Audio upload</span>
                  <span>{progress.audio}%</span>
                </div>
                <Progress value={progress.audio} className="h-1" />
              </div>
            )}
            {coverFile && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Cover upload</span>
                  <span>{progress.cover}%</span>
                </div>
                <Progress value={progress.cover} className="h-1" />
              </div>
            )}
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {/* Step 1: Upload */}
            {step === 0 && (
              <div className="space-y-6">
                {/* Audio Upload */}
                <div>
                  <Label className="mb-2 block">Audio File *</Label>
                  <div
                    {...getAudioRootProps()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                      isAudioDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
                      audioPreviewUrl && 'border-primary bg-primary/5'
                    )}
                  >
                    <input {...getAudioInputProps()} />
                    {audioPreviewUrl ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileAudio className="h-8 w-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">{audioFile?.name || 'Audio file selected'}</p>
                          <p className="text-sm text-muted-foreground">Click to replace</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="font-medium">Drop your beat here</p>
                        <p className="text-sm text-muted-foreground">MP3, WAV, FLAC, AAC up to 100MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Cover Upload */}
                <div>
                  <Label className="mb-2 block">Cover Image (Optional)</Label>
                  <div
                    {...getCoverRootProps()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                      isCoverDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                    )}
                  >
                    <input {...getCoverInputProps()} />
                    {coverPreviewUrl ? (
                      <div className="flex items-center justify-center gap-3">
                        <img 
                          src={coverPreviewUrl} 
                          alt="Cover preview" 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="text-left">
                          <p className="font-medium">{coverFile?.name || 'Cover selected'}</p>
                          <p className="text-sm text-muted-foreground">Click to replace</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Image className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="font-medium">Add cover art</p>
                        <p className="text-sm text-muted-foreground">JPG, PNG, WebP up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter beat title"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bpm">BPM</Label>
                    <Input
                      id="bpm"
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                      placeholder="120"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="key">Key Signature</Label>
                    <Select value={keySignature} onValueChange={setKeySignature}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select key" />
                      </SelectTrigger>
                      <SelectContent>
                        {KEY_SIGNATURES.map((key) => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Mood (up to 3)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MOODS.map((mood) => (
                      <Badge
                        key={mood}
                        variant={moods.includes(mood) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleMood(mood)}
                      >
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (up to 10)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your beat..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Quick Presets</Label>
                  <PricingTierPresets 
                    selectedPreset={selectedPreset}
                    onSelect={handlePresetSelect}
                  />
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  — or set custom prices —
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leasePrice">Lease Price ($)</Label>
                    <Input
                      id="leasePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={leasePrice}
                      onChange={(e) => {
                        setLeasePrice(e.target.value);
                        setSelectedPreset(null);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exclusivePrice">Exclusive Price ($)</Label>
                    <Input
                      id="exclusivePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={exclusivePrice}
                      onChange={(e) => {
                        setExclusivePrice(e.target.value);
                        setSelectedPreset(null);
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>License Options</Label>
                  <div className="flex gap-2 mt-2">
                    {(['lease', 'exclusive', 'both'] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={licenseType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLicenseType(type)}
                        className="capitalize"
                      >
                        {type === 'both' ? 'Both' : type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    {coverPreviewUrl ? (
                      <img 
                        src={coverPreviewUrl} 
                        alt="Cover" 
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Music className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{title || 'Untitled Beat'}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {bpm && <p>{bpm} BPM</p>}
                        {keySignature && <p>{keySignature}</p>}
                        {genre && <p>{genre}</p>}
                      </div>
                    </div>
                  </div>

                  {moods.length > 0 && (
                    <div className="flex gap-2">
                      {moods.map((mood) => (
                        <Badge key={mood} variant="secondary">{mood}</Badge>
                      ))}
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Lease</p>
                      <p className="font-bold">${leasePrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exclusive</p>
                      <p className="font-bold">${exclusivePrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">License</p>
                      <p className="font-medium capitalize">{licenseType}</p>
                    </div>
                  </div>
                </div>

                {description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{description}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => step > 0 ? setStep(step - 1) : onOpenChange(false)}
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex gap-2">
            {step === STEPS.length - 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                  Publish Now
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
