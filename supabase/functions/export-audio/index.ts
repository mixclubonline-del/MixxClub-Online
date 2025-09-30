import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  tracks: Array<{
    id: string;
    name: string;
    regions: Array<{
      id: string;
      audioData: number[];
      start: number;
      end: number;
      gain: number;
    }>;
    effects: { [key: string]: any };
    volume: number;
    mute: boolean;
    solo: boolean;
  }>;
  format: 'wav' | 'mp3' | 'stems' | 'project';
  quality: 'low' | 'medium' | 'high';
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
  masterVolume: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const exportData: ExportRequest = await req.json();
    
    console.log(`Exporting project in ${exportData.format} format`);
    
    // Process export based on format
    let result;
    
    switch (exportData.format) {
      case 'wav':
      case 'mp3':
        result = await exportMixdown(exportData);
        break;
      case 'stems':
        result = await exportStems(exportData);
        break;
      case 'project':
        result = await exportProject(exportData);
        break;
      default:
        throw new Error(`Unsupported export format: ${exportData.format}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Export Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Export failed',
      timestamp: Date.now()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function exportMixdown(exportData: ExportRequest) {
  console.log('Creating mixdown...');
  
  // Calculate final mix length
  const maxLength = exportData.tracks.reduce((max, track) => {
    const trackLength = track.regions.reduce((tMax, region) => 
      Math.max(tMax, region.end), 0);
    return Math.max(max, trackLength);
  }, 0);
  
  const sampleLength = Math.ceil(maxLength * exportData.sampleRate);
  const mixBuffer = new Float32Array(sampleLength);
  
  // Mix all tracks
  for (const track of exportData.tracks) {
    if (track.mute) continue;
    
    // Check if any track is soloed
    const hasSolo = exportData.tracks.some(t => t.solo);
    if (hasSolo && !track.solo) continue;
    
    // Process each region in the track
    for (const region of track.regions) {
      const startSample = Math.floor(region.start * exportData.sampleRate);
      const audioData = new Float32Array(region.audioData);
      
      // Apply region gain, track volume, and master volume
      const totalGain = region.gain * track.volume * exportData.masterVolume;
      
      // Mix into main buffer
      for (let i = 0; i < audioData.length && startSample + i < mixBuffer.length; i++) {
        mixBuffer[startSample + i] += audioData[i] * totalGain;
      }
    }
  }
  
  // Apply final limiting to prevent clipping
  const peak = Math.max(...Array.from(mixBuffer).map(Math.abs));
  if (peak > 0.95) {
    const limiterGain = 0.95 / peak;
    for (let i = 0; i < mixBuffer.length; i++) {
      mixBuffer[i] *= limiterGain;
    }
  }
  
  // Create audio file data (simulated)
  const audioBlob = createAudioBlob(mixBuffer, exportData);
  
  return {
    success: true,
    format: exportData.format,
    fileSize: audioBlob.length,
    duration: maxLength,
    sampleRate: exportData.sampleRate,
    bitDepth: exportData.bitDepth,
    downloadUrl: `data:audio/${exportData.format};base64,${audioBlob}`,
    metadata: {
      tracks: exportData.tracks.length,
      effects: exportData.tracks.reduce((total, track) => 
        total + Object.keys(track.effects).length, 0),
      quality: exportData.quality,
      exportTime: Date.now()
    }
  };
}

async function exportStems(exportData: ExportRequest) {
  console.log('Creating stem exports...');
  
  const stems = [];
  
  for (const track of exportData.tracks) {
    const maxLength = track.regions.reduce((max, region) => 
      Math.max(max, region.end), 0);
    const sampleLength = Math.ceil(maxLength * exportData.sampleRate);
    const stemBuffer = new Float32Array(sampleLength);
    
    // Process each region in the track
    for (const region of track.regions) {
      const startSample = Math.floor(region.start * exportData.sampleRate);
      const audioData = new Float32Array(region.audioData);
      
      // Apply region gain and track volume
      const totalGain = region.gain * track.volume;
      
      for (let i = 0; i < audioData.length && startSample + i < stemBuffer.length; i++) {
        stemBuffer[startSample + i] += audioData[i] * totalGain;
      }
    }
    
    const stemBlob = createAudioBlob(stemBuffer, exportData);
    
    stems.push({
      trackId: track.id,
      trackName: track.name,
      fileSize: stemBlob.length,
      duration: maxLength,
      downloadUrl: `data:audio/${exportData.format};base64,${stemBlob}`,
      effects: Object.keys(track.effects)
    });
  }
  
  return {
    success: true,
    format: 'stems',
    stems,
    totalTracks: stems.length,
    sampleRate: exportData.sampleRate,
    bitDepth: exportData.bitDepth,
    exportTime: Date.now()
  };
}

async function exportProject(exportData: ExportRequest) {
  console.log('Creating project export...');
  
  // Create project file structure
  const projectData = {
    version: '1.0.0',
    created: Date.now(),
    sampleRate: exportData.sampleRate,
    bitDepth: exportData.bitDepth,
    masterVolume: exportData.masterVolume,
    tracks: exportData.tracks.map(track => ({
      ...track,
      // Convert audio data to base64 for storage
      regions: track.regions.map(region => ({
        ...region,
        audioData: btoa(String.fromCharCode(...new Uint8Array(
          new Float32Array(region.audioData).buffer
        )))
      }))
    })),
    metadata: {
      application: 'Hybrid AI DAW',
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    }
  };
  
  const projectJson = JSON.stringify(projectData, null, 2);
  const projectBlob = btoa(projectJson);
  
  return {
    success: true,
    format: 'project',
    fileSize: projectBlob.length,
    downloadUrl: `data:application/json;base64,${projectBlob}`,
    filename: `hybrid-daw-project-${Date.now()}.json`,
    tracks: exportData.tracks.length,
    exportTime: Date.now()
  };
}

function createAudioBlob(audioBuffer: Float32Array, exportData: ExportRequest): string {
  // Create WAV file structure (simplified)
  const length = audioBuffer.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, exportData.sampleRate, true);
  view.setUint32(28, exportData.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  
  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, audioBuffer[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }
  
  // Convert to base64
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}