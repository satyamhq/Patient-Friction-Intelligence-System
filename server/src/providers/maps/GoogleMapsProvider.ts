import axios from 'axios';
import { IMapProvider, DistanceResult, GeocodeResult, NearbyFacility } from './IMapProvider.js';
import { OpenStreetMapProvider } from './OpenStreetMapProvider.js';

export class GoogleMapsProvider implements IMapProvider {
  public readonly name = 'GoogleMaps';
  private apiKey: string;
  private fallbackOsm: OpenStreetMapProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
    this.fallbackOsm = new OpenStreetMapProvider();
  }

  public async calculateDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<DistanceResult> {
    if (!this.apiKey) {
      return this.fallbackOsm.calculateDistance(originLat, originLng, destLat, destLng);
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 3500 });
      const data = response.data;

      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distanceKm: parseFloat((element.distance.value / 1000).toFixed(1)),
          durationMinutes: Math.round(element.duration.value / 60),
          provider: 'google',
          originFormatted: data.origin_addresses?.[0],
          destinationFormatted: data.destination_addresses?.[0],
        };
      }
    } catch {
      // Graceful fallback to OpenStreetMap Haversine
    }

    return this.fallbackOsm.calculateDistance(originLat, originLng, destLat, destLng);
  }

  public async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    return this.fallbackOsm.reverseGeocode(lat, lng);
  }

  public async discoverFacilities(
    lat: number,
    lng: number,
    radiusKm: number = 25
  ): Promise<NearbyFacility[]> {
    if (!this.apiKey) {
      return this.fallbackOsm.discoverFacilities(lat, lng, radiusKm);
    }

    try {
      const radiusMeters = Math.min(radiusKm * 1000, 50000);
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=hospital&key=${this.apiKey}`;
      const res = await axios.get(url, { timeout: 4000 });

      if (res.data?.status === 'OK' && Array.isArray(res.data.results)) {
        const places: NearbyFacility[] = [];
        for (const item of res.data.results) {
          const name = item.name;
          const isGovt = /civil|govt|government|aiims|pgi|district|esi|chc|phc/i.test(name);
          places.push({
            name,
            lat: item.geometry.location.lat,
            lng: item.geometry.location.lng,
            address: item.vicinity || item.formatted_address || name,
            city: 'Local Area',
            state: 'State',
            pincode: '144401',
            type: isGovt ? 'Government' : 'Private',
            isEmergency: true,
          });
        }
        if (places.length > 0) return places;
      }
    } catch {
      // Fall through to OpenStreetMap
    }

    return this.fallbackOsm.discoverFacilities(lat, lng, radiusKm);
  }
}
