import { Request, Response } from 'express';
import { ClinicalTriageEngine } from '../intelligence/triage/clinicalTriageEngine.js';
import { FacilityLoadRouter, FacilityNode } from '../intelligence/triage/facilityLoadRouter.js';

const PUBLIC_HEALTH_FACILITIES: FacilityNode[] = [
  {
    id: 'fac-sub-angara',
    name: 'Angara Health Sub-Centre / Ayushman Arogya Mandir',
    type: 'Sub-Centre',
    distanceKm: 2.1,
    travelMinutes: 10,
    opdQueueCount: 4,
    maxDailyCapacity: 25,
    doctorsOnDuty: 1, // CHO / Staff Nurse
    hasEmergencyBeds: false,
    hasTeleconsultationHub: true,
    availableBeds: 2,
    ambulanceAvailable: false,
  },
  {
    id: 'fac-phc-angara',
    name: 'Angara Primary Health Centre (PHC)',
    type: 'PHC',
    distanceKm: 8.5,
    travelMinutes: 22,
    opdQueueCount: 16,
    maxDailyCapacity: 80,
    doctorsOnDuty: 2,
    hasEmergencyBeds: true,
    hasTeleconsultationHub: true,
    availableBeds: 6,
    ambulanceAvailable: true,
  },
  {
    id: 'fac-chc-silli',
    name: 'Silli Community Health Centre (CHC / FRU)',
    type: 'CHC',
    distanceKm: 24.0,
    travelMinutes: 48,
    opdQueueCount: 38,
    maxDailyCapacity: 150,
    doctorsOnDuty: 5,
    hasEmergencyBeds: true,
    hasTeleconsultationHub: true,
    availableBeds: 24,
    ambulanceAvailable: true,
  },
  {
    id: 'fac-dh-ranchi',
    name: 'Ranchi District Hospital & Maternal Child Care Centre',
    type: 'District Hospital',
    distanceKm: 38.5,
    travelMinutes: 70,
    opdQueueCount: 110,
    maxDailyCapacity: 400,
    doctorsOnDuty: 18,
    hasEmergencyBeds: true,
    hasTeleconsultationHub: true,
    availableBeds: 120,
    ambulanceAvailable: true,
  },
];

export const evaluateTriage = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      age,
      gender = 'female',
      isPregnant = false,
      gestationalWeeks,
      symptoms = [],
      durationDays = 1,
      vitalSigns = {},
      chiefComplaint = '',
      patientLocation = { latitude: 23.3641, longitude: 85.3331 },
      hasTransport = true,
    } = req.body;

    const triageResult = ClinicalTriageEngine.evaluateTriage({
      age: Number(age) || 28,
      gender,
      isPregnant: Boolean(isPregnant),
      gestationalWeeks: gestationalWeeks ? Number(gestationalWeeks) : undefined,
      symptoms: Array.isArray(symptoms) ? symptoms : [String(symptoms)],
      durationDays: Number(durationDays) || 1,
      vitalSigns,
      chiefComplaint,
    });

    const routeRecommendation = FacilityLoadRouter.routePatient(
      triageResult.urgency,
      patientLocation,
      PUBLIC_HEALTH_FACILITIES,
      hasTransport
    );

    res.json({
      success: true,
      triage: triageResult,
      routing: routeRecommendation,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicFacilities = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    count: PUBLIC_HEALTH_FACILITIES.length,
    facilities: PUBLIC_HEALTH_FACILITIES,
  });
};
