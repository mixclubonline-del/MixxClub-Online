import { MixxMasterManifest, MixxMasterError, AudioStem } from './types';
import { MixxMasterValidator } from './validator';

/**
 * Parses and extracts data from MixxMaster.tsx packages
 */
export class MixxMasterParser {
  /**
   * Parse uploaded MixxMaster package
   */
  static async parsePackage(manifestJSON: string): Promise<MixxMasterManifest> {
    let manifest: any;

    try {
      manifest = JSON.parse(manifestJSON);
    } catch (error) {
      throw new MixxMasterError(
        'Invalid JSON format',
        'PARSE_ERROR',
        { originalError: error }
      );
    }

    // Validate structure
    MixxMasterValidator.validateManifest(manifest);

    // Verify checksum
    const { checksum, ...manifestWithoutChecksum } = manifest;
    const isValid = await MixxMasterValidator.verifyChecksum(manifestWithoutChecksum, checksum);

    if (!isValid) {
      throw new MixxMasterError(
        'Checksum verification failed - manifest may be corrupted',
        'CHECKSUM_MISMATCH'
      );
    }

    return manifest;
  }

  /**
   * Extract audio stems from manifest
   */
  static extractStems(manifest: MixxMasterManifest): AudioStem[] {
    const { vocals, drums, instruments, fx } = manifest.audio;
    return [...vocals, ...drums, ...instruments, ...fx];
  }

  /**
   * Extract stems by category
   */
  static extractStemsByCategory(
    manifest: MixxMasterManifest,
    category: 'vocals' | 'drums' | 'instruments' | 'fx'
  ): AudioStem[] {
    return manifest.audio[category];
  }

  /**
   * Get session metadata
   */
  static getMetadata(manifest: MixxMasterManifest) {
    return manifest.metadata;
  }

  /**
   * Get AI analysis data
   */
  static getAIAnalysis(manifest: MixxMasterManifest) {
    return manifest.sessionData.aiAnalysis;
  }

  /**
   * Get plugin chain data
   */
  static getPluginChains(manifest: MixxMasterManifest) {
    return manifest.sessionData.mixChain;
  }

  /**
   * Get routing configuration
   */
  static getRouting(manifest: MixxMasterManifest) {
    return manifest.sessionData.routing;
  }

  /**
   * Get tempo map
   */
  static getTempoMap(manifest: MixxMasterManifest) {
    return manifest.sessionData.tempoMap;
  }

  /**
   * Get version history
   */
  static getVersionHistory(manifest: MixxMasterManifest) {
    return manifest.metadata.versionHistory;
  }

  /**
   * Get latest version number
   */
  static getLatestVersion(manifest: MixxMasterManifest): number {
    const versions = manifest.metadata.versionHistory;
    return versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) : 0;
  }

  /**
   * Compare two manifests and generate diff
   */
  static generateDiff(oldManifest: MixxMasterManifest, newManifest: MixxMasterManifest) {
    const oldStems = this.extractStems(oldManifest);
    const newStems = this.extractStems(newManifest);

    const oldStemIds = new Set(oldStems.map(s => s.id));
    const newStemIds = new Set(newStems.map(s => s.id));

    const added = newStems.filter(s => !oldStemIds.has(s.id)).map(s => s.name);
    const removed = oldStems.filter(s => !newStemIds.has(s.id)).map(s => s.name);

    const modified = newStems
      .filter(s => oldStemIds.has(s.id))
      .filter(newStem => {
        const oldStem = oldStems.find(s => s.id === newStem.id);
        return oldStem && JSON.stringify(oldStem) !== JSON.stringify(newStem);
      })
      .map(s => s.name);

    // Plugin changes
    const oldChains = oldManifest.sessionData.mixChain.chains;
    const newChains = newManifest.sessionData.mixChain.chains;

    const pluginChanges = this.comparePluginChains(oldChains, newChains);

    return {
      added,
      modified,
      removed,
      pluginChanges,
      routingChanges: this.compareRouting(
        oldManifest.sessionData.routing,
        newManifest.sessionData.routing
      ),
    };
  }

  /**
   * Compare plugin chains
   */
  private static comparePluginChains(oldChains: any[], newChains: any[]) {
    const changes: any[] = [];

    newChains.forEach(newChain => {
      const oldChain = oldChains.find(c => c.trackName === newChain.trackName);

      if (!oldChain) {
        changes.push({
          track: newChain.trackName,
          action: 'added',
          plugin: 'entire_chain',
        });
        return;
      }

      newChain.plugins.forEach((newPlugin: any) => {
        const oldPlugin = oldChain.plugins.find((p: any) => p.id === newPlugin.id);

        if (!oldPlugin) {
          changes.push({
            track: newChain.trackName,
            action: 'added',
            plugin: newPlugin.name,
          });
        } else if (JSON.stringify(oldPlugin) !== JSON.stringify(newPlugin)) {
          changes.push({
            track: newChain.trackName,
            action: 'modified',
            plugin: newPlugin.name,
            parameterChanges: this.comparePluginParameters(oldPlugin, newPlugin),
          });
        }
      });

      oldChain.plugins.forEach((oldPlugin: any) => {
        if (!newChain.plugins.find((p: any) => p.id === oldPlugin.id)) {
          changes.push({
            track: newChain.trackName,
            action: 'removed',
            plugin: oldPlugin.name,
          });
        }
      });
    });

    return changes;
  }

  /**
   * Compare plugin parameters
   */
  private static comparePluginParameters(oldPlugin: any, newPlugin: any) {
    const changes: Record<string, { old: any; new: any }> = {};

    Object.keys(newPlugin.parameters).forEach(key => {
      if (oldPlugin.parameters[key] !== newPlugin.parameters[key]) {
        changes[key] = {
          old: oldPlugin.parameters[key],
          new: newPlugin.parameters[key],
        };
      }
    });

    return changes;
  }

  /**
   * Compare routing configurations
   */
  private static compareRouting(oldRouting: any, newRouting: any): string[] {
    const changes: string[] = [];

    if (oldRouting.buses.length !== newRouting.buses.length) {
      changes.push(`Bus count changed: ${oldRouting.buses.length} → ${newRouting.buses.length}`);
    }

    if (oldRouting.auxSends.length !== newRouting.auxSends.length) {
      changes.push(`Aux sends changed: ${oldRouting.auxSends.length} → ${newRouting.auxSends.length}`);
    }

    return changes;
  }

  /**
   * Validate package integrity
   */
  static async validatePackage(manifest: MixxMasterManifest): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      MixxMasterValidator.validateManifest(manifest);
    } catch (error: any) {
      if (error.details?.errors) {
        errors.push(...error.details.errors);
      } else {
        errors.push(error.message);
      }
    }

    // Check for missing stems
    const stems = this.extractStems(manifest);
    if (stems.length === 0) {
      errors.push('No audio stems found in package');
    }

    // Verify AI analysis exists
    if (!manifest.sessionData.aiAnalysis || manifest.sessionData.aiAnalysis.confidenceScore === 0) {
      errors.push('AI analysis data is missing or incomplete');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
