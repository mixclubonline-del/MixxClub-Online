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

async function testUpload() {
    const url = `${SUPABASE_URL}/storage/v1/object/brand-assets/test-${Date.now()}.txt`;
    console.log('Testing upload to', url);
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'apikey': SUPABASE_KEY,
            'Content-Type': 'text/plain'
        },
        body: 'test content'
    });
    console.log('Status:', resp.status);
    const text = await resp.text();
    console.log('Response:', text);
}

testUpload().catch(console.error);
