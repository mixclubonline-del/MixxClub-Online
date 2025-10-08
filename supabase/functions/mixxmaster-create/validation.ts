// Input validation without external dependencies

/**
 * Input validation schemas for mixxmaster-create endpoint
 */

export interface StemInput {
  name: string;
  storagePath: string;
  fileSize: number;
}

export interface Metadata {
  artist?: string;
  projectName?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  tags?: string[];
  notes?: string;
}

export interface SessionData {
  mixChains?: Record<string, any>;
  routing?: {
    buses?: any[];
    auxSends?: any[];
  };
  tempoMap?: {
    bpm: number;
    timeSignature: string;
    markers?: any[];
  };
}

export interface CreateSessionInput {
  project_id: string;
  stems: StemInput[];
  metadata?: Metadata;
  sessionData?: SessionData;
}

/**
 * Validate stem input
 */
function validateStem(stem: any): string[] {
  const errors: string[] = [];
  
  if (!stem.name || typeof stem.name !== 'string') {
    errors.push('Stem name is required');
  } else if (stem.name.length > 255) {
    errors.push('Stem name too long (max 255 characters)');
  }
  
  if (!stem.storagePath || typeof stem.storagePath !== 'string') {
    errors.push('Storage path is required');
  } else if (!/^[\w\-\/\.]+$/.test(stem.storagePath)) {
    errors.push('Invalid storage path format');
  }
  
  if (typeof stem.fileSize !== 'number' || stem.fileSize <= 0) {
    errors.push('Valid file size is required');
  } else if (stem.fileSize > 1073741824) {
    errors.push('File size cannot exceed 1GB');
  }
  
  return errors;
}

/**
 * Validate and sanitize input
 */
export function validateCreateSessionInput(input: unknown): CreateSessionInput {
  const errors: string[] = [];
  
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input: expected object');
  }
  
  const data = input as any;
  
  // Validate project_id
  if (!data.project_id || typeof data.project_id !== 'string') {
    errors.push('project_id is required');
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.project_id)) {
    errors.push('Invalid project ID format');
  }
  
  // Validate stems
  if (!Array.isArray(data.stems)) {
    errors.push('stems must be an array');
  } else if (data.stems.length === 0) {
    errors.push('At least one stem is required');
  } else if (data.stems.length > 200) {
    errors.push('Maximum 200 stems allowed');
  } else {
    data.stems.forEach((stem: any, index: number) => {
      const stemErrors = validateStem(stem);
      stemErrors.forEach(err => errors.push(`Stem ${index + 1}: ${err}`));
    });
  }
  
  // Validate metadata (optional)
  if (data.metadata) {
    if (data.metadata.bpm && (typeof data.metadata.bpm !== 'number' || data.metadata.bpm < 20 || data.metadata.bpm > 300)) {
      errors.push('BPM must be between 20 and 300');
    }
    if (data.metadata.tags && (!Array.isArray(data.metadata.tags) || data.metadata.tags.length > 20)) {
      errors.push('Maximum 20 tags allowed');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  return data as CreateSessionInput;
}

/**
 * Security checks
 */
export async function validateProjectAccess(
  supabaseClient: any,
  userId: string,
  projectId: string
): Promise<void> {
  const { data: project, error } = await supabaseClient
    .from('projects')
    .select('client_id, engineer_id')
    .eq('id', projectId)
    .single();

  if (error || !project) {
    throw new Error('Project not found');
  }

  const hasAccess = project.client_id === userId || project.engineer_id === userId;
  
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this project');
  }
}

/**
 * Rate limiting check
 */
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetAt: number }>();
  
  static check(userId: string, limit: number = 10, windowMs: number = 60000): void {
    const now = Date.now();
    const userRecord = this.requests.get(userId);
    
    if (!userRecord || now > userRecord.resetAt) {
      this.requests.set(userId, { count: 1, resetAt: now + windowMs });
      return;
    }
    
    if (userRecord.count >= limit) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    userRecord.count++;
  }
  
  static cleanup(): void {
    const now = Date.now();
    for (const [userId, record] of this.requests.entries()) {
      if (now > record.resetAt) {
        this.requests.delete(userId);
      }
    }
  }
}

// Cleanup old rate limit records every 5 minutes
setInterval(() => RateLimiter.cleanup(), 300000);
