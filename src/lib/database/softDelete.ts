import { supabase } from '@/integrations/supabase/client';

/**
 * Soft delete utilities for managing deleted records
 */

export type SoftDeletableTable = 
  | 'profiles' 
  | 'projects' 
  | 'audio_files' 
  | 'job_postings' 
  | 'engineer_profiles';

/**
 * Soft delete a record by setting deleted_at timestamp
 */
export async function softDeleteRecord(
  tableName: SoftDeletableTable,
  recordId: string
) {
  const { data, error } = await supabase.rpc('soft_delete' as any, {
    table_name: tableName,
    record_id: recordId
  });

  if (error) throw error;
  return data;
}

/**
 * Restore a soft-deleted record by clearing deleted_at
 */
export async function restoreRecord(
  tableName: SoftDeletableTable,
  recordId: string
) {
  const { data, error } = await supabase.rpc('restore_deleted' as any, {
    table_name: tableName,
    record_id: recordId
  });

  if (error) throw error;
  return data;
}

/**
 * Permanently delete records that have been soft-deleted for more than specified days
 */
export async function purgeOldDeletedRecords(
  tableName: SoftDeletableTable,
  daysOld: number = 90
) {
  const { data, error } = await supabase.rpc('purge_old_deleted_records' as any, {
    table_name: tableName,
    days_old: daysOld
  });

  if (error) throw error;
  return data;
}

/**
 * Query builder that automatically excludes soft-deleted records
 * Note: This is a helper utility. Apply the filter directly in your queries like:
 * .is('deleted_at', null)
 */
export function getActiveRecordsFilter() {
  return { deleted_at: null };
}

/**
 * Query builder that only returns soft-deleted records
 * Note: This is a helper utility. Apply the filter directly in your queries like:
 * .not('deleted_at', 'is', null)
 */
export function getDeletedRecordsFilter() {
  return 'deleted_at IS NOT NULL';
}

/**
 * Check if a table supports soft deletes
 */
export function supportsSoftDelete(tableName: string): tableName is SoftDeletableTable {
  const softDeletableTables: SoftDeletableTable[] = [
    'profiles',
    'projects',
    'audio_files',
    'job_postings',
    'engineer_profiles'
  ];
  return softDeletableTables.includes(tableName as SoftDeletableTable);
}
