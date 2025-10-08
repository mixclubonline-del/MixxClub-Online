import { describe, it, expect } from 'vitest';
import { MixxMasterValidator } from '@/lib/mixxmaster/validator';
import type { MixxMasterManifest } from '@/lib/mixxmaster/types';

describe('MixxMasterValidator', () => {
  const validManifest: Omit<MixxMasterManifest, 'checksum'> = {
    version: '1.0',
    sessionId: 'test-session-123',
    projectId: 'test-project-456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    audio: {
      vocals: [
        {
          id: 'vocal-1',
          name: 'Lead Vocal',
          storagePath: 'stems/vocal-1.wav',
          sampleRate: 48000,
          bitDepth: 24,
          channels: 2,
          duration: 180,
          fileSize: 5242880,
          format: 'wav',
          waveformData: { peaks: [], duration: 180, sampleRate: 48000 }
        }
      ],
      drums: [],
      instruments: [],
      fx: []
    },
    sessionData: {
      mixChains: { master: { plugins: [] } },
      routing: { buses: [], auxSends: [] },
      tempoMap: { bpm: 120, timeSignature: '4/4', markers: [] },
      aiAnalysis: null
    },
    metadata: {
      artist: 'Test Artist',
      projectName: 'Test Project',
      versionHistory: [],
      source: { daw: 'Logic Pro X', version: '10.8' },
      tags: [],
      notes: ''
    }
  };

  describe('validateManifest', () => {
    it('should validate a complete valid manifest', async () => {
      const checksum = await MixxMasterValidator.calculateChecksum(validManifest);
      const manifestWithChecksum = { ...validManifest, checksum };
      
      expect(() => MixxMasterValidator.validateManifest(manifestWithChecksum)).not.toThrow();
    });

    it('should reject manifest with missing version', () => {
      const invalid = { ...validManifest, version: undefined };
      expect(() => MixxMasterValidator.validateManifest(invalid as any)).toThrow('Invalid or missing version');
    });

    it('should reject manifest with missing sessionId', () => {
      const invalid = { ...validManifest, sessionId: undefined };
      expect(() => MixxMasterValidator.validateManifest(invalid as any)).toThrow('Invalid or missing sessionId');
    });

    it('should reject manifest with missing projectId', () => {
      const invalid = { ...validManifest, projectId: undefined };
      expect(() => MixxMasterValidator.validateManifest(invalid as any)).toThrow('Invalid or missing projectId');
    });

    it('should reject manifest with invalid timestamp', () => {
      const invalid = { ...validManifest, createdAt: 'invalid-date' };
      expect(() => MixxMasterValidator.validateManifest(invalid as any)).toThrow('Invalid or missing createdAt timestamp');
    });

    it('should reject manifest with missing audio section', () => {
      const invalid = { ...validManifest, audio: undefined };
      expect(() => MixxMasterValidator.validateManifest(invalid as any)).toThrow('Missing audio section');
    });

    it('should reject manifest with invalid stem data', () => {
      const invalid = {
        ...validManifest,
        audio: {
          ...validManifest.audio,
          vocals: [{ id: 'test', name: '', storagePath: '', sampleRate: -1, bitDepth: 0 }]
        }
      };
      expect(() => MixxMasterValidator.validateManifest(invalid as any)).toThrow();
    });
  });

  describe('calculateChecksum', () => {
    it('should generate consistent checksums for same data', async () => {
      const checksum1 = await MixxMasterValidator.calculateChecksum(validManifest);
      const checksum2 = await MixxMasterValidator.calculateChecksum(validManifest);
      
      expect(checksum1).toBe(checksum2);
      expect(checksum1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
    });

    it('should generate different checksums for different data', async () => {
      const modified = { ...validManifest, projectId: 'different-project' };
      const checksum1 = await MixxMasterValidator.calculateChecksum(validManifest);
      const checksum2 = await MixxMasterValidator.calculateChecksum(modified);
      
      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('verifyChecksum', () => {
    it('should verify valid checksum', async () => {
      const checksum = await MixxMasterValidator.calculateChecksum(validManifest);
      const manifestWithChecksum = { ...validManifest, checksum };
      
      const isValid = await MixxMasterValidator.verifyChecksum(manifestWithChecksum, checksum);
      expect(isValid).toBe(true);
    });

    it('should reject invalid checksum', async () => {
      const checksum = await MixxMasterValidator.calculateChecksum(validManifest);
      const manifestWithChecksum = { ...validManifest, checksum };
      
      const isValid = await MixxMasterValidator.verifyChecksum(manifestWithChecksum, 'invalid-checksum');
      expect(isValid).toBe(false);
    });

    it('should detect tampered data', async () => {
      const checksum = await MixxMasterValidator.calculateChecksum(validManifest);
      const tampered = { ...validManifest, projectId: 'tampered-project', checksum };
      
      const isValid = await MixxMasterValidator.verifyChecksum(tampered, checksum);
      expect(isValid).toBe(false);
    });
  });

  describe('validateVersionNumber', () => {
    it('should accept valid version numbers', () => {
      expect(MixxMasterValidator.validateVersionNumber('1.0')).toBe(true);
      expect(MixxMasterValidator.validateVersionNumber('2.5')).toBe(true);
      expect(MixxMasterValidator.validateVersionNumber('1.0.3')).toBe(true);
    });

    it('should reject invalid version numbers', () => {
      expect(MixxMasterValidator.validateVersionNumber('v1.0')).toBe(false);
      expect(MixxMasterValidator.validateVersionNumber('1')).toBe(false);
      expect(MixxMasterValidator.validateVersionNumber('abc')).toBe(false);
    });
  });

  describe('validateEngineerSignature', () => {
    it('should accept valid base64 signatures', () => {
      expect(MixxMasterValidator.validateEngineerSignature('YWJjMTIz')).toBe(true);
      expect(MixxMasterValidator.validateEngineerSignature('SGVsbG8gV29ybGQ=')).toBe(true);
    });

    it('should reject invalid signatures', () => {
      expect(MixxMasterValidator.validateEngineerSignature('')).toBe(false);
      expect(MixxMasterValidator.validateEngineerSignature('not-base64!')).toBe(false);
    });
  });

  describe('validatePluginChain', () => {
    it('should validate valid plugin chain', () => {
      const validChain = {
        plugins: [
          { id: 'eq-1', name: 'EQ', type: 'equalizer', order: 1, bypass: false, parameters: {} }
        ]
      };
      
      expect(MixxMasterValidator.validatePluginChain(validChain)).toBe(true);
    });

    it('should reject chain with missing required fields', () => {
      const invalidChain = {
        plugins: [
          { id: 'eq-1', name: 'EQ' } // missing type, order, bypass
        ]
      };
      
      expect(MixxMasterValidator.validatePluginChain(invalidChain)).toBe(false);
    });

    it('should reject non-array plugins', () => {
      const invalidChain = { plugins: 'not-an-array' };
      expect(MixxMasterValidator.validatePluginChain(invalidChain)).toBe(false);
    });
  });
});
