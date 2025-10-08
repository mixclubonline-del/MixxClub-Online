import { MixxMasterManifest, AudioStemCollection, SessionData, MixxMasterMetadata, AudioStem, MixxMasterError } from './types';
import { MixxMasterValidator } from './validator';

/**
 * Generates MixxMaster.tsx session packages
 */
export class MixxMasterGenerator {
  /**
   * Create a new MixxMaster session manifest
   */
  static async createManifest(params: {
    sessionId: string;
    projectId: string;
    createdBy: string;
    audio: AudioStemCollection;
    sessionData: SessionData;
    metadata: MixxMasterMetadata;
  }): Promise<MixxMasterManifest> {
    const now = new Date().toISOString();

    const manifestWithoutChecksum = {
      version: '1.0',
      sessionId: params.sessionId,
      projectId: params.projectId,
      createdAt: now,
      updatedAt: now,
      createdBy: params.createdBy,
      audio: params.audio,
      sessionData: params.sessionData,
      metadata: params.metadata,
    };

    // Calculate checksum
    const checksum = await MixxMasterValidator.calculateChecksum(manifestWithoutChecksum);

    const manifest: MixxMasterManifest = {
      ...manifestWithoutChecksum,
      checksum,
    };

    // Validate before returning
    MixxMasterValidator.validateManifest(manifest);

    return manifest;
  }

  /**
   * Create audio stem entry
   */
  static createAudioStem(params: {
    id: string;
    name: string;
    category: 'vocals' | 'drums' | 'instruments' | 'fx';
    storagePath: string;
    fileSize: number;
    durationSeconds: number;
    sampleRate?: number;
    bitDepth?: number;
    channels?: number;
  }): AudioStem {
    return {
      id: params.id,
      name: params.name,
      category: params.category,
      storagePath: params.storagePath,
      fileSize: params.fileSize,
      durationSeconds: params.durationSeconds,
      sampleRate: params.sampleRate || 48000,
      bitDepth: params.bitDepth || 24,
      channels: params.channels || 2,
    };
  }

  /**
   * Organize stems into categories
   */
  static organizeStems(stems: AudioStem[]): AudioStemCollection {
    return {
      vocals: stems.filter(s => s.category === 'vocals'),
      drums: stems.filter(s => s.category === 'drums'),
      instruments: stems.filter(s => s.category === 'instruments'),
      fx: stems.filter(s => s.category === 'fx'),
    };
  }

  /**
   * Create default session data structure
   */
  static createDefaultSessionData(): SessionData {
    return {
      mixChain: {
        chains: [],
        version: '1.0',
      },
      routing: {
        buses: [],
        auxSends: [],
      },
      tempoMap: {
        bpm: 120,
        timeSignature: '4/4',
        markers: [],
        tempoChanges: [],
      },
      aiAnalysis: {
        version: 'primebot-4.0',
        analyzedAt: new Date().toISOString(),
        spectralAnalysis: {
          frequencyBalance: {
            low: 0,
            lowMid: 0,
            mid: 0,
            highMid: 0,
            high: 0,
          },
          clarityScore: 0,
          muddiness: 0,
          brightness: 0,
          problematicFrequencies: [],
        },
        tonalAnalysis: {
          key: 'Unknown',
          tempo: 120,
          timeSignature: '4/4',
          harmonicComplexity: 0,
          chordProgression: [],
          scaleType: 'Unknown',
        },
        emotionAnalysis: {
          mood: 'neutral',
          energy: 50,
          valence: 50,
          arousal: 50,
          dominantEmotion: 'calm',
        },
        mixingSuggestions: [],
        pluginRecommendations: [],
        confidenceScore: 0,
        processingTimeMs: 0,
      },
    };
  }

  /**
   * Create metadata structure
   */
  static createMetadata(params: {
    artistId: string;
    artistName: string;
    projectName: string;
    genre?: string;
    source?: 'original' | 'legacy_import' | 'template';
    engineerId?: string;
    engineerName?: string;
  }): MixxMasterMetadata {
    return {
      artistInfo: {
        artistId: params.artistId,
        artistName: params.artistName,
        projectName: params.projectName,
        genre: params.genre,
        collaboration: params.engineerId ? {
          engineerId: params.engineerId,
          engineerName: params.engineerName,
        } : undefined,
      },
      versionHistory: [
        {
          versionNumber: 1,
          createdAt: new Date().toISOString(),
          createdBy: params.artistId,
          changesSummary: 'Initial session creation',
        },
      ],
      source: params.source || 'original',
    };
  }

  /**
   * Add version to session
   */
  static addVersion(
    manifest: MixxMasterManifest,
    params: {
      createdBy: string;
      engineerSignature?: string;
      changesSummary: string;
    }
  ): MixxMasterManifest {
    const nextVersion = manifest.metadata.versionHistory.length + 1;

    const newVersionEntry = {
      versionNumber: nextVersion,
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
      engineerSignature: params.engineerSignature,
      changesSummary: params.changesSummary,
    };

    const updatedManifest = {
      ...manifest,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...manifest.metadata,
        versionHistory: [...manifest.metadata.versionHistory, newVersionEntry],
      },
    };

    return updatedManifest;
  }

  /**
   * Export manifest as JSON string
   */
  static exportToJSON(manifest: MixxMasterManifest, prettify: boolean = false): string {
    return JSON.stringify(manifest, null, prettify ? 2 : 0);
  }

  /**
   * Parse JSON string to manifest
   */
  static parseFromJSON(json: string): MixxMasterManifest {
    try {
      const parsed = JSON.parse(json);
      MixxMasterValidator.validateManifest(parsed);
      return parsed;
    } catch (error) {
      throw new MixxMasterError(
        'Failed to parse MixxMaster manifest',
        'PARSE_ERROR',
        { originalError: error }
      );
    }
  }
}
