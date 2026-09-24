export interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
  provider: 'openstreetmap' | 'google' | 'haversine';
  originFormatted?: string;
  destinationFormatted?: string;
}

export interface GeocodeResult {
  city: string;
  state: string;
  displayName: string;
  pincode: string;
  lat: number;
  lng: number;
}

export interface NearbyFacility {
  name: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Government' | 'Private' | 'Charitable' | 'Autonomous';
  isEmergency: boolean;
  distanceKm?: number;
}

export interface IMapProvider {
  name: string;
  calculateDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<DistanceResult>;
  reverseGeocode(lat: number, lng: number): Promise<GeocodeResult>;
  discoverFacilities(lat: number, lng: number, radiusKm?: number): Promise<NearbyFacility[]>;
}
