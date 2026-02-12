/**
 * AURA DAW — Redesigned Interface
 * 
 * "The interface IS the instrument."
 * 
 * This is a complete visual redesign of HybridDAW.tsx.
 * All audio logic (Transport, Scheduler, AudioEngine) remains unchanged.
 * Only the presentation layer has been rebuilt from scratch.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    Play, Pause, Square, SkipBack, Circle, Mic,
    MousePointer2, Pencil, Scissors, TrendingUp, ZoomIn,
    Settings, Import, FolderOpen, Download, ChevronUp, ChevronDown,
    Plus, AudioWaveform, Sparkles, Gamepad2, Brain
} from "lucide-react";

import EnhancedDAWTimeline from "@/components/daw/EnhancedDAWTimeline";
import DAWMixerPanel from "@/components/daw/DAWMixerPanel";
import AudioImportDialog from "@/components/AudioImportDialog";
import { StemSeparationWindow } from "@/components/studio/StemSeparationWindow";
import VelvetCurve from "@/components/plugins/VelvetCurve";
import { AIBeatGenerator } from "@/components/daw/AIBeatGenerator";
import { DrumMachine808 } from "@/components/daw/DrumMachine808";
import { CloudProjectManager } from "@/components/daw/CloudProjectManager";
import { ExportPanel } from "@/components/daw/ExportPanel";
import { BloomMenu, useBloomMenu } from "@/components/daw/BloomMenu";
import { ALSFeedbackBar } from "@/components/daw/ALSFeedbackBar";
import { PrimeBrainInterface } from "@/components/daw/PrimeBrainInterface";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAudioPermissions } from "@/hooks/useAudioPermissions";
import { useAudioEngineBridge } from "@/hooks/useAudioEngineBridge";
import { useSimplifiedTransportBridge } from "@/hooks/useSimplifiedTransportBridge";
import { useAchievements } from "@/hooks/useAchievements";
import { useAIStudioStore, Track, AudioRegion } from "@/stores/aiStudioStore";
import { WaveformGenerator } from "@/services/waveformGenerator";
import { audioEngine } from "@/services/audioEngine";

import "@/styles/aura-daw.css";

// ── Track Color Palette ──
const TRACK_COLORS = [
    '#a855f7', // purple - vocals
    '#ec4899', // magenta - synths
    '#06b6d4', // cyan - bass/pads
    '#f97316', // orange - drums
    '#eab308', // gold - guitars
    '#14b8a6', // teal - fx
    '#f43f5e', // rose
    '#3b82f6', // blue
];

// ── Tool Definitions ──
type ToolId = 'pointer' | 'pencil' | 'scissors' | 'automation' | 'zoom';

const TOOLS: { id: ToolId; icon: typeof MousePointer2; label: string }[] = [
    { id: 'pointer', icon: MousePointer2, label: 'Select (V)' },
    { id: 'pencil', icon: Pencil, label: 'Draw (D)' },
    { id: 'scissors', icon: Scissors, label: 'Split (S)' },
    { id: 'automation', icon: TrendingUp, label: 'Automation (A)' },
    { id: 'zoom', icon: ZoomIn, label: 'Zoom (Z)' },
];

// ── Format Timecode ──
function formatTimecode(time: number): string {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function volumeToDb(vol: number): string {
    if (vol <= 0) return '-∞';
    const db = 20 * Math.log10(vol);
    return `${db.toFixed(1)}`;
}

// ═══════════════════════════════════════
//  AURA DAW — Main Component
// ═══════════════════════════════════════
const AuraDAW = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { permissions, requestAudioPermissions, hasAudioAccess } = useAudioPermissions();

    // ── Store ──
    const tracks = useAIStudioStore((s) => s.tracks);
    const isPlaying = useAIStudioStore((s) => s.isPlaying);
    const currentTime = useAIStudioStore((s) => s.currentTime);
    const bpm = useAIStudioStore((s) => s.bpm);
    const masterVolume = useAIStudioStore((s) => s.masterVolume);
    const setPlaying = useAIStudioStore((s) => s.setPlaying);
    const setCurrentTime = useAIStudioStore((s) => s.setCurrentTime);
    const setBpm = useAIStudioStore((s) => s.setBpm);
    const setMasterVolume = useAIStudioStore((s) => s.setMasterVolume);
    const addTrack = useAIStudioStore((s) => s.addTrack);
    const updateTrack = useAIStudioStore((s) => s.updateTrack);
    const removeTrack = useAIStudioStore((s) => s.removeTrack);

    // ── Local State ──
    const [isRecording, setIsRecording] = useState(false);
    const [activeTool, setActiveTool] = useState<ToolId>('pointer');
    const [consoleCollapsed, setConsoleCollapsed] = useState(false);
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

    // Dialogs
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showStemSeparation, setShowStemSeparation] = useState(false);
    const [showCloudManager, setShowCloudManager] = useState(false);
    const [showVelvetCurve, setShowVelvetCurve] = useState(false);
    const [showAIBeats, setShowAIBeats] = useState(false);
    const [show808, setShow808] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showPrimeBrain, setShowPrimeBrain] = useState(false);

    // Bloom Menu
    const bloom = useBloomMenu();

    // Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Bridges
    const { achievements, unlockAchievement } = useAchievements();
    useAudioEngineBridge();
    useSimplifiedTransportBridge();

    // ── Init AudioWorklets ──
    useEffect(() => {
        audioEngine.initWorklets();
    }, []);

    // ── Init AudioContext ──
    useEffect(() => {
        const init = async () => {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error('Failed to init AudioContext:', e);
            }
        };
        init();
        return () => { audioContextRef.current?.close(); };
    }, []);

    // ── Request Microphone ──
    const requestMicrophone = async () => {
        const granted = await requestAudioPermissions();
        if (granted && permissions.stream) {
            streamRef.current = permissions.stream;
        }
    };

    // ── Transport Handlers ──
    const handlePlayPause = useCallback(() => {
        setPlaying(!isPlaying);
    }, [isPlaying, setPlaying]);

    const handleStop = useCallback(() => {
        setPlaying(false);
        setCurrentTime(0);
    }, [setPlaying, setCurrentTime]);

    const seekToTime = useCallback((time: number) => {
        setCurrentTime(time);
    }, [setCurrentTime]);

    // ── Track Management ──
    const createNewTrack = useCallback((type: 'audio' | 'vocal' | 'instrument' = 'audio') => {
        const colorIndex = tracks.length % TRACK_COLORS.length;
        const newTrack: Track = {
            id: `track-${Date.now()}`,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${tracks.length + 1}`,
            type: type === 'instrument' ? 'audio' : type,
            color: TRACK_COLORS[colorIndex],
            volume: 0.8,
            pan: 0,
            mute: false,
            solo: false,
            regions: [],
            effects: [],
            sends: {},
        };
        addTrack(newTrack);
        if (tracks.length === 0) unlockAchievement('first-track');
    }, [tracks.length, addTrack, unlockAchievement]);

    // ── Recording ──
    const startRecording = async (trackId: string) => {
        if (!hasAudioAccess || !permissions.stream) {
            await requestMicrophone();
            return;
        }
        const stream = permissions.stream;
        try {
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const ctx = audioContextRef.current;
                if (!ctx) return;
                const arrayBuffer = await blob.arrayBuffer();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                const waveformData = WaveformGenerator.generateFromBuffer(audioBuffer, { width: 800, normalize: true });
                const region: AudioRegion = {
                    id: `region-${Date.now()}`, trackId, startTime: currentTime,
                    duration: audioBuffer.duration, audioBuffer, sourceStartOffset: 0,
                    fadeIn: { duration: 0, curve: 'linear' }, fadeOut: { duration: 0, curve: 'linear' }, gain: 1.0,
                };
                const track = tracks.find(t => t.id === trackId);
                if (track) {
                    updateTrack(trackId, { regions: [...track.regions, region], audioBuffer, waveformData, armed: false });
                }
                setIsRecording(false);
                toast({ title: "Recording Complete", description: `${audioBuffer.duration.toFixed(1)}s recorded` });
            };
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            updateTrack(trackId, { armed: true });
            setIsRecording(true);
            if (!isPlaying) setPlaying(true);
        } catch (e) {
            console.error('Recording error:', e);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        tracks.forEach(t => { if (t.armed) updateTrack(t.id, { armed: false }); });
    };

    // ── Audio Import Handler ──
    const handleImportedAudio = async (audioData: any) => {
        const { audioBuffer, fileName } = audioData;
        const waveformData = WaveformGenerator.generateFromBuffer(audioBuffer, { width: 800, normalize: true });
        const colorIndex = tracks.length % TRACK_COLORS.length;
        const newTrack: Track = {
            id: `track-${Date.now()}`, name: fileName.replace(/\.[^/.]+$/, ''),
            type: 'audio', color: TRACK_COLORS[colorIndex], volume: 0.8, pan: 0,
            mute: false, solo: false, audioBuffer, waveformData,
            regions: [{
                id: `region-${Date.now()}`, trackId: `track-${Date.now()}`, startTime: 0,
                duration: audioBuffer.duration, audioBuffer, sourceStartOffset: 0,
                fadeIn: { duration: 0, curve: 'linear' }, fadeOut: { duration: 0, curve: 'linear' }, gain: 1.0
            }],
            effects: [], sends: {},
        };
        addTrack(newTrack);
        toast({ title: "Imported", description: fileName });
    };

    // ── Track Changes from Timeline ──
    const onTracksChange = useCallback((updatedTracks: Track[]) => {
        updatedTracks.forEach(t => {
            const existing = tracks.find(et => et.id === t.id);
            if (existing && JSON.stringify(existing) !== JSON.stringify(t)) {
                updateTrack(t.id, t);
            }
        });
    }, [tracks, updateTrack]);

    // ── Keyboard Shortcuts ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't intercept if typing in an input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleStop();
                    break;
                case 'KeyN':
                    if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); createNewTrack(); }
                    break;
                case 'KeyR':
                    if (!e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        if (isRecording) stopRecording();
                        else if (tracks.length > 0) startRecording(tracks[0].id);
                        else createNewTrack('vocal');
                    }
                    break;
                case 'Tab':
                    e.preventDefault();
                    setConsoleCollapsed(c => !c);
                    break;
                case 'KeyI':
                    if (e.metaKey || e.ctrlKey) { e.preventDefault(); setShowImportDialog(true); }
                    break;
                // Tool shortcuts
                case 'KeyV': setActiveTool('pointer'); break;
                case 'KeyD': if (!e.metaKey) setActiveTool('pencil'); break;
                case 'KeyS': if (!e.metaKey && !e.ctrlKey) setActiveTool('scissors'); break;
                case 'KeyA': if (!e.metaKey) setActiveTool('automation'); break;
                case 'KeyZ': if (!e.metaKey && !e.ctrlKey) setActiveTool('zoom'); break;
            }

            // Ctrl+Space = Bloom Menu
            if (e.code === 'Space' && e.ctrlKey) {
                e.preventDefault();
                bloom.open({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }

            // Cmd+Shift+P = Prime Brain
            if (e.code === 'KeyP' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
                e.preventDefault();
                setShowPrimeBrain(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePlayPause, handleStop, createNewTrack, isRecording, tracks, bloom]);

    // ── Stem Separation Handler ──
    const handleStemsProcessed = async (stems: any[]) => {
        if (!audioContextRef.current) return;
        for (const [index, stem] of stems.entries()) {
            try {
                const response = await fetch(stem.filePath);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
                const waveformData = WaveformGenerator.generateFromBuffer(audioBuffer, { width: 800, normalize: true });
                const colorIndex = (tracks.length + index) % TRACK_COLORS.length;
                const newTrack: Track = {
                    id: `stem-${Date.now()}-${index}`, name: stem.stemName,
                    type: 'audio', color: TRACK_COLORS[colorIndex], volume: 0.8, pan: 0,
                    mute: false, solo: false, audioBuffer, waveformData,
                    regions: [{
                        id: `region-${Date.now()}-${index}`, trackId: `stem-${Date.now()}-${index}`,
                        startTime: 0, duration: audioBuffer.duration, audioBuffer, sourceStartOffset: 0,
                        fadeIn: { duration: 0, curve: 'linear' }, fadeOut: { duration: 0, curve: 'linear' }, gain: 1.0
                    }],
                    effects: [], sends: {},
                };
                addTrack(newTrack);
            } catch (e) {
                console.error(`Failed to decode stem ${stem.stemName}:`, e);
            }
        }
        toast({ title: "Stems Imported!", description: `${stems.length} stems added` });
    };

    // ── Bloom Petals ──
    const bloomPetals = [
        { id: 'import', label: 'Import', icon: <Import className="w-5 h-5" />, color: '#10b981', action: () => { setShowImportDialog(true); bloom.close(); } },
        { id: 'stems', label: 'Stems', icon: <Sparkles className="w-5 h-5" />, color: '#a855f7', action: () => { setShowStemSeparation(true); bloom.close(); } },
        { id: 'velvet', label: 'Velvet', icon: <AudioWaveform className="w-5 h-5" />, color: '#ec4899', action: () => { setShowVelvetCurve(true); bloom.close(); } },
        { id: '808', label: '808', icon: <Gamepad2 className="w-5 h-5" />, color: '#f97316', action: () => { setShow808(true); bloom.close(); } },
        { id: 'ai-beats', label: 'AI Beats', icon: <Mic className="w-5 h-5" />, color: '#3b82f6', action: () => { setShowAIBeats(true); bloom.close(); } },
        { id: 'export', label: 'Export', icon: <Download className="w-5 h-5" />, color: '#f59e0b', action: () => { setShowExport(true); bloom.close(); } },
        { id: 'project', label: 'Project', icon: <FolderOpen className="w-5 h-5" />, color: '#06b6d4', action: () => { setShowCloudManager(true); bloom.close(); } },
        { id: 'new-track', label: 'New Track', icon: <Plus className="w-5 h-5" />, color: '#22c55e', action: () => { createNewTrack(); bloom.close(); } },
        { id: 'prime-brain', label: 'Prime Brain', icon: <Brain className="w-5 h-5" />, color: '#8b5cf6', action: () => { setShowPrimeBrain(true); bloom.close(); } },
    ];

    // ═══════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════
    return createPortal(
        <div
            className="aura-daw"
            onContextMenu={(e) => { e.preventDefault(); bloom.open({ x: e.clientX, y: e.clientY }); }}
        >
            {/* ══════════ TRANSPORT BAR ══════════ */}
            <div className="aura-transport">
                {/* Left: Logo + Controls */}
                <div className="flex items-center gap-3">
                    <span className="aura-transport__logo">AURA</span>

                    <div className="aura-transport__controls">
                        <button className="aura-transport__btn" onClick={() => seekToTime(0)} title="Rewind">
                            <SkipBack size={14} />
                        </button>
                        <button
                            className={`aura-transport__btn ${isPlaying ? 'aura-transport__btn--active' : ''}`}
                            onClick={handlePlayPause}
                            title="Play / Pause (Space)"
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
                        </button>
                        <button className="aura-transport__btn" onClick={handleStop} title="Stop (Enter)">
                            <Square size={13} />
                        </button>
                    </div>

                    <button
                        className={`aura-transport__btn aura-transport__btn--record ${isRecording ? 'aura-transport__btn--record-active' : ''}`}
                        onClick={() => {
                            if (isRecording) stopRecording();
                            else if (tracks.length > 0) startRecording(tracks[0].id);
                            else createNewTrack('vocal');
                        }}
                        title="Record (R)"
                    >
                        <Circle size={14} fill={isRecording ? 'currentColor' : 'none'} />
                    </button>
                </div>

                {/* Center: Timecode */}
                <div className="aura-timecode">
                    <div>
                        <div className="aura-timecode__time">{formatTimecode(currentTime)}</div>
                    </div>
                    <div className="aura-timecode__divider" />
                    <div style={{ textAlign: 'center' }}>
                        <div className="aura-timecode__bpm-label">BPM</div>
                        <div className="aura-timecode__bpm">{bpm}</div>
                    </div>
                </div>

                {/* Right: Status */}
                <div className="aura-transport__status">
                    <div className={`aura-status-dot ${isRecording ? 'aura-status-dot--recording' : isPlaying ? 'aura-status-dot--playing' : ''}`} />
                    <span>{isRecording ? 'REC' : isPlaying ? 'PLAY' : 'STOP'}</span>
                    <span className="opacity-50 ml-2">48kHz · 24bit</span>
                </div>
            </div>

            {/* ══════════ ALS FEEDBACK BAR ══════════ */}
            <ALSFeedbackBar />

            {/* ══════════ WAVEFORM OVERVIEW ══════════ */}
            <div className="aura-overview">
                {/* Minimap bars — visual representation of all tracks */}
                <div className="aura-overview__bars">
                    {Array.from({ length: 120 }, (_, i) => {
                        const hasTrack = tracks.length > 0;
                        const height = hasTrack
                            ? Math.max(2, Math.random() * 16 + 2)
                            : 1;
                        return (
                            <div
                                key={i}
                                className="aura-overview__bar"
                                style={{ height: height, opacity: hasTrack ? 0.5 : 0.15 }}
                            />
                        );
                    })}
                </div>
                {/* Viewport indicator */}
                <div
                    className="aura-overview__viewport"
                    style={{ left: '5%', width: tracks.length > 0 ? '30%' : '100%' }}
                />
                {/* Playhead position */}
                {tracks.length > 0 && (
                    <div
                        className="aura-overview__playhead"
                        style={{ left: `${Math.min(95, (currentTime / Math.max(1, tracks.reduce((max, t) => Math.max(max, t.regions?.reduce((m, r) => Math.max(m, r.startTime + r.duration), 0) || 0), 30))) * 100)}%` }}
                    />
                )}
            </div>

            {/* ══════════ MAIN BODY ══════════ */}
            <div className="aura-body">
                {/* ── Toolbar ── */}
                <div className="aura-toolbar">
                    {TOOLS.map((tool) => (
                        <button
                            key={tool.id}
                            className={`aura-toolbar__btn ${activeTool === tool.id ? 'aura-toolbar__btn--active' : ''}`}
                            onClick={() => setActiveTool(tool.id)}
                            title={tool.label}
                        >
                            <tool.icon size={16} />
                        </button>
                    ))}

                    <div className="aura-toolbar__divider" />

                    {/* Quick actions */}
                    <button
                        className="aura-toolbar__btn"
                        onClick={() => createNewTrack()}
                        title="New Track (N)"
                    >
                        <Plus size={16} />
                    </button>

                    <button
                        className="aura-toolbar__btn"
                        onClick={() => setShowImportDialog(true)}
                        title="Import Audio (⌘I)"
                    >
                        <Import size={16} />
                    </button>

                    <div className="aura-toolbar__spacer" />

                    <button
                        className="aura-toolbar__btn"
                        title="Settings"
                    >
                        <Settings size={16} />
                    </button>
                </div>

                {/* ── Track Headers + Arrangement ── */}
                <div className="flex flex-1 min-w-0 flex-col">
                    {tracks.length === 0 ? (
                        /* ═══ EMPTY STATE ═══ */
                        <div className="aura-empty">
                            <div className="aura-empty__rings">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="aura-empty__ring" />)}
                            </div>
                            <div className="aura-empty__title">AURA</div>
                            <div className="aura-empty__subtitle">
                                Drop audio here · Press <kbd className="aura-empty__kbd">N</kbd> for a new track · <kbd className="aura-empty__kbd">⌘I</kbd> to import
                            </div>
                        </div>
                    ) : (
                        /* ═══ TRACK HEADERS + TIMELINE ═══ */
                        <div className="flex flex-1 min-h-0">
                            {/* Track Headers */}
                            <div className="aura-tracks">
                                <div className="aura-tracks__header-spacer">
                                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--aura-text-muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                                        TRACKS
                                    </span>
                                    <span style={{ fontSize: 9, color: 'var(--aura-text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                                        {tracks.length}
                                    </span>
                                </div>

                                {tracks.map(track => (
                                    <div
                                        key={track.id}
                                        className={`aura-track-header ${selectedTrackId === track.id ? 'aura-track-header--selected' : ''} ${track.mute ? 'aura-track-header--muted' : ''}`}
                                        onClick={() => setSelectedTrackId(track.id)}
                                    >
                                        <div
                                            className="aura-track-header__color-strip"
                                            style={{ backgroundColor: track.color }}
                                        />
                                        <div className="aura-track-header__content">
                                            <div className="aura-track-header__name">{track.name}</div>
                                            <div className="aura-track-header__controls">
                                                <button
                                                    className={`aura-track-smr ${track.solo ? 'aura-track-smr--solo-active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        tracks.forEach(t => { if (t.id !== track.id && t.solo) updateTrack(t.id, { solo: false }); });
                                                        updateTrack(track.id, { solo: !track.solo });
                                                    }}
                                                    aria-label={`Solo ${track.name}`}
                                                >S</button>
                                                <button
                                                    className={`aura-track-smr ${track.mute ? 'aura-track-smr--mute-active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { mute: !track.mute }); }}
                                                    aria-label={`Mute ${track.name}`}
                                                >M</button>
                                                <button
                                                    className={`aura-track-smr ${track.armed ? 'aura-track-smr--rec-active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (track.armed) stopRecording();
                                                        else startRecording(track.id);
                                                    }}
                                                    aria-label={`Arm ${track.name} for recording`}
                                                >R</button>
                                            </div>
                                            {/* Inline VU */}
                                            <div className="aura-track-vu">
                                                <div
                                                    className="aura-track-vu__fill"
                                                    style={{ width: `${track.mute ? 0 : track.volume * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Timeline */}
                            <div className="aura-arrangement">
                                <EnhancedDAWTimeline
                                    tracks={tracks}
                                    onTracksChange={onTracksChange}
                                    currentTime={currentTime}
                                    onTimeChange={seekToTime}
                                    isPlaying={isPlaying}
                                    bpm={bpm}
                                    onStartRecording={startRecording}
                                    onStopRecording={stopRecording}
                                    isRecording={isRecording}
                                    onRegionSelect={setSelectedRegionId}
                                />
                            </div>
                        </div>
                    )}

                    {/* ══════════ CONSOLE STRIP ══════════ */}
                    <div className={`aura-console ${consoleCollapsed ? 'aura-console--collapsed' : ''}`}>
                        <div className="aura-console__toggle" onClick={() => setConsoleCollapsed(c => !c)}>
                            <span className="aura-console__toggle-label">CONSOLE</span>
                            {consoleCollapsed ? <ChevronUp size={12} color="var(--aura-text-muted)" /> : <ChevronDown size={12} color="var(--aura-text-muted)" />}
                        </div>

                        {!consoleCollapsed && (
                            <div className="aura-console__channels">
                                {tracks.map(track => (
                                    <div
                                        key={track.id}
                                        className={`aura-channel ${selectedTrackId === track.id ? 'aura-channel--selected' : ''}`}
                                        onClick={() => setSelectedTrackId(track.id)}
                                    >
                                        <div className="aura-channel__name" style={{ color: track.color }}>{track.name}</div>
                                        <div className="aura-channel__meter-wrap">
                                            <div className="aura-channel__meter">
                                                <div className="aura-channel__meter-fill" style={{ height: `${track.mute ? 0 : track.volume * 100}%` }} />
                                            </div>
                                            <div className="aura-channel__meter">
                                                <div className="aura-channel__meter-fill" style={{ height: `${track.mute ? 0 : track.volume * 95}%` }} />
                                            </div>
                                        </div>
                                        <div className="aura-channel__fader">
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                value={track.volume * 100}
                                                onChange={(e) => updateTrack(track.id, { volume: Number(e.target.value) / 100 })}
                                            />
                                        </div>
                                        <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono, monospace', color: 'var(--aura-text-dim)', textAlign: 'center' }}>
                                            {volumeToDb(track.volume)}
                                        </div>
                                    </div>
                                ))}

                                {/* Master Channel */}
                                <div className="aura-channel aura-channel--master">
                                    <div className="aura-channel__name">MASTER</div>
                                    <div className="aura-channel__meter-wrap">
                                        <div className="aura-channel__meter">
                                            <div className="aura-channel__meter-fill" style={{ height: `${masterVolume * 100}%` }} />
                                        </div>
                                        <div className="aura-channel__meter">
                                            <div className="aura-channel__meter-fill" style={{ height: `${masterVolume * 95}%` }} />
                                        </div>
                                    </div>
                                    <div className="aura-channel__fader">
                                        <input
                                            type="range"
                                            min={0}
                                            max={150}
                                            value={masterVolume * 100}
                                            onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
                                        />
                                    </div>
                                    <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'var(--aura-amber)', textAlign: 'center' }}>
                                        {volumeToDb(masterVolume)} dB
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════ DIALOGS / MODALS ══════════ */}
            {showImportDialog && (
                <AudioImportDialog
                    sessionId={`session-${user?.id || 'anonymous'}`}
                    onImportComplete={handleImportedAudio}
                    onClose={() => setShowImportDialog(false)}
                />
            )}

            {showStemSeparation && (
                <StemSeparationWindow
                    onClose={() => setShowStemSeparation(false)}
                    onStemsProcessed={handleStemsProcessed}
                />
            )}

            {showCloudManager && (
                <CloudProjectManager
                    isOpen={showCloudManager}
                    onClose={() => setShowCloudManager(false)}
                />
            )}

            {showVelvetCurve && (
                <VelvetCurve isOpen={showVelvetCurve} onClose={() => setShowVelvetCurve(false)} />
            )}

            {show808 && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ background: 'var(--aura-surface)', borderRadius: 16, border: '1px solid var(--aura-border)', padding: 24, maxWidth: 600, width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontWeight: 700, fontSize: 16 }}>808 Drum Machine</span>
                            <button onClick={() => setShow808(false)} className="bg-transparent border-none text-[var(--aura-text-muted)] cursor-pointer" aria-label="Close 808">✕</button>
                        </div>
                        <DrumMachine808 onNoteTriggered={(note, vel) => console.log('808:', note, vel)} />
                    </div>
                </div>
            )}

            {showAIBeats && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ background: 'var(--aura-surface)', borderRadius: 16, border: '1px solid var(--aura-border)', padding: 24, maxWidth: 900, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontWeight: 700, fontSize: 16 }}>AI Beat Generator</span>
                            <button onClick={() => setShowAIBeats(false)} className="bg-transparent border-none text-[var(--aura-text-muted)] cursor-pointer" aria-label="Close AI Beat Generator">✕</button>
                        </div>
                        <AIBeatGenerator />
                    </div>
                </div>
            )}

            <ExportPanel isOpen={showExport} onClose={() => setShowExport(false)} />

            {/* ══════════ PRIME BRAIN ══════════ */}
            <PrimeBrainInterface isOpen={showPrimeBrain} onClose={() => setShowPrimeBrain(false)} />

            {/* ══════════ BLOOM MENU ══════════ */}
            <BloomMenu
                isOpen={bloom.isOpen}
                onClose={bloom.close}
                position={bloom.position}
                bpm={bpm}
                isPlaying={isPlaying}
                petals={bloomPetals}
            />
        </div>,
        document.body
    );
};

export default AuraDAW;
