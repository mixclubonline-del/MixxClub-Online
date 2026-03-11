import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND = {
  bg: "#0a0a0f",
  card: "#131320",
  accent: "#a855f7",
  accentAlt: "#ec4899",
  text: "#ffffff",
  muted: "#94a3b8",
  border: "rgba(255,255,255,0.08)",
};

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function waveformBars(count: number, seed: number): string {
  let bars = "";
  const barW = 8;
  const gap = 4;
  const startX = 60;
  const baseY = 540;
  for (let i = 0; i < count; i++) {
    const h = 30 + ((Math.sin(seed + i * 0.7) + 1) / 2) * 100;
    const x = startX + i * (barW + gap);
    bars += `<rect x="${x}" y="${baseY - h}" width="${barW}" height="${h}" rx="4" fill="url(#waveGrad)" opacity="${0.5 + ((i % 3) * 0.15)}"/>`;
  }
  return bars;
}

function renderBeatCard(beat: Record<string, any>): string {
  const title = escapeXml(truncate(beat.title || "Untitled Beat", 40));
  const producer = escapeXml(truncate(beat.producer_name || "Unknown Producer", 30));
  const bpm = beat.bpm || "—";
  const key = escapeXml(beat.key_signature || "—");
  const price = beat.price_cents ? `$${(beat.price_cents / 100).toFixed(0)}` : "Free";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND.bg}"/>
      <stop offset="100%" stop-color="#1a1a2e"/>
    </linearGradient>
    <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND.accent}"/>
      <stop offset="100%" stop-color="${BRAND.accentAlt}"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${BRAND.accent}"/>
      <stop offset="100%" stop-color="${BRAND.accentAlt}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#accentLine)"/>
  ${waveformBars(80, 42)}
  <rect x="40" y="40" width="1120" height="380" rx="24" fill="${BRAND.card}" opacity="0.85"/>
  <rect x="40" y="40" width="1120" height="380" rx="24" fill="none" stroke="${BRAND.border}" stroke-width="1"/>
  <circle cx="100" cy="120" r="36" fill="${BRAND.accent}" opacity="0.2"/>
  <text x="100" y="128" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="${BRAND.accent}">♪</text>
  <text x="155" y="115" font-family="system-ui,sans-serif" font-size="42" font-weight="700" fill="${BRAND.text}">${title}</text>
  <text x="155" y="155" font-family="system-ui,sans-serif" font-size="22" fill="${BRAND.muted}">by ${producer}</text>
  <line x1="60" y1="200" x2="1140" y2="200" stroke="${BRAND.border}" stroke-width="1"/>
  <text x="100" y="260" font-family="system-ui,sans-serif" font-size="16" fill="${BRAND.muted}">BPM</text>
  <text x="100" y="290" font-family="system-ui,sans-serif" font-size="28" font-weight="600" fill="${BRAND.text}">${bpm}</text>
  <text x="300" y="260" font-family="system-ui,sans-serif" font-size="16" fill="${BRAND.muted}">KEY</text>
  <text x="300" y="290" font-family="system-ui,sans-serif" font-size="28" font-weight="600" fill="${BRAND.text}">${key}</text>
  <rect x="850" y="240" width="260" height="64" rx="16" fill="url(#accentLine)"/>
  <text x="980" y="282" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="${BRAND.text}">${price}</text>
  <text x="60" y="600" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="${BRAND.accent}">MIXXCLUB</text>
  <text x="1140" y="600" text-anchor="end" font-family="system-ui,sans-serif" font-size="16" fill="${BRAND.muted}">mixxclub.lovable.app</text>
</svg>`;
}

function renderEngineerCard(engineer: Record<string, any>): string {
  const name = escapeXml(truncate(engineer.full_name || engineer.username || "Engineer", 30));
  const rating = engineer.average_rating ? Number(engineer.average_rating).toFixed(1) : "5.0";
  const projects = engineer.completed_projects_count || 0;
  const specialties = (engineer.specialties || []).slice(0, 3).map(escapeXml).join(" · ") || "Mixing & Mastering";
  const stars = "★".repeat(Math.round(Number(rating)));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND.bg}"/>
      <stop offset="100%" stop-color="#0f1629"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#accentLine)"/>
  <circle cx="600" cy="180" r="80" fill="#3b82f6" opacity="0.15"/>
  <text x="600" y="195" text-anchor="middle" font-family="system-ui,sans-serif" font-size="60" fill="#3b82f6">🎧</text>
  <text x="600" y="310" text-anchor="middle" font-family="system-ui,sans-serif" font-size="48" font-weight="700" fill="${BRAND.text}">${name}</text>
  <text x="600" y="355" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="${BRAND.muted}">${specialties}</text>
  <text x="440" y="430" text-anchor="middle" font-family="system-ui,sans-serif" font-size="36" fill="#fbbf24">${stars}</text>
  <text x="440" y="465" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="${BRAND.muted}">${rating} rating</text>
  <text x="760" y="440" text-anchor="middle" font-family="system-ui,sans-serif" font-size="42" font-weight="700" fill="${BRAND.text}">${projects}</text>
  <text x="760" y="465" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="${BRAND.muted}">projects completed</text>
  <text x="60" y="600" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="#3b82f6">MIXXCLUB</text>
  <text x="1140" y="600" text-anchor="end" font-family="system-ui,sans-serif" font-size="16" fill="${BRAND.muted}">mixxclub.lovable.app</text>
</svg>`;
}

