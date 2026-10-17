// src/modules/records/hooks/useRecords.ts

import { useState, useEffect, useCallback } from 'react';
import { api, ApiResponse, PaginatedResponse } from './apiClient';
import { EngineeringRecord } from "../../../domain/records/EngineeringRecord";

export interface UseRecordsOptions {
  projectId?: string;
  category?: string;
  status?: string;
  discipline?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
}

export interface UseRecordsReturn {
  records: EngineeringRecord[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  fetchRecords: (options?: UseRecordsOptions) => Promise<void>;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useRecords(initialOptions: UseRecordsOptions = {}): UseRecordsReturn {
  const [records, setRecords] = useState<EngineeringRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [options, setOptions] = useState<UseRecordsOptions>({
    limit: 50,
    offset: 0,
    autoFetch: true,
    ...initialOptions,
  });

  const fetchRecords = useCallback(async (newOptions?: UseRecordsOptions) => {
    const fetchOptions = newOptions ? { ...options, ...newOptions } : options;
    setOptions(fetchOptions);

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (fetchOptions.projectId) queryParams.append('projectId', fetchOptions.projectId);
      if (fetchOptions.category) queryParams.append('category', fetchOptions.category);
      if (fetchOptions.status) queryParams.append('status', fetchOptions.status);
      if (fetchOptions.discipline) queryParams.append('discipline', fetchOptions.discipline);
      if (fetchOptions.searchTerm) queryParams.append('searchTerm', fetchOptions.searchTerm);
      if (fetchOptions.limit) queryParams.append('limit', fetchOptions.limit.toString());
      if (fetchOptions.offset) queryParams.append('offset', fetchOptions.offset.toString());

      const url = '/records?' + queryParams.toString();
      const response = await api.get<PaginatedResponse<EngineeringRecord>>(url);

      if (response.success && response.data) {
        setRecords(response.data);
        setTotal(response.pagination?.total || 0);
        setHasMore(response.pagination?.hasMore || false);
      } else {
        setError(response.error || 'Failed to fetch records');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [options]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    const newOffset = (options.offset || 0) + (options.limit || 50);
    await fetchRecords({ ...options, offset: newOffset });
  }, [hasMore, loading, options, fetchRecords]);

  const refetch = useCallback(async () => {
    await fetchRecords({ ...options, offset: 0 });
  }, [fetchRecords, options]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchRecords();
    }
  }, []);

  return {
    records,
    loading,
    error,
    total,
    hasMore,
    fetchRecords,
    loadMore,
    refetch,
  };
}
