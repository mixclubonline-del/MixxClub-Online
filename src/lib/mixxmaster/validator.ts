import { MixxMasterManifest, MixxMasterError } from './types';

/**
 * Validates MixxMaster.tsx manifest structure and integrity
 */
export class MixxMasterValidator {
  /**
   * Validate complete manifest structure
   */
  static validateManifest(manifest: any): manifest is MixxMasterManifest {
    const errors: string[] = [];

    // Version check
    if (!manifest.version || typeof manifest.version !== 'string') {
      errors.push('Invalid or missing version');
    }

    // Required IDs
    if (!manifest.sessionId || typeof manifest.sessionId !== 'string') {
      errors.push('Invalid or missing sessionId');
    }
    if (!manifest.projectId || typeof manifest.projectId !== 'string') {
      errors.push('Invalid or missing projectId');
    }

    // Timestamps
    if (!manifest.createdAt || !this.isValidTimestamp(manifest.createdAt)) {
      errors.push('Invalid or missing createdAt timestamp');
    }
    if (!manifest.updatedAt || !this.isValidTimestamp(manifest.updatedAt)) {
      errors.push('Invalid or missing updatedAt timestamp');
    }

    // Audio structure
    if (!manifest.audio || typeof manifest.audio !== 'object') {
      errors.push('Missing audio section');
    } else {
      const audioErrors = this.validateAudioCollection(manifest.audio);
      errors.push(...audioErrors);
    }

    // Session data
    if (!manifest.sessionData || typeof manifest.sessionData !== 'object') {
      errors.push('Missing sessionData section');
    }

    // Metadata
    if (!manifest.metadata || typeof manifest.metadata !== 'object') {
      errors.push('Missing metadata section');
    }

    // Checksum
    if (!manifest.checksum || typeof manifest.checksum !== 'string') {
      errors.push('Invalid or missing checksum');
    }

    if (errors.length > 0) {
      throw new MixxMasterError(
        'Manifest validation failed',
        'VALIDATION_ERROR',
        { errors }
      );
    }

    return true;
  }

  /**
   * Validate audio stem collection structure
   */
  private static validateAudioCollection(audio: any): string[] {
    const errors: string[] = [];
    const requiredCategories = ['vocals', 'drums', 'instruments', 'fx'];

    for (const category of requiredCategories) {
      if (!Array.isArray(audio[category])) {
        errors.push(`Invalid ${category} array in audio collection`);
      } else {
        audio[category].forEach((stem: any, index: number) => {
          const stemErrors = this.validateAudioStem(stem, category, index);
          errors.push(...stemErrors);
        });
      }
    }

    return errors;
  }

  /**
   * Validate individual audio stem
   */
  private static validateAudioStem(stem: any, category: string, index: number): string[] {
    const errors: string[] = [];
    const prefix = `${category}[${index}]`;

    if (!stem.id || typeof stem.id !== 'string') {
      errors.push(`${prefix}: Missing or invalid stem ID`);
    }
    if (!stem.name || typeof stem.name !== 'string') {
      errors.push(`${prefix}: Missing or invalid stem name`);
    }
    if (!stem.storagePath || typeof stem.storagePath !== 'string') {
      errors.push(`${prefix}: Missing or invalid storage path`);
    }
    if (typeof stem.sampleRate !== 'number' || stem.sampleRate <= 0) {
      errors.push(`${prefix}: Invalid sample rate`);
    }
    if (typeof stem.bitDepth !== 'number' || stem.bitDepth <= 0) {
      errors.push(`${prefix}: Invalid bit depth`);
    }

    return errors;
  }

  /**
   * Verify checksum integrity
   */
  static async verifyChecksum(manifest: MixxMasterManifest, providedChecksum: string): Promise<boolean> {
    const calculatedChecksum = await this.calculateChecksum(manifest);
    return calculatedChecksum === providedChecksum;
  }

  /**
   * Calculate AES-256 checksum for manifest
   */
  static async calculateChecksum(manifest: Omit<MixxMasterManifest, 'checksum'>): Promise<string> {
    const manifestString = JSON.stringify(manifest, Object.keys(manifest).sort());
    const encoder = new TextEncoder();
    const data = encoder.encode(manifestString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Validate version number format
   */
  static validateVersionNumber(version: string): boolean {
    const versionRegex = /^\d+\.\d+(\.\d+)?$/;
    return versionRegex.test(version);
  }

  /**
   * Validate engineer signature
   */
  static validateEngineerSignature(signature: string): boolean {
    // Signature should be a base64-encoded string
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return signature.length > 0 && base64Regex.test(signature);
  }

  /**
   * Validate timestamp format
   */
  private static isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }

  /**
   * Validate plugin chain structure
   */
  static validatePluginChain(chain: any): boolean {
    if (!Array.isArray(chain.plugins)) {
      return false;
    }

    for (const plugin of chain.plugins) {
      if (!plugin.id || !plugin.name || !plugin.type) {
        return false;
      }
      if (typeof plugin.order !== 'number') {
        return false;
      }
      if (typeof plugin.bypass !== 'boolean') {
        return false;
      }
    }

    return true;
  }
}
