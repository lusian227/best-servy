export interface IStorageService {
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}

export class StorageService implements IStorageService {
  constructor(private provider: "s3" | "azure" | "cloudinary") {}

  async upload(file: File, path: string): Promise<string> {
    throw new Error("Not implemented");
  }

  async download(path: string): Promise<Buffer> {
    throw new Error("Not implemented");
  }

  async delete(path: string): Promise<void> {
    throw new Error("Not implemented");
  }

  getUrl(path: string): string {
    throw new Error("Not implemented");
  }
}
