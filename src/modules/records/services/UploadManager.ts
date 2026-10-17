import type {
  CreateRecordInput,
} from "../domain/EngineeringRecord";

export interface UploadResult {
  storageUrl: string;
  filename: string;
  size: number;
  mimeType: string;
}

export class UploadManager {
  async upload(
    file: File,
    _input?: CreateRecordInput
  ): Promise<UploadResult> {
    return {
      storageUrl: URL.createObjectURL(file),
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    };
  }
}

export default UploadManager;
