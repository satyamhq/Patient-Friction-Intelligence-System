import { getMapProvider } from '../providers/maps/index.js';

export interface DistanceMatrixResult {
  distanceKm: number;
  durationMinutes: number;
  isMockMode: boolean;
  originFormatted?: string;
  destinationFormatted?: string;
}

export class GoogleMapsService {
  /**
   * Calculates distance and travel time between two coordinates using the active Map Provider
   * (Defaults to OpenStreetMap Nominatim/Haversine, zero proprietary API key required)
   */
  public static async calculateDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<DistanceMatrixResult> {
    const provider = getMapProvider();
    const result = await provider.calculateDistance(originLat, originLng, destLat, destLng);

    return {
      distanceKm: result.distanceKm,
      durationMinutes: result.durationMinutes,
      isMockMode: result.provider === 'haversine' || result.provider === 'openstreetmap',
      originFormatted: result.originFormatted,
      destinationFormatted: result.destinationFormatted,
    };
  }
}

