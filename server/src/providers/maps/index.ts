import { IMapProvider } from './IMapProvider.js';
import { OpenStreetMapProvider } from './OpenStreetMapProvider.js';
import { GoogleMapsProvider } from './GoogleMapsProvider.js';
import { config } from '../../config/env.js';

let activeMapProvider: IMapProvider | null = null;

export const getMapProvider = (): IMapProvider => {
  if (!activeMapProvider) {
    if (config.mapProvider === 'google' && config.googleMapsApiKey) {
      activeMapProvider = new GoogleMapsProvider(config.googleMapsApiKey);
    } else {
      activeMapProvider = new OpenStreetMapProvider();
    }
  }
  return activeMapProvider;
};

export * from './IMapProvider.js';
export * from './OpenStreetMapProvider.js';
export * from './GoogleMapsProvider.js';