function renderBattleCard(battle: Record<string, any>): string {
  const title = escapeXml(truncate(battle.title || "Battle", 35));
  const r1 = escapeXml(truncate(battle.rapper1 || "Challenger 1", 20));
  const r2 = escapeXml(truncate(battle.rapper2 || "Challenger 2", 20));
  const votes = battle.votes_count || 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a0a0a"/>
      <stop offset="100%" stop-color="${BRAND.bg}"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#accentLine)"/>
  <text x="600" y="100" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" font-weight="600" fill="#ef4444" letter-spacing="4">⚔ BATTLE ⚔</text>
  <text x="600" y="170" text-anchor="middle" font-family="system-ui,sans-serif" font-size="44" font-weight="700" fill="${BRAND.text}">${title}</text>
  <rect x="60" y="220" width="480" height="280" rx="20" fill="${BRAND.card}" opacity="0.85"/>
  <text x="300" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-size="64">🎤</text>
  <text x="300" y="420" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="700" fill="${BRAND.text}">${r1}</text>
  <text x="600" y="380" text-anchor="middle" font-family="system-ui,sans-serif" font-size="36" font-weight="900" fill="#ef4444">VS</text>
  <rect x="660" y="220" width="480" height="280" rx="20" fill="${BRAND.card}" opacity="0.85"/>
  <text x="900" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-size="64">🎤</text>
  <text x="900" y="420" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="700" fill="${BRAND.text}">${r2}</text>
  <text x="600" y="570" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" fill="${BRAND.muted}">${votes} votes</text>
  <text x="60" y="600" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="#ef4444">MIXXCLUB</text>
</svg>`;
}

function fallbackCard(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND.bg}"/>
      <stop offset="100%" stop-color="#1a1a2e"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${BRAND.accent}"/>
      <stop offset="100%" stop-color="${BRAND.accentAlt}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#accentLine)"/>
  <text x="600" y="280" text-anchor="middle" font-family="system-ui,sans-serif" font-size="72" font-weight="800" fill="${BRAND.text}">MIXXCLUB</text>
  <text x="600" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" fill="${BRAND.muted}">AI-Powered Audio Engineering Platform</text>
  <text x="600" y="420" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="${BRAND.accent}">Mixing · Mastering · Beats · Collaboration</text>
</svg>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // beat | engineer | battle
    const id = url.searchParams.get("id");

    if (!type || !id) {
      return new Response(fallbackCard(), {
        headers: { ...corsHeaders, "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let svg: string;

    switch (type) {
      case "beat": {
        const { data } = await supabase
          .from("producer_beats")
          .select("title, bpm, key_signature, price_cents, producer_id, profiles!producer_beats_producer_id_fkey(full_name, username)")
          .eq("id", id)
          .single();
        if (!data) { svg = fallbackCard(); break; }
        const profile = (data as any).profiles;
        svg = renderBeatCard({
          ...data,
          producer_name: profile?.full_name || profile?.username || "Producer",
        });
        break;
      }
      case "engineer": {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, username, average_rating, completed_projects_count, specialties")
          .eq("id", id)
          .single();
        svg = data ? renderEngineerCard(data) : fallbackCard();
        break;
      }
      case "battle": {
        const { data } = await supabase
          .from("battles")
          .select("title, rapper1, rapper2, votes_count, status")
          .eq("id", id)
          .single();
        svg = data ? renderBattleCard(data) : fallbackCard();
        break;
      }
      default:
        svg = fallbackCard();
    }

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("OG image error:", error);
    return new Response(fallbackCard(), {
      headers: { ...corsHeaders, "Content-Type": "image/svg+xml" },
    });
  }
});
