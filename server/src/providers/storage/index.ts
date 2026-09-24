import { IStorageProvider } from './IStorageProvider.js';
import { LocalStorageProvider } from './LocalStorageProvider.js';
import { S3MinioProvider } from './S3MinioProvider.js';
import { config } from '../../config/env.js';

let activeStorageProvider: IStorageProvider | null = null;

export const getStorageProvider = (): IStorageProvider => {
  if (!activeStorageProvider) {
    if (config.storageProvider === 'minio' || config.storageProvider === 's3') {
      activeStorageProvider = new S3MinioProvider();
    } else {
      activeStorageProvider = new LocalStorageProvider();
    }
  }
  return activeStorageProvider;
};

export * from './IStorageProvider.js';
export * from './LocalStorageProvider.js';
export * from './S3MinioProvider.js';
