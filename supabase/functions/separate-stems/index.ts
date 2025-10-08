import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { createLogger } from "../_shared/logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logger = createLogger('separate-stems');

interface SeparationRequest {
  audioFileId: string;
  filePath: string;
  tier: 'free_4stem' | 'credit_9stem';
  fileName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { audioFileId, filePath, tier, fileName }: SeparationRequest = await req.json();
    
    logger.info('Starting stem separation', { userId: user.id, tier, fileName });

    // Validate tier and check limits/credits
    if (tier === 'free_4stem') {
      const { data: canUse } = await supabase.rpc('check_free_tier_available', {
        p_user_id: user.id
      });
      
      if (!canUse) {
        return new Response(
          JSON.stringify({ 
            error: 'Free tier limit reached. You can do 1 free separation per day.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (tier === 'credit_9stem') {
      const { data: hasCredits } = await supabase.rpc('check_user_credits', {
        p_user_id: user.id,
        p_required_credits: 50
      });
      
      if (!hasCredits) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient credits. You need 50 credits for 9-stem separation.' 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create job record
    const stemsCount = tier === 'free_4stem' ? 4 : 9;
    const creditsUsed = tier === 'free_4stem' ? 0 : 50;

    const { data: job, error: jobError } = await supabase
      .from('stem_separation_jobs')
      .insert({
        user_id: user.id,
        audio_file_id: audioFileId,
        original_file_path: filePath,
        tier,
        stems_count: stemsCount,
        credits_used: creditsUsed,
        status: 'pending'
      })
      .select()
      .single();

    if (jobError) {
      logger.error('Failed to create job', jobError);
      throw jobError;
    }

    logger.info('Job created', { jobId: job.id });

    // Process in background
    processStemSeparation(
      job.id,
      user.id,
      filePath,
      fileName,
      tier,
      stemsCount,
      creditsUsed,
      supabase
    ).catch(err => {
      logger.error('Background processing failed', err);
    });

    return new Response(
      JSON.stringify({ 
        jobId: job.id,
        status: 'pending',
        message: 'Stem separation started' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Error in separate-stems', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processStemSeparation(
  jobId: string,
  userId: string,
  filePath: string,
  fileName: string,
  tier: 'free_4stem' | 'credit_9stem',
  stemsCount: number,
  creditsUsed: number,
  supabase: any
) {
  try {
    logger.info('Processing stem separation', { jobId, tier });

    // Update job status to processing
    await supabase
      .from('stem_separation_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString(),
        progress: 10
      })
      .eq('id', jobId);

    // Download audio file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('audio-files')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    logger.info('File downloaded', { jobId, size: fileData.size });

    // Update progress
    await supabase
      .from('stem_separation_jobs')
      .update({ progress: 30 })
      .eq('id', jobId);

    // Call the appropriate stem separation API
    const stemPaths = await separateStems(
      fileData,
      fileName,
      tier,
      stemsCount,
      userId,
      jobId,
      supabase
    );

    // Update job as completed
    await supabase
      .from('stem_separation_jobs')
      .update({
        status: 'completed',
        stem_paths: stemPaths,
        progress: 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Deduct credits or mark free tier used
    if (tier === 'free_4stem') {
      await supabase.rpc('use_free_tier', {
        p_user_id: userId,
        p_job_id: jobId
      });
    } else {
      await supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: creditsUsed,
        p_description: `9-stem separation: ${fileName}`,
        p_job_id: jobId
      });
    }

    logger.info('Stem separation completed', { jobId });

  } catch (error) {
    logger.error('Stem separation failed', { jobId, error });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await supabase
      .from('stem_separation_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

async function separateStems(
  audioFile: Blob,
  fileName: string,
  tier: 'free_4stem' | 'credit_9stem',
  stemsCount: number,
  userId: string,
  jobId: string,
  supabase: any
): Promise<any[]> {
  logger.info('Starting stem separation process', { tier, stemsCount });

  // Convert blob to buffer
  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = new Uint8Array(arrayBuffer);

  // For now, we'll use a mock API call
  // In production, you would integrate with:
  // - BS-RoFormer API for 9-stem
  // - HTDemucs v4 API for 4-stem
  
  const modelEndpoint = tier === 'free_4stem' 
    ? 'https://api.replicate.com/v1/predictions' // HTDemucs v4
    : 'https://api.replicate.com/v1/predictions'; // BS-RoFormer

  // Update progress
  await supabase
    .from('stem_separation_jobs')
    .update({ progress: 50 })
    .eq('id', jobId);

  // TODO: Implement actual API call to separation service
  // For now, simulate processing time
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Mock stem paths - in production these would be actual separated stems
  const stemNames = tier === 'free_4stem'
    ? ['vocals', 'drums', 'bass', 'other']
    : ['vocals', 'drums', 'bass', 'guitar', 'piano', 'synth', 'strings', 'brass', 'other'];

  const stemPaths = [];

  for (let i = 0; i < stemNames.length; i++) {
    const stemName = stemNames[i];
    const stemFileName = `${fileName.replace(/\.[^/.]+$/, '')}_${stemName}.wav`;
    const stemPath = `${userId}/${jobId}/${stemFileName}`;

    // In production, upload actual separated stem files
    // For now, we'll just create the path structure
    stemPaths.push({
      name: stemName,
      path: stemPath,
      displayName: stemName.charAt(0).toUpperCase() + stemName.slice(1)
    });

    // Update progress incrementally
    const progress = 50 + Math.floor((i + 1) / stemNames.length * 40);
    await supabase
      .from('stem_separation_jobs')
      .update({ progress })
      .eq('id', jobId);
  }

  logger.info('Stem separation complete', { stemsCount: stemPaths.length });

  return stemPaths;
}
