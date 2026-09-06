import { UrgencyTier } from './clinicalTriageEngine.js';

export interface FacilityNode {
  id: string;
  name: string;
  type: 'Sub-Centre' | 'PHC' | 'CHC' | 'District Hospital';
  distanceKm: number;
  travelMinutes: number;
  opdQueueCount: number;
  maxDailyCapacity: number;
  doctorsOnDuty: number;
  hasEmergencyBeds: boolean;
  hasTeleconsultationHub: boolean;
  availableBeds: number;
  ambulanceAvailable: boolean;
}

export interface FacilityRouteRecommendation {
  selectedFacility: FacilityNode;
  alternateFacility?: FacilityNode;
  routingRationale: string;
  estimatedWaitMinutes: number;
  transportAdvice: string;
  isTeleconsultRedirect: boolean;
}

export class FacilityLoadRouter {
  /**
   * Evaluates available facilities and determines optimal routing based on urgency and load
   */
  static routePatient(
    urgency: UrgencyTier,
    patientLocation: { latitude: number; longitude: number },
    facilities: FacilityNode[],
    patientHasTransport: boolean = true
  ): FacilityRouteRecommendation {
    if (!facilities || facilities.length === 0) {
      throw new Error('No facilities registered in triage lookup range');
    }

    // 1. Emergency 108 Escalation
    if (urgency === 'EMERGENCY_108') {
      // Must be CHC or District Hospital with emergency beds
      const emergencyFacilities = facilities
        .filter((f) => f.hasEmergencyBeds && (f.type === 'District Hospital' || f.type === 'CHC'))
        .sort((a, b) => a.travelMinutes - b.travelMinutes);

      const chosen = emergencyFacilities[0] || facilities.sort((a, b) => a.travelMinutes - b.travelMinutes)[0];
      return {
        selectedFacility: chosen,
        alternateFacility: emergencyFacilities[1],
        routingRationale: `CRITICAL ESCALATION: Routed to ${chosen.name} (${chosen.type}) based on 24x7 emergency resuscitative capacity and ${chosen.availableBeds} open emergency beds.`,
        estimatedWaitMinutes: 0, // Direct emergency triage
        transportAdvice: chosen.ambulanceAvailable
          ? '108 Ambulance dispatched from facility. Do not self-drive.'
          : 'Arrange immediate private transit or local transit pool to emergency intake.',
        isTeleconsultRedirect: false,
      };
    }

    // 2. Teleconsultation Route
    if (urgency === 'TELECONSULT') {
      // Nearest Sub-centre or PHC with teleconsultation hub
      const teleconsultPosts = facilities
        .filter((f) => f.hasTeleconsultationHub)
        .sort((a, b) => a.travelMinutes - b.travelMinutes);

      const chosen = teleconsultPosts[0] || facilities.sort((a, b) => a.travelMinutes - b.travelMinutes)[0];
      return {
        selectedFacility: chosen,
        alternateFacility: teleconsultPosts[1],
        routingRationale: `VIRTUAL CONTINUITY: Routed to local ${chosen.name} (${chosen.type}) for assisted e-Sanjeevani teleconsultation with zero specialist transit burden.`,
        estimatedWaitMinutes: Math.min(25, Math.round((chosen.opdQueueCount / Math.max(1, chosen.doctorsOnDuty)) * 4)),
        transportAdvice: 'Walk or local village transit to Health Sub-Centre / Ayushman Arogya Mandir.',
        isTeleconsultRedirect: true,
      };
    }

    // 3. Self-Care at Home
    if (urgency === 'SELF_CARE') {
      const nearestSubCentre = facilities
        .filter((f) => f.type === 'Sub-Centre' || f.type === 'PHC')
        .sort((a, b) => a.distanceKm - b.distanceKm)[0] || facilities[0];

      return {
        selectedFacility: nearestSubCentre,
        routingRationale: 'HOME REST & RECOVERY: No immediate hospital travel required. ASHA worker assigned for 48-hour follow-up.',
        estimatedWaitMinutes: 0,
        transportAdvice: 'Remain at home. Visit local Sub-Centre only if danger signs appear.',
        isTeleconsultRedirect: false,
      };
    }

    // 4. In-person PHC Visit
    // Filter PHCs and CHCs; sort by load-balanced wait time + travel time
    const eligibleFacilities = facilities
      .filter((f) => f.type === 'PHC' || f.type === 'CHC')
      .map((f) => {
        const loadRatio = f.opdQueueCount / Math.max(1, f.maxDailyCapacity);
        const waitMinutes = Math.round((f.opdQueueCount / Math.max(1, f.doctorsOnDuty)) * 6);
        const totalCostScore = f.travelMinutes + waitMinutes + (loadRatio > 0.85 ? 45 : 0);
        return { facility: f, totalCostScore, waitMinutes };
      })
      .sort((a, b) => a.totalCostScore - b.totalCostScore);

    const chosen = eligibleFacilities[0]?.facility || facilities[0];
    const wait = eligibleFacilities[0]?.waitMinutes || 30;

    return {
      selectedFacility: chosen,
      alternateFacility: eligibleFacilities[1]?.facility,
      routingRationale: `BALANCED ACCESS: Selected ${chosen.name} (${chosen.type}) with ${chosen.doctorsOnDuty} doctors on duty and manageable queue (${chosen.opdQueueCount} active tokens).`,
      estimatedWaitMinutes: wait,
      transportAdvice: patientHasTransport
        ? `Direct ${chosen.distanceKm} km route (~${chosen.travelMinutes} mins).`
        : 'Transit assistance recommended: Bus route 14 or Community Health Shuttle.',
      isTeleconsultRedirect: false,
    };
  }
}
