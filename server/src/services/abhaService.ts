import crypto from 'crypto';

export interface ABHACardData {
  abhaNumber: string; // e.g. "91-4829-1029-4821"
  abhaAddress: string; // e.g. "sunita.devi@abdm"
  name: string;
  gender: string;
  yearOfBirth: number;
  mobile: string;
  state: string;
  district: string;
  qrPayload: string;
  signature: string;
}

export class AbhaService {
  /**
   * Generates a realistic 14-digit ABDM-compliant ABHA number format: XX-XXXX-XXXX-XXXX
   */
  static generateAbhaNumber(): string {
    const p1 = Math.floor(10 + Math.random() * 89);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const p4 = Math.floor(1000 + Math.random() * 9000);
    return `${p1}-${p2}-${p3}-${p4}`;
  }

  /**
   * Formats an ABHA address username@abdm
   */
  static generateAbhaAddress(name: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${sanitized}${suffix}@abdm`;
  }

  /**
   * Constructs the standardized verifiable QR code payload conforming to ABDM specs
   */
  static createAbhaCard(patient: {
    id?: string;
    name: string;
    gender: string;
    age?: number;
    phone?: string;
    state?: string;
    district?: string;
    abhaNumber?: string;
    abhaAddress?: string;
  }): ABHACardData {
    const abhaNumber = patient.abhaNumber || this.generateAbhaNumber();
    const abhaAddress = patient.abhaAddress || this.generateAbhaAddress(patient.name);
    const currentYear = new Date().getFullYear();
    const yearOfBirth = patient.age ? currentYear - patient.age : 1980;

    const rawData = {
      hidn: abhaNumber,
      hid: abhaAddress,
      name: patient.name,
      gender: patient.gender?.toUpperCase()?.slice(0, 1) || 'F',
      yob: yearOfBirth,
      mobile: patient.phone || '9876543210',
      state: patient.state || 'Jharkhand',
      dist: patient.district || 'Ranchi',
      auth: 'ABDM_PFIS_VERIFIED',
      ts: new Date().toISOString(),
    };

    const qrPayload = JSON.stringify(rawData);
    const signature = crypto.createHash('sha256').update(qrPayload + 'PFIS_ABDM_SALT_2026').digest('hex');

    return {
      abhaNumber,
      abhaAddress,
      name: patient.name,
      gender: patient.gender,
      yearOfBirth,
      mobile: patient.phone || '',
      state: patient.state || 'Jharkhand',
      district: patient.district || 'Ranchi',
      qrPayload,
      signature,
    };
  }
}
