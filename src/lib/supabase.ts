// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing! Check your .env file.');
}

// ✅ FIXED: Add autoRefreshToken and persistSession options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage, // Persist session in localStorage
  },
});

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

// ✅ FIXED: Accept URL and key parameters, return object with success and message
export async function testSupabaseConnection(
  url?: string,
  key?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Use provided credentials or fallback to env
    const testUrl = url || supabaseUrl;
    const testKey = key || supabaseAnonKey;

    if (!testUrl || !testKey) {
      return {
        success: false,
        message: 'Missing Supabase URL or API key. Please check your .env file.',
      };
    }

    // Create a test client with the provided credentials
    const testClient = createClient(testUrl, testKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });

    // Test the connection
    const { error } = await testClient.from('records').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }

    console.log('✅ Supabase connected successfully!');
    return {
      success: true,
      message: 'Connection successful!',
    };
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// ✅ FIXED: getSupabaseClient function
export function getSupabaseClient() {
  return supabase;
}

// Helper function to get record file URL
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