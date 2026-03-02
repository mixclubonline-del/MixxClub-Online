import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Handle Contact Form Submission
 * - Validates input
 * - Stores in contact_submissions table
 * - Sends notification email to admin via Resend (if configured)
 * - Rate limits by IP
 */

interface ContactFormRequest {
    name: string;
    email: string;
    subject: string;
    message: string;
}

// Simple in-memory rate limit (per function instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }

    entry.count++;
    return true;
}

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Rate limit by IP
        const clientIP =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("cf-connecting-ip") ||
            "unknown";

        if (!checkRateLimit(clientIP)) {
            return new Response(
                JSON.stringify({ error: "Too many submissions. Please try again later." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
            );
        }

        const body: ContactFormRequest = await req.json();
        const { name, email, subject, message } = body;

        // Validate
        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return new Response(
                JSON.stringify({ error: "All fields are required" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 2000) {
            return new Response(
                JSON.stringify({ error: "Field exceeds maximum length" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(
                JSON.stringify({ error: "Invalid email address" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        // Store in database
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: submission, error: dbError } = await supabase
            .from("contact_submissions")
            .insert({
                name: name.trim(),
                email: email.trim(),
                subject: subject.trim(),
                message: message.trim(),
                ip_address: clientIP,
                status: "new",
            })
            .select()
            .single();

        if (dbError) {
            console.error("[CONTACT-FORM] DB error:", dbError.message);
            throw new Error("Failed to save submission");
        }

        console.log("[CONTACT-FORM] Saved submission:", submission?.id);

        // Send notification email via Resend (if API key is configured)
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "admin@mixclub.com";

        if (resendApiKey) {
            try {
                const emailResponse = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${resendApiKey}`,
                    },
                    body: JSON.stringify({
                        from: "Mixxclub <notifications@mixxclubonline.com>",
                        to: [adminEmail],
                        subject: `[Contact Form] ${subject}`,
                        html: `
              <h2>New Contact Form Submission</h2>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(name)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Subject</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(subject)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Message</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(message)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">IP</td><td style="padding:8px;border:1px solid #ddd">${clientIP}</td></tr>
              </table>
              <p style="margin-top:16px;color:#666">Reply directly to this email to respond to the customer.</p>
            `,
                        reply_to: email.trim(),
                    }),
                });

                if (!emailResponse.ok) {
                    const errorText = await emailResponse.text();
                    console.error("[CONTACT-FORM] Resend error:", errorText);
                } else {
                    console.log("[CONTACT-FORM] Admin notification sent");

                    // Update submission status
                    await supabase
                        .from("contact_submissions")
                        .update({ status: "notified" })
                        .eq("id", submission.id);
                }
            } catch (emailErr) {
                // Don't fail the whole request if email fails
                console.error("[CONTACT-FORM] Email notification failed:", emailErr);
            }
        } else {
            console.log("[CONTACT-FORM] No RESEND_API_KEY set, skipping email notification");
        }

        return new Response(
            JSON.stringify({ success: true, id: submission?.id }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[CONTACT-FORM] Error:", errorMessage);

        return new Response(
            JSON.stringify({ error: errorMessage }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
