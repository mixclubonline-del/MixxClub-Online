/**
 * trainingDataLogger — Phase 1 Data Collection for io.net Fine-Tuning
 *
 * Silently captures every Prime Brain Q&A exchange as a training pair.
 * Each pair includes the user instruction, AI output, and an ALS snapshot
 * of the audio state at the time of the exchange.
 *
 * Data is stored in Supabase `prime_brain_training_data` and can be
 * exported as JSONL for Hugging Face → io.net SFT pipeline.
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────────────────────────

export interface ALSSnapshot {
    body: number;
    soul: number;
    silk: number;
    air: number;
    velvet: number;
    energy: number;
}

export interface TrainingPair {
    instruction: string;
    output: string;
    alsSnapshot: ALSSnapshot | null;
}

interface QueuedEntry {
    session_id: string;
    instruction: string;
    output: string;
    als_snapshot: ALSSnapshot | null;
    metadata: Record<string, unknown>;
}

// ─── Logger ──────────────────────────────────────────────────────

class TrainingDataLogger {
    private queue: QueuedEntry[] = [];
    private flushTimer: ReturnType<typeof setTimeout> | null = null;
    private sessionId: string;
    private readonly FLUSH_DELAY_MS = 3000;
    private readonly MAX_QUEUE_SIZE = 5;

    constructor() {
        this.sessionId = this.generateSessionId();
    }

    private generateSessionId(): string {
        return `pb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    /** Start a new session (e.g., when Prime Brain panel opens) */
    newSession(): void {
        this.flush(); // flush any remaining from prior session
        this.sessionId = this.generateSessionId();
    }

    /**
     * Log a completed Q&A exchange.
     * Called after AI streaming finishes for a message pair.
     */
    log(pair: TrainingPair): void {
        // Skip empty or error responses
        if (!pair.instruction.trim() || !pair.output.trim()) return;
        if (pair.output.startsWith('Sorry, I encountered an error')) return;

        // Strip the injected [Audio Context] from instruction for cleaner training data.
        // The ALS data is preserved separately in als_snapshot.
        const cleanInstruction = pair.instruction
            .replace(/\n\n\[Audio Context —.*\]$/, '')
            .trim();

        const entry: QueuedEntry = {
            session_id: this.sessionId,
            instruction: cleanInstruction,
            output: pair.output.trim(),
            als_snapshot: pair.alsSnapshot,
            metadata: {
                timestamp: new Date().toISOString(),
                instructionTokenEstimate: Math.ceil(cleanInstruction.length / 4),
                outputTokenEstimate: Math.ceil(pair.output.length / 4),
            },
        };

        this.queue.push(entry);

        // Flush immediately if queue is full, otherwise debounce
        if (this.queue.length >= this.MAX_QUEUE_SIZE) {
            this.flush();
        } else {
            this.scheduleFlush();
        }
    }

    private scheduleFlush(): void {
        if (this.flushTimer) clearTimeout(this.flushTimer);
        this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_DELAY_MS);
    }

    /** Write queued entries to Supabase */
    async flush(): Promise<void> {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }

        if (this.queue.length === 0) return;

        const batch = [...this.queue];
        this.queue = [];

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn('[TrainingDataLogger] No authenticated user, skipping write');
                return;
            }

            const rows = batch.map(entry => ({
                user_id: user.id,
                session_id: entry.session_id,
                instruction: entry.instruction,
                output: entry.output,
                als_snapshot: entry.als_snapshot,
                metadata: entry.metadata,
            }));

            const { error } = await supabase
                .from('prime_brain_training_data' as never)
                .insert(rows as never);

            if (error) {
                // Table might not exist yet — silently fail, don't break UX
                console.warn('[TrainingDataLogger] Write failed:', error.message);
                return;
            }

            console.debug(`[TrainingDataLogger] Logged ${rows.length} training pair(s)`);
        } catch (err) {
            console.warn('[TrainingDataLogger] Unexpected error:', err);
        }
    }

    /** Get count of entries logged this session */
    get pendingCount(): number {
        return this.queue.length;
    }

    get currentSessionId(): string {
        return this.sessionId;
    }
}

// ─── Singleton Export ────────────────────────────────────────────

export const trainingDataLogger = new TrainingDataLogger();
