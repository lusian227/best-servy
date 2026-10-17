import { useRecordStore } from "../store/recordStore";

export function useRecord(id?: string) {
  const records = useRecordStore(
    (state) => state.records
  );

  const loading = useRecordStore(
    (state) => state.loading
  );

  const error = useRecordStore(
    (state) => state.error
  );

  const load = useRecordStore(
    (state) => state.load
  );

  const createRecord = useRecordStore(
    (state) => state.createRecord
  );

  const updateRecord = useRecordStore(
    (state) => state.updateRecord
  );

  const archive = useRecordStore(
    (state) => state.archive
  );

  const restore = useRecordStore(
    (state) => state.restore
  );

  const uploadFile = useRecordStore(
    (state) => state.uploadFile
  );

  const record = id
    ? records.find((r) => r.id === id) ?? null
    : null;

  return {
    record,
    records,
    loading,
    error,
    load,
    createRecord,
    updateRecord,
    archive,
    restore,
    uploadFile,
  };
}