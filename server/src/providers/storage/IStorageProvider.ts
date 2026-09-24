export interface UploadResult {
  url: string;
  key: string;
  sizeBytes: number;
  mimeType: string;
  provider: 'local' | 'minio' | 's3';
}

export interface IStorageProvider {
  readonly name: string;
  saveFile(
    filename: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<UploadResult>;
  getFile(key: string): Promise<Buffer | null>;
  deleteFile(key: string): Promise<boolean>;
}
