import { useState, useEffect } from 'react';
import { Service } from '../services/Service';

export function use(id?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const service = new Service();

  // ✅ Helper to ensure id exists
  const requireId = (): string => {
    if (!id) {
      throw new Error('ID is required for this operation');
    }
    return id;
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) {
      setError(new Error('ID is required to fetch data'));
      return;
    }

    try {
      setLoading(true);
      const result = await service.findOne(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const create = async (input: any) => {
    try {
      setLoading(true);
      const result = await service.create(input);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (input: any) => {
    try {
      // ✅ Check id before using it
      const idValue = requireId();
      setLoading(true);
      const result = await service.update(idValue, input);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    try {
      // ✅ Check id before using it
      const idValue = requireId();
      setLoading(true);
      await service.delete(idValue);
      setData(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    create,
    update,
    delete: remove,
    refetch: fetchData
  };
}