/**
 * FHIR R4 Core Types & ABDM (Ayushman Bharat Digital Mission) Profiles
 * Standards-compliant interoperable health records layer for PFIS
 */

export interface FHIRCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRReference {
  reference: string; // e.g. "Patient/123", "Organization/phc-4"
  display?: string;
  type?: string;
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary';
  system?: string; // e.g. "https://healthid.ndhm.gov.in"
  value: string;
}

export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier: FHIRIdentifier[]; // ABHA Number, ABHA Address, Aadhaar (hashed)
  active: boolean;
  name: Array<{
    text: string;
    family?: string;
    given?: string[];
  }>;
  telecom?: Array<{
    system: 'phone' | 'email';
    value: string;
    use?: 'home' | 'mobile';
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueDecimal?: number;
    valueBoolean?: boolean;
  }>;
}

export interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  class: FHIRCoding; // e.g., 'AMB' (ambulatory/OPD), 'VR' (virtual/teleconsult), 'EMER' (emergency)
  type?: FHIRCodeableConcept[];
  subject: FHIRReference; // Patient reference
  participant?: Array<{
    individual: FHIRReference;
    type?: FHIRCodeableConcept[];
  }>;
  period: {
    start: string;
    end?: string;
  };
  reasonCode?: FHIRCodeableConcept[];
  serviceProvider?: FHIRReference; // Sub-Centre, PHC, CHC, or District Hospital
}

export interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  clinicalStatus?: FHIRCodeableConcept; // active, recurrence, remission, resolved
  verificationStatus?: FHIRCodeableConcept; // provisional, confirmed, refuted
  category?: FHIRCodeableConcept[]; // problem-list-item | encounter-diagnosis
  severity?: FHIRCodeableConcept; // mild, moderate, severe, critical
  code: FHIRCodeableConcept; // SNOMED-CT / ICD-10 or clinical text
  subject: FHIRReference;
  encounter?: FHIRReference;
  onsetDateTime?: string;
  recordedDate?: string;
  note?: Array<{ text: string }>;
}

export interface FHIRServiceRequest {
  resourceType: 'ServiceRequest';
  id: string;
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error';
  intent: 'order' | 'proposal' | 'plan';
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  code: FHIRCodeableConcept; // Referral reason / Department needed
  subject: FHIRReference;
  encounter?: FHIRReference;
  authoredOn: string;
  requester: FHIRReference; // Referring Doctor / Facility
  performer?: FHIRReference[]; // Target Hospital / Department
  reasonCode?: FHIRCodeableConcept[];
  supportingInfo?: Array<{
    reference?: string;
    display?: string;
    frictionData?: {
      transitBarrier?: boolean;
      escortRequired?: boolean;
      languageAssistance?: string;
      financialSupportNeeded?: boolean;
    };
  }>;
  note?: Array<{ text: string }>;
}

export interface FHIRDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id: string;
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled';
  category?: FHIRCodeableConcept[]; // LAB, RAD, etc.
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  effectiveDateTime?: string;
  issued: string;
  performer?: FHIRReference[];
  conclusion?: string;
  presentedForm?: Array<{
    contentType: string;
    url?: string;
    title?: string;
  }>;
}

export interface FHIRCarePlan {
  resourceType: 'CarePlan';
  id: string;
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed';
  intent: 'plan';
  title: string;
  description?: string;
  subject: FHIRReference;
  period?: {
    start: string;
    end?: string;
  };
  category?: FHIRCodeableConcept[]; // 'maternal-anc' | 'child-immunization' | 'chronic-ncd'
  activity: Array<{
    detail: {
      kind?: 'Appointment' | 'CommunicationRequest' | 'ServiceRequest';
      code?: FHIRCodeableConcept;
      status: 'not-started' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
      scheduledTiming?: {
        event?: string[]; // Due dates
      };
      performer?: FHIRReference[]; // Assigned ASHA or Nurse
      description?: string;
    };
  }>;
}
