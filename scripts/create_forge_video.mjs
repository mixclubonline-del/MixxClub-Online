import fs from 'fs';
import path from 'path';

// Load .env
const envPath = path.resolve('.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        env[key] = val;
    }
});

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_PUBLISHABLE_KEY'];

const jobs = [
    {
        name: 'jax',
        imagePath: 'src/assets/characters/jax_original.png',
        prompt: 'Cinematic slow-motion. The artist subtly bobs his head slightly to an unheard beat while performing into the condenser mic. Natural, intense facial expression. The neon purple and cyan lights outside the vocal booth window sequence chase patterns. Dust particles float lazily in the dramatic rim lighting. Hyper-detailed, 8k resolution.'
    },
    {
        name: 'rell',
        imagePath: 'src/assets/characters/rell_original.png',
        prompt: 'Dynamic, slightly sweeping cinematic camera angle panning right to left. The producer\'s shoulders move slightly as her fingers hover over the complex beat arrangement. The LED meters on the background analog synthesizers dance and flicker rhythmically. The UI on her computer monitor subtly updates. Cinematic lighting, cyberpunk aesthetic, photorealistic.'
    },
    {
        name: 'mixxtech_city',
        imagePath: 'src/assets/promo/mixxtech_city_hub.png',
        prompt: 'A sweeping, slow-motion aerial drone shot pushing forward into the futuristic mega-city at dusk. Flying cyberpunk vehicles zoom past the camera, leaving light trails. The giant MIXXCLUB neon sign flickers slightly. Heavy, atmospheric mist rolls through the lower brutalist architecture. Hyper-realistic, 8k resolution, vibrant purple and cyan color palette, cinematic matte painting style.'
    },
    {
        name: 'mixxos_flow_console',
        imagePath: 'src/assets/promo/mixxos_flow_console.png',
        prompt: 'Photorealistic macro video. The camera slowly pans across the futuristic studio mixing console. The holographic faders and meters glow and pulse with intense cyan and amber light. Subtle, natural hand movement adjusting a fader. Shallow depth of field with the background studio monitors beautifully blurred. Cinematic lighting.'
    }
];

async function generateVideo(job) {
    console.log(`\n=== Starting video generation for ${job.name} ===`);

    const imageAbsPath = path.resolve(job.imagePath);
    console.log(`Reading image: ${imageAbsPath}`);
    const base64Data = fs.readFileSync(imageAbsPath, 'base64');
    const dataUri = `data:image/png;base64,${base64Data}`;

    console.log('Sending request to generate-video edge function...');
    let startRes;
    try {
        startRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-video`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'image-to-video',
                prompt: job.prompt,
                imageUrl: dataUri
            })
        });
    } catch (e) {
        console.error('Fetch error:', e);
        return;
    }

    const startData = await startRes.json();
    if (!startRes.ok || !startData.success) {
        console.error('Failed to start prediction:', startData);
        return;
    }

    const predictionId = startData.predictionId;
    console.log(`Prediction started! ID: ${predictionId}`);

    let done = false;
    let videoUrl = null;

    while (!done) {
        console.log(`Polling status for ${predictionId}...`);
        await new Promise(resolve => setTimeout(resolve, 5000));

        let pollRes;
        try {
            pollRes = await fetch(`${SUPABASE_URL}/functions/v1/check-replicate-video`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'apikey': SUPABASE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ predictionId })
            });
        } catch (e) {
            console.error('Poll fetch error:', e);
            continue;
        }

        if (!pollRes.ok) {
            if (pollRes.status === 504) {
                console.log('Gateway timeout from edge function. Retrying in 5s...');
                continue;
            }
            console.error('Poll request failed:', pollRes.status, await pollRes.text());
            return;
        }

        const pollData = await pollRes.json();
        if (pollData.success && pollData.done) {
            console.log('Video generation complete!');
            videoUrl = pollData.videoUrl;
            done = true;
        } else if (pollData.success && !pollData.done) {
            console.log(`Status: ${pollData.status}... waiting.`);
        } else {
            console.error('Prediction failed or error in polling:', pollData);
            return;
        }
    }

    if (videoUrl) {
        console.log(`Downloading video from ${videoUrl}...`);
        const targetPath = path.resolve(`src/assets/videos/${job.name}_video.mp4`);
        const vidRes = await fetch(videoUrl);
        const buffer = await vidRes.arrayBuffer();
        fs.writeFileSync(targetPath, Buffer.from(buffer));
        console.log(`Saved video to ${targetPath}`);
    }
}

async function run() {
    for (const job of jobs) {
        await generateVideo(job);
    }
}

run().catch(console.error);
