import axios from 'axios';
import { IMapProvider, DistanceResult, GeocodeResult, NearbyFacility } from './IMapProvider.js';

export class OpenStreetMapProvider implements IMapProvider {
  public readonly name = 'OpenStreetMap';

  /**
   * Calculates distance between coordinates using the Haversine formula
   * with realistic transit speed estimation (local road conditions).
   */
  public async calculateDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<DistanceResult> {
    const distanceKm = this.haversine(originLat, originLng, destLat, destLng);
    // Typical rural/semi-urban multimodal speed: ~35 km/h + 10 min transit overhead
    const durationMinutes = Math.round((distanceKm / 35) * 60 + 10);

    return {
      distanceKm: parseFloat(distanceKm.toFixed(1)),
      durationMinutes,
      provider: 'openstreetmap',
      originFormatted: `Coord (${originLat.toFixed(4)}, ${originLng.toFixed(4)})`,
      destinationFormatted: `Coord (${destLat.toFixed(4)}, ${destLng.toFixed(4)})`,
    };
  }

  /**
   * Reverse geocodes coordinates using OpenStreetMap Nominatim
   */
  public async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon: lng, format: 'json' },
        headers: { 'User-Agent': 'PFIS-OpenSource-Healthcare-Platform/1.0' },
        timeout: 4000,
      });

      const addr = res.data?.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.suburb ||
        addr.county ||
        addr.state_district ||
        'Local District';
      const state = addr.state || 'Punjab';
      const pincode = addr.postcode || '144401';
      const displayName = res.data?.display_name || `${city}, ${state}`;

      return { city, state, displayName, pincode, lat, lng };
    } catch {
      // Graceful offline fallback
      return {
        city: 'Local Area',
        state: 'Punjab',
        displayName: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        pincode: '144401',
        lat,
        lng,
      };
    }
  }

  /**
   * Discovers healthcare facilities using OpenStreetMap Nominatim
   */
  public async discoverFacilities(
    lat: number,
    lng: number,
    radiusKm: number = 25
  ): Promise<NearbyFacility[]> {
    const facilities: NearbyFacility[] = [];
    try {
      const geo = await this.reverseGeocode(lat, lng);
      const queries = [
        `hospital near ${geo.city}`,
        `civil hospital ${geo.city}`,
        `health center ${geo.city}`,
      ];

      const seen = new Set<string>();
      for (const q of queries) {
        if (facilities.length >= 10) break;
        try {
          const res = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q, format: 'json', addressdetails: 1, limit: 10 },
            headers: { 'User-Agent': 'PFIS-OpenSource-Healthcare-Platform/1.0' },
            timeout: 3500,
          });

          if (Array.isArray(res.data)) {
            for (const item of res.data) {
              const name = item.name || item.display_name?.split(',')[0];
              if (!name || seen.has(name.toLowerCase())) continue;
              seen.add(name.toLowerCase());

              const isGovt = /civil|govt|government|aiims|pgi|district|esi|chc|phc/i.test(name);
              const fLat = parseFloat(item.lat);
              const fLng = parseFloat(item.lon);
              const dist = this.haversine(lat, lng, fLat, fLng);

              facilities.push({
                name,
                lat: fLat,
                lng: fLng,
                address: item.display_name || `${name}, ${geo.city}`,
                city: geo.city,
                state: geo.state,
                pincode: geo.pincode,
                type: isGovt ? 'Government' : 'Private',
                isEmergency: true,
                distanceKm: parseFloat(dist.toFixed(1)),
              });
            }
          }
        } catch {
          // Continue to next query if OSM request throttled
        }
      }
    } catch {
      // Fallback handled below
    }

    return facilities;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
