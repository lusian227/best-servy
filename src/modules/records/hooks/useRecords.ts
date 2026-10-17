import { useEffect } from "react";

import {
  useRecordStore,
} from "../store/recordStore";

import type {
  RecordSearchFilters,
} from "../domain";

export function useRecords(
  filters?: RecordSearchFilters
) {
  const store = useRecordStore();

  useEffect(() => {
    void store.load(filters);
  }, [
    filters?.workspaceId,
    filters?.projectId,
    filters?.ownerType,
    filters?.ownerId,
    filters?.category,
    filters?.discipline,
    filters?.status,
    filters?.searchTerm,
  ]);

  return store;
}
