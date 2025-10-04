import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DeliverableUpload {
  file: File;
  deliveryType: 'rough_mix' | 'final_mix' | 'master' | 'stems_package' | 'revision';
  notes?: string;
}

export const useEngineerDeliverables = (projectId: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadMix = useCallback(async (upload: DeliverableUpload) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get existing deliverable count for version numbering
      const { data: existing } = await supabase
        .from('engineer_deliverables')
        .select('version_number')
        .eq('project_id', projectId)
        .eq('engineer_id', user.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const versionNumber = (existing?.version_number || 0) + 1;

      // Upload file to storage
      const fileName = `${user.id}/${projectId}/v${versionNumber}_${upload.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('engineer-deliverables')
        .upload(fileName, upload.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Create deliverable record
      const { data, error: dbError } = await supabase
        .from('engineer_deliverables')
        .insert({
          project_id: projectId,
          engineer_id: user.id,
          file_path: fileName,
          file_name: upload.file.name,
          file_size: upload.file.size,
          version_number: versionNumber,
          delivery_type: upload.deliveryType,
          notes: upload.notes,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);

      // Update project with latest deliverable
      await supabase
        .from('projects')
        .update({ latest_deliverable_id: data.id })
        .eq('id', projectId);

      toast({
        title: "Mix Uploaded Successfully",
        description: `Version ${versionNumber} submitted for review`,
      });

      return data;

    } catch (error) {
      console.error('Upload Mix Error:', error);
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });

      return null;

    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [projectId, toast]);

  const getDeliverables = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('engineer_deliverables')
        .select('*')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Get Deliverables Error:', error);
      return [];
    }
  }, [projectId]);

  const updateDeliveryStatus = useCallback(async (
    deliverableId: string,
    status: 'approved' | 'revision_requested'
  ) => {
    try {
      const { error } = await supabase
        .from('engineer_deliverables')
        .update({ 
          status,
          approved_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', deliverableId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? "Mix Approved" : "Revision Requested",
        description: status === 'approved' 
          ? "The mix has been approved"
          : "The artist has requested revisions",
      });

      return true;

    } catch (error) {
      console.error('Update Delivery Status Error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update delivery status",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    isUploading,
    uploadProgress,
    uploadMix,
    getDeliverables,
    updateDeliveryStatus
  };
};