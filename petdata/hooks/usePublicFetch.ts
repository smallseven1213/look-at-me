// src/hooks/usePublicFetch.ts
import useSWR from 'swr';
import { apiClient } from '../services/apiClient';
import { ApiResponse } from '../types/api';

// 基於 SWR 的 fetcher，使用 apiClient 並跳過 token
const publicFetcher = async <T>(url: string): Promise<T> => {
  const response: ApiResponse<T> = await apiClient.get(url, {
    headers: { 'Skip-Auth': true },
  });
  return response.data;
};

export const usePublicFetch = <T>(url: string | null) => {
  const { data, error, mutate } = useSWR<T>(url, publicFetcher);
  return {
    data,
    isLoading: !error && !data,
    error,
    mutate,
  };
};
