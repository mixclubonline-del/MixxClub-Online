import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stemSeparationSchema = z.object({
  audioUrl: z.string().url('Invalid audio URL'),
  stems: z.array(z.string()).min(1, 'At least one stem must be requested').max(10, 'Maximum 10 stems allowed')
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { audioUrl, stems } = stemSeparationSchema.parse(body);
    
    // In production, this would use Spleeter, Demucs, or similar AI models
    // For now, we'll simulate the process and return metadata
    
    console.log(`Processing stem separation for: ${audioUrl}`);
    console.log(`Requested stems: ${stems.join(", ")}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = {
      success: true,
      originalUrl: audioUrl,
      stems: stems.map((stem: string) => ({
        type: stem,
        url: `${audioUrl}_${stem}.wav`,
        duration: 180, // 3 minutes
        channels: 2,
        sampleRate: 44100
      })),
      processingTime: 2.0,
      model: "demucs-v4",
      quality: "high"
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Stem separation failed' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
