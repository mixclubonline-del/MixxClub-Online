import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stemSeparationSchema = z.object({
  audioUrl: z.string().url('Invalid audio URL'),
  stems: z.array(z.string()).min(1, 'At least one stem must be requested').max(10, 'Maximum 10 stems allowed'),
  model: z.enum(['htdemucs', 'htdemucs_ft', 'demucs', 'mdx_extra']).optional().default('htdemucs'),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { audioUrl, stems, model } = stemSeparationSchema.parse(body);
    
    console.log(`Processing stem separation for: ${audioUrl}`);
    console.log(`Requested stems: ${stems.join(", ")}`);
    console.log(`Model: ${model}`);

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    
    // If Replicate API key is available, use real AI stem separation
    if (REPLICATE_API_KEY) {
      console.log('Using Replicate Demucs for real stem separation');
      
      // Start the prediction
      const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Demucs model on Replicate for high-quality stem separation
          version: 'cfa93589b89add8e2d9d7d6e2d49f42ab00f76e6a17f2dfe0aca59d1a63dc1a0',
          input: {
            audio: audioUrl,
            model: model,
            stems: stems.length === 4 ? 'all' : stems[0], // Demucs outputs vocals, drums, bass, other
            output_format: 'wav',
          },
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Replicate API error:', errorText);
        throw new Error(`Replicate API error: ${createResponse.status}`);
      }

      const prediction = await createResponse.json();
      console.log('Prediction started:', prediction.id);

      // Poll for completion (with timeout)
      const maxAttempts = 60; // 5 minutes max
      let attempts = 0;
      let result = prediction;

      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_KEY}`,
          },
        });
        
        result = await statusResponse.json();
        attempts++;
        console.log(`Poll attempt ${attempts}: ${result.status}`);
      }

      if (result.status === 'failed') {
        throw new Error(`Stem separation failed: ${result.error || 'Unknown error'}`);
      }

      if (result.status !== 'succeeded') {
        // Return pending status for long-running jobs
        return new Response(
          JSON.stringify({
            success: true,
            status: 'processing',
            predictionId: prediction.id,
            message: 'Stem separation in progress. Poll for status.',
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Process the output
      const output = result.output;
      const stemResults = [];

      // Demucs returns object with stem URLs
      if (typeof output === 'object' && output !== null) {
        for (const [stemType, url] of Object.entries(output)) {
          if (stems.includes(stemType) || stems.includes('all')) {
            stemResults.push({
              type: stemType,
              url: url,
              format: 'wav',
              sampleRate: 44100,
              channels: 2,
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          originalUrl: audioUrl,
          stems: stemResults,
          processingTime: result.metrics?.predict_time || 0,
          model: model,
          quality: 'high',
          predictionId: prediction.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: Simulated response when no API key
    console.log('No REPLICATE_API_KEY found, returning simulated response');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = {
      success: true,
      status: 'simulated',
      originalUrl: audioUrl,
      stems: stems.map((stem: string) => ({
        type: stem,
        url: `${audioUrl}_${stem}.wav`,
        duration: 180,
        channels: 2,
        sampleRate: 44100,
      })),
      processingTime: 2.0,
      model: model,
      quality: 'simulated',
      message: 'This is a simulated response. Configure REPLICATE_API_KEY for real AI stem separation.',
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Stem separation failed', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
