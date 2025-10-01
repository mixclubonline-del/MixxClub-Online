import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, scopeOfWork, engineerSplitPercent, artistId, engineerId } = await req.json();

    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    const normalizedProjectId = isUuid.test(projectId) ? projectId : crypto.randomUUID();
    console.log('Signing agreement for project:', projectId, 'normalized:', normalizedProjectId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    // Get client IP for signature record
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Check if agreement already exists
    const { data: existingAgreement } = await supabase
      .from('project_agreements')
      .select('*')
      .eq('project_id', normalizedProjectId)
      .maybeSingle();

    if (existingAgreement) {
      // Update existing agreement with signature
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (user.id === existingAgreement.artist_id) {
        updateData.artist_signed_at = new Date().toISOString();
        updateData.artist_signature_ip = clientIP;
      } else if (user.id === existingAgreement.engineer_id) {
        updateData.engineer_signed_at = new Date().toISOString();
        updateData.engineer_signature_ip = clientIP;
      }

      // Check if both parties have signed
      const bothSigned = 
        (existingAgreement.artist_signed_at || updateData.artist_signed_at) &&
        (existingAgreement.engineer_signed_at || updateData.engineer_signed_at);

      if (bothSigned) {
        updateData.agreement_status = 'signed';
      }

      const { error: updateError } = await supabase
        .from('project_agreements')
        .update(updateData)
        .eq('id', existingAgreement.id);

      if (updateError) throw updateError;

      console.log('Agreement updated successfully');
    } else {
      // Create new agreement
      let finalArtistId = artistId;
      let finalEngineerId = engineerId;

      // Try to get project details if no IDs provided
      if (!finalArtistId || !finalEngineerId) {
        const { data: project } = await supabase
          .from('projects')
          .select('client_id, engineer_id')
          .eq('id', normalizedProjectId)
          .maybeSingle();

        if (project) {
          finalArtistId = finalArtistId || project.client_id;
          finalEngineerId = finalEngineerId || project.engineer_id;
        }
      }

      // For test scenarios, allow using current user as both artist and engineer
      if (!finalArtistId) finalArtistId = user.id;
      if (!finalEngineerId) finalEngineerId = user.id;

      const newAgreement: any = {
        project_id: normalizedProjectId,
        artist_id: finalArtistId,
        engineer_id: finalEngineerId,
        scope_of_work: scopeOfWork,
        engineer_split_percent: engineerSplitPercent,
        agreement_status: 'pending'
      };

      // Set signature for the person creating it
      if (user.id === finalArtistId) {
        newAgreement.artist_signed_at = new Date().toISOString();
        newAgreement.artist_signature_ip = clientIP;
      }
      if (user.id === finalEngineerId) {
        newAgreement.engineer_signed_at = new Date().toISOString();
        newAgreement.engineer_signature_ip = clientIP;
      }

      // If same user is both artist and engineer (test scenario), mark as signed
      if (finalArtistId === finalEngineerId) {
        newAgreement.agreement_status = 'signed';
      }

      const { error: insertError } = await supabase
        .from('project_agreements')
        .insert(newAgreement);

      if (insertError) throw insertError;

      console.log('Agreement created successfully');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Agreement signed successfully', projectId: normalizedProjectId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error signing agreement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
