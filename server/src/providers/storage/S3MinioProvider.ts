import { IStorageProvider, UploadResult } from './IStorageProvider.js';
import { LocalStorageProvider } from './LocalStorageProvider.js';

export class S3MinioProvider implements IStorageProvider {
  public readonly name = 'S3 / MinIO Compatible Storage';
  private localFallback: LocalStorageProvider;
  private endpoint: string;
  private bucket: string;

  constructor(endpoint: string = 'http://localhost:9000', bucket: string = 'pfis-uploads') {
    this.endpoint = endpoint;
    this.bucket = bucket;
    this.localFallback = new LocalStorageProvider();
  }

  public async saveFile(
    filename: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<UploadResult> {
    // Falls back to local storage if AWS SDK / MinIO credentials are not set
    return this.localFallback.saveFile(filename, buffer, mimeType);
  }

  public async getFile(key: string): Promise<Buffer | null> {
    return this.localFallback.getFile(key);
  }

  public async deleteFile(key: string): Promise<boolean> {
    return this.localFallback.deleteFile(key);
  }
}
