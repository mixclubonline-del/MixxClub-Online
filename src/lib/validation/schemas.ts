import { z } from 'zod';

// Project validation schemas
export const projectSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  genre: z.string().trim().min(1, 'Genre is required'),
  deadline: z.string().optional(),
  budget: z.number().min(0, 'Budget must be positive').optional(),
});

// User profile validation
export const profileSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  bio: z.string()
    .trim()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),
  website: z.string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  social_links: z.record(z.string(), z.string().url('Invalid URL format')).optional(),
});

// Message validation
export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be less than 5000 characters'),
  recipient_id: z.string().uuid('Invalid recipient'),
});

// Comment validation
export const commentSchema = z.object({
  comment_text: z.string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be less than 2000 characters'),
  timestamp_seconds: z.number().min(0, 'Invalid timestamp'),
});

// Payment validation
export const paymentSchema = z.object({
  amount: z.number()
    .min(1, 'Amount must be at least $1')
    .max(100000, 'Amount cannot exceed $100,000'),
  project_id: z.string().uuid('Invalid project ID'),
});

// File upload validation
export const fileUploadSchema = z.object({
  file_name: z.string()
    .trim()
    .min(1, 'File name is required')
    .max(255, 'File name is too long')
    .regex(/^[a-zA-Z0-9-_. ]+$/, 'File name contains invalid characters'),
  file_size: z.number()
    .max(500 * 1024 * 1024, 'File size cannot exceed 500MB'),
  file_type: z.string()
    .regex(/^(audio|video|application)\//,'Invalid file type'),
});

// Job posting validation
export const jobPostingSchema = z.object({
  title: z.string()
    .trim()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  budget_min: z.number().min(0, 'Budget must be positive'),
  budget_max: z.number().min(0, 'Budget must be positive'),
  required_skills: z.array(z.string()).min(1, 'At least one skill required'),
}).refine(data => data.budget_max >= data.budget_min, {
  message: 'Maximum budget must be greater than minimum',
  path: ['budget_max'],
});

// Email validation (stricter than default)
export const emailSchema = z.string()
  .trim()
  .email('Invalid email address')
  .max(255, 'Email is too long')
  .refine(email => {
    // Additional checks for common typos
    const parts = email.split('@');
    return parts.length === 2 && parts[1].includes('.');
  }, 'Invalid email format');

// URL validation with allowlist
const allowedDomains = ['youtube.com', 'soundcloud.com', 'spotify.com', 'instagram.com', 'twitter.com', 'x.com'];

export const socialUrlSchema = z.string()
  .url('Invalid URL')
  .refine(url => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return allowedDomains.some(allowed => domain.includes(allowed));
    } catch {
      return false;
    }
  }, 'URL must be from an approved platform');

// Search query validation (prevent injection)
export const searchQuerySchema = z.string()
  .trim()
  .min(1, 'Search query cannot be empty')
  .max(200, 'Search query is too long')
  .regex(/^[a-zA-Z0-9 \-_]+$/, 'Search contains invalid characters');
