import { MixxMasterError } from './types';

/**
 * Handles encryption and security for MixxMaster.tsx sessions
 */
export class MixxMasterEncryptor {
  /**
   * Generate engineer signature for version authentication
   */
  static async generateEngineerSignature(
    engineerId: string,
    sessionId: string,
    versionNumber: number,
    timestamp: string
  ): Promise<string> {
    const signatureData = `${engineerId}:${sessionId}:${versionNumber}:${timestamp}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureData);
    
    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Convert to base64
    return btoa(hashHex);
  }

  /**
   * Verify engineer signature
   */
  static async verifyEngineerSignature(
    signature: string,
    engineerId: string,
    sessionId: string,
    versionNumber: number,
    timestamp: string
  ): Promise<boolean> {
    try {
      const expectedSignature = await this.generateEngineerSignature(
        engineerId,
        sessionId,
        versionNumber,
        timestamp
      );
      return signature === expectedSignature;
    } catch (error) {
      return false;
    }
  }

  /**
   * Encrypt sensitive session data
   */
  static async encryptSessionData(
    data: string,
    password: string
  ): Promise<{ encrypted: string; iv: string; salt: string }> {
    try {
      const encoder = new TextEncoder();
      
      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Derive key from password
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      // Encrypt data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encoder.encode(data)
      );
      
      // Convert to base64
      const encryptedArray = Array.from(new Uint8Array(encryptedData));
      const encrypted = btoa(String.fromCharCode(...encryptedArray));
      
      const ivBase64 = btoa(String.fromCharCode(...Array.from(iv)));
      const saltBase64 = btoa(String.fromCharCode(...Array.from(salt)));
      
      return {
        encrypted,
        iv: ivBase64,
        salt: saltBase64,
      };
    } catch (error) {
      throw new MixxMasterError(
        'Encryption failed',
        'ENCRYPTION_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Decrypt session data
   */
  static async decryptSessionData(
    encrypted: string,
    iv: string,
    salt: string,
    password: string
  ): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // Convert from base64
      const encryptedData = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
      const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
      const saltArray = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
      
      // Derive key from password
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltArray,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      // Decrypt data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivArray,
        },
        key,
        encryptedData
      );
      
      return decoder.decode(decryptedData);
    } catch (error) {
      throw new MixxMasterError(
        'Decryption failed',
        'DECRYPTION_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Generate secure session ID
   */
  static generateSecureSessionId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash sensitive data (one-way)
   */
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify data integrity
   */
  static async verifyIntegrity(data: string, expectedHash: string): Promise<boolean> {
    const actualHash = await this.hashData(data);
    return actualHash === expectedHash;
  }
}
