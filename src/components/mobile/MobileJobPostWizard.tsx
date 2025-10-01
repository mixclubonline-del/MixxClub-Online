import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface MobileJobPostWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MobileJobPostWizard = ({ isOpen, onClose, onSuccess }: MobileJobPostWizardProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    service_type: 'mixing',
    budget: '',
    deadline: '',
  });

  const handleNext = () => {
    if (step === 1 && (!formData.title || !formData.genre)) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to post a job');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('job_postings').insert({
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        service_type: formData.service_type,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        deadline: formData.deadline || null,
        artist_id: user.id,
        status: 'open'
      });

      if (error) throw error;

      toast.success('Job posted successfully!');
      onSuccess();
      onClose();
      setStep(1);
      setFormData({
        title: '',
        description: '',
        genre: '',
        service_type: 'mixing',
        budget: '',
        deadline: '',
      });
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Job - Step {step} of 3</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Track Title *</Label>
                <Input
                  id="title"
                  placeholder="My Awesome Song"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre *</Label>
                <Input
                  id="genre"
                  placeholder="Hip Hop, Rock, etc."
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service Type</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixing">Mixing</SelectItem>
                    <SelectItem value="mastering">Mastering</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Take Photo</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Upload File</span>
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="500"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          
          <div className="flex-1" />

          {step < 3 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Check className="h-4 w-4 mr-1" />
              Post Job
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
