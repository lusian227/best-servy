// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing! Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('records').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

// ✅ Helper function to get record file URL
export function getRecordFileUrl(record: any): string | null {
  if (!record) return null;

  // If the record has a storageUrl, use it
  if (record.storageUrl) {
    // Check if it's already a full URL
    if (record.storageUrl.startsWith('http://') || record.storageUrl.startsWith('https://')) {
      return record.storageUrl;
    }

    // If it's a relative path starting with /uploads/
    if (record.storageUrl.startsWith('/uploads/')) {
      // For local development, return as-is
      return record.storageUrl;
    }

    // Try to construct a full URL from the storageUrl
    try {
      const url = new URL(record.storageUrl, window.location.origin);
      return url.toString();
    } catch {
      return record.storageUrl;
    }
  }

  // If no storageUrl but has fileId, try to get from Supabase storage
  if (record.fileId) {
    try {
      const bucketName = record.category?.toLowerCase() || 'documents';
      const { data } = supabase.storage.from(bucketName).getPublicUrl(record.fileId);
      return data?.publicUrl || null;
    } catch (error) {
      console.error('❌ Error getting storage URL for fileId:', record.fileId, error);
      return null;
    }
  }

  return null;
}