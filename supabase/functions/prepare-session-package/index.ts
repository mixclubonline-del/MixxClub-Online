import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PrepareSessionRequest {
  projectId: string;
  dawFormat: 'pro_tools' | 'logic' | 'ableton' | 'reaper' | 'studio_one';
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { projectId, dawFormat, sampleRate, bitDepth } = await req.json() as PrepareSessionRequest;

    // Get project details
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*, audio_files(*)')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found');
    }

    // Verify user is the engineer
    if (project.engineer_id !== user.id) {
      throw new Error('Not authorized for this project');
    }

    // Create session package record
    const { data: sessionPackage, error: packageError } = await supabaseClient
      .from('session_packages')
      .insert({
        project_id: projectId,
        engineer_id: user.id,
        artist_id: project.client_id,
        package_status: 'preparing',
        daw_format: dawFormat,
        sample_rate: sampleRate,
        bit_depth: bitDepth,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single();

    if (packageError) {
      throw new Error('Failed to create session package');
    }

    // Classify and organize stems
    const audioFiles = project.audio_files || [];
    const stems = await Promise.all(
      audioFiles.map(async (file: any, index: number) => {
        // Get AI analysis if available
        const { data: aiProfile } = await supabaseClient
          .from('ai_audio_profiles')
          .select('*')
          .eq('audio_file_id', file.id)
          .single();

        // Classify stem type based on file name and AI data
        const stemType = classifyStem(file.file_name, aiProfile);
        const colorCode = getColorForStemType(stemType);

        // Create stem organization entry
        await supabaseClient
          .from('stem_organization')
          .insert({
            session_package_id: sessionPackage.id,
            audio_file_id: file.id,
            stem_name: formatStemName(file.file_name, stemType),
            stem_type: stemType,
            color_code: colorCode,
            track_order: index + 1,
            group_name: getStemGroup(stemType),
          });

        return {
          id: file.id,
          name: formatStemName(file.file_name, stemType),
          type: stemType,
          color: colorCode,
          path: file.file_path,
        };
      })
    );

    // Generate DAW project file content
    const projectFileContent = generateDAWProjectFile(
      dawFormat,
      stems,
      project.title,
      sampleRate,
      bitDepth
    );

    // Create README content
    const readmeContent = generateReadme(project, stems);

    // In a real implementation, you would:
    // 1. Download audio files from storage
    // 2. Create ZIP with organized stems, project file, and README
    // 3. Upload ZIP to session-packages bucket
    // For now, we'll simulate this with a mock URL

    const packageUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/session-packages/${user.id}/${sessionPackage.id}/package.zip`;

    // Update session package with URL and completion
    const { error: updateError } = await supabaseClient
      .from('session_packages')
      .update({
        package_status: 'ready',
        package_url: packageUrl,
        stem_count: stems.length,
        file_size: stems.length * 50 * 1024 * 1024, // Mock size
      })
      .eq('id', sessionPackage.id);

    if (updateError) {
      throw new Error('Failed to update package status');
    }

    return new Response(
      JSON.stringify({
        packageId: sessionPackage.id,
        downloadUrl: packageUrl,
        fileSize: stems.length * 50 * 1024 * 1024,
        stemCount: stems.length,
        expiresAt: sessionPackage.expires_at,
        status: 'ready',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error preparing session package:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
function classifyStem(fileName: string, aiProfile: any): string {
  const name = fileName.toLowerCase();
  
  if (name.includes('kick') || name.includes('bd')) return 'drums';
  if (name.includes('snare') || name.includes('sd')) return 'drums';
  if (name.includes('hat') || name.includes('hh')) return 'drums';
  if (name.includes('drum')) return 'drums';
  if (name.includes('bass') || name.includes('sub')) return 'bass';
  if (name.includes('vox') || name.includes('vocal') || name.includes('lead')) return 'vocals';
  if (name.includes('guitar') || name.includes('gtr')) return 'guitar';
  if (name.includes('key') || name.includes('piano') || name.includes('organ')) return 'keys';
  if (name.includes('synth') || name.includes('pad')) return 'synth';
  if (name.includes('fx') || name.includes('effect')) return 'fx';
  
  return 'other';
}

function getColorForStemType(stemType: string): string {
  const colors: { [key: string]: string } = {
    drums: '#FF5555',
    bass: '#5555FF',
    vocals: '#55FF55',
    guitar: '#FF9955',
    keys: '#9955FF',
    synth: '#55FFFF',
    fx: '#FFFF55',
    other: '#999999',
  };
  return colors[stemType] || colors.other;
}

function getStemGroup(stemType: string): string {
  const groups: { [key: string]: string } = {
    drums: 'Drums',
    bass: 'Bass',
    vocals: 'Vocals',
    guitar: 'Instruments',
    keys: 'Instruments',
    synth: 'Synths',
    fx: 'FX',
    other: 'Other',
  };
  return groups[stemType] || 'Other';
}

function formatStemName(fileName: string, stemType: string): string {
  const base = fileName.replace(/\.[^/.]+$/, '');
  const cleaned = base.replace(/[_-]/g, ' ').trim();
  return cleaned || `${stemType}_${Date.now()}`;
}

function generateDAWProjectFile(
  dawFormat: string,
  stems: any[],
  projectName: string,
  sampleRate: number,
  bitDepth: number
): string {
  switch (dawFormat) {
    case 'pro_tools':
      return generateProToolsSession(stems, projectName, sampleRate, bitDepth);
    case 'logic':
      return generateLogicProject(stems, projectName, sampleRate, bitDepth);
    case 'ableton':
      return generateAbletonProject(stems, projectName, sampleRate, bitDepth);
    case 'reaper':
      return generateReaperProject(stems, projectName, sampleRate, bitDepth);
    default:
      return '';
  }
}

function generateProToolsSession(stems: any[], name: string, sr: number, bd: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Session Name="${name}" SampleRate="${sr}" BitDepth="${bd}">
  <Tracks>
${stems.map((stem, i) => `    <Track Name="${stem.name}" Type="Audio" Color="${stem.color}" Index="${i + 1}">
      <Clip Source="stems/${stem.name}.wav" />
    </Track>`).join('\n')}
  </Tracks>
</Session>`;
}

function generateLogicProject(stems: any[], name: string, sr: number, bd: number): string {
  return `{
  "projectName": "${name}",
  "sampleRate": ${sr},
  "bitDepth": ${bd},
  "tracks": [
${stems.map((stem, i) => `    { "name": "${stem.name}", "type": "audio", "color": "${stem.color}", "file": "stems/${stem.name}.wav" }`).join(',\n')}
  ]
}`;
}

function generateAbletonProject(stems: any[], name: string, sr: number, bd: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Ableton Version="11" SampleRate="${sr}">
  <LiveSet>
    <Tracks>
${stems.map((stem, i) => `      <AudioTrack Id="${i}" Name="${stem.name}" Color="${stem.color}">
        <DeviceChain>
          <AudioClip File="stems/${stem.name}.wav" />
        </DeviceChain>
      </AudioTrack>`).join('\n')}
    </Tracks>
  </LiveSet>
</Ableton>`;
}

function generateReaperProject(stems: any[], name: string, sr: number, bd: number): string {
  return `<REAPER_PROJECT 0.1 "${name}" ${sr}
${stems.map((stem, i) => `  <TRACK
    NAME "${stem.name}"
    <ITEM
      <SOURCE WAVE
        FILE "stems/${stem.name}.wav"
      >
    >
  >`).join('\n')}
>`;
}

function generateReadme(project: any, stems: any[]): string {
  return `# ${project.title}

## Project Information
- Artist: ${project.client_id}
- Genre: ${project.metadata?.genre || 'N/A'}
- Status: ${project.status}

## Stems Included (${stems.length} files)
${stems.map((s: any) => `- ${s.name} (${s.type})`).join('\n')}

## Instructions
1. Open the project file in your DAW
2. All stems are organized in the /stems folder
3. Reference tracks (if any) are in the /references folder
4. When finished, export your mix and upload via Mixxclub

## Notes
${project.description || 'No additional notes'}

Generated: ${new Date().toISOString()}
`;
}