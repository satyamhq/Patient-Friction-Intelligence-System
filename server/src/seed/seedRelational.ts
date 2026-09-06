import bcrypt from 'bcryptjs';
import { UserRepository } from '../database/repositories/UserRepository.js';
import { PatientRepository } from '../database/repositories/PatientRepository.js';
import { HospitalRepository } from '../database/repositories/HospitalRepository.js';
import { FrictionRepository } from '../database/repositories/FrictionRepository.js';
import { RequestRepository } from '../database/repositories/RequestRepository.js';
import { DocumentRepository } from '../database/repositories/DocumentRepository.js';
import { NotificationRepository } from '../database/repositories/NotificationRepository.js';

export const runRelationalSeed = async (): Promise<void> => {
  try {
    console.log('===========================================================');
    console.log('  PFIS RELATIONAL SEEDER: POPULATING DEMO DATASET (SQL)    ');
    console.log('===========================================================');

    // 1. Check if admin exists
    const existingAdmin = await UserRepository.findByEmail('admin@pfis.org');
    if (existingAdmin) {
      console.log('[Seed] Relational database already seeded. Skipping re-seed.');
      return;
    }

    const adminHash = await bcrypt.hash('Admin@123', 10);
    const patientHash = await bcrypt.hash('Patient@123', 10);
    const hospitalHash = await bcrypt.hash('Hospital@123', 10);

    // 2. Admin Accounts
    const admin1 = await UserRepository.create({
      email: 'admin@pfis.org',
      password_hash: adminHash,
      name: 'PFIS Executive Admin',
      role: 'admin',
      phone: '+91 98765 43210',
    });

    const admin2 = await UserRepository.create({
      email: 'dhirajkumar464748@gmail.com',
      password_hash: adminHash,
      name: 'Dhiraj Kumar (Executive Admin)',
      role: 'admin',
      phone: '+91 91234 56789',
    });

    // 3. Hospital Staff Account
    const staffUser = await UserRepository.create({
      email: 'staff@hospital.org',
      password_hash: hospitalHash,
      name: 'Dr. Gurpreet Singh (Nodal Officer)',
      role: 'hospital',
      phone: '+91 98765 11223',
    });

    // 4. Demo Patient Account (Sunita Devi)
    const patientUser = await UserRepository.create({
      email: 'patient@pfis.org',
      password_hash: patientHash,
      name: 'Sunita Devi',
      role: 'patient',
      phone: '+91 98140 12345',
    });

    // 5. Patient Profile (Sunita Devi - Non-Clinical Accessibility Parameters)
    const sunitaProfile = await PatientRepository.createOrUpdate({
      user_id: patientUser.id,
      full_name: 'Sunita Devi',
      age: 60,
      gender: 'Female',
      location: 'Rural (Vill. Mehli, Near Phagwara, Punjab)',
      is_rural: true,
      distance_to_hospital_km: 65.0,
      transport_mode: 'Infrequent Bus',
      digital_literacy: 'None / Feature Phone',
      family_support: 'Caregiver Constrained',
      wage_loss_risk: 'Daily Wage Loss',
      preferred_language: 'pa',
      smartphone_access: false,
      internet_type: '2G / Intermittent',
      disability_needs: 'Limited Mobility / Needs Ground-Floor Wheelchair Support',
      appointment_flexibility: 'Morning Window (Before 11 AM)',
      document_readiness: 'Physical Paper / Missing Health Card',
    });

    // 6. Calculate and store initial explainable friction score
    const calculatedFriction = FrictionRepository.calculateExplainableFriction(sunitaProfile);
    await FrictionRepository.saveCalculatedFriction(patientUser.id, calculatedFriction);

    // Initial Accessibility Risks
    await FrictionRepository.createAccessibilityRisk({
      patient_id: patientUser.id,
      risk_level: 'High',
      barrier_title: 'Long Transit Distance & Irregular Bus Schedule',
      explanation: 'Living 65 km away with infrequent public transit causes high journey attrition risk.',
      mitigation_action: 'Assign hospital transit shuttle or suggest doorstep care escort (Sahayak).',
    });

    await FrictionRepository.createAccessibilityRisk({
      patient_id: patientUser.id,
      risk_level: 'Moderate',
      barrier_title: 'Digital & Form Literacy Barrier',
      explanation: 'Inability to operate smartphone or read English tokens creates queue friction.',
      mitigation_action: 'Enable Simple Language Mode and assign audio assistance tokens.',
    });

    // 7. Seed Hospitals (Verified Facilities in Phagwara / Jalandhar & Hubs)
    const hospitalsData = [
      {
        name: 'Civil Hospital Phagwara (Government 24/7)',
        type: 'Government Sub-Divisional Hospital',
        city: 'Phagwara',
        address: 'GT Road, Near Rest House, Phagwara, Punjab 144401',
        latitude: 31.2229,
        longitude: 75.7725,
        phone: '01824-260232',
        total_beds: 120,
        available_beds: 42,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Wheelchair Ramps, Ground-Floor OPD, Jan Aushadhi Kendra, Free Ambulances',
      },
      {
        name: 'Gandhi Hospital (P) Ltd (Multi-Speciality)',
        type: 'Private Multi-Speciality Hospital',
        city: 'Phagwara',
        address: 'Model Town, Central Town, Phagwara, Punjab 144401',
        latitude: 31.2255,
        longitude: 75.7712,
        phone: '01824-500600',
        total_beds: 85,
        available_beds: 19,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Elevator Access, Fast-Track Senior Citizen Desk, Multilingual Signage',
      },
      {
        name: 'Patel Hospital (Jalandhar Multi-Speciality Hub)',
        type: 'Private Tertiary Super-Speciality',
        city: 'Jalandhar',
        address: 'Civil Lines, Near BMC Chowk, Jalandhar, Punjab 144001',
        latitude: 31.326,
        longitude: 75.5762,
        phone: '0181-5241000',
        total_beds: 250,
        available_beds: 64,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Dedicated Care Escort, Cashless TPA Desk, Disabled Toilet Facilities',
      },
      {
        name: 'Johal Multispeciality Hospital',
        type: 'Private Multi-Speciality Hospital',
        city: 'Jalandhar',
        address: 'Rama Mandi, Hoshiarpur Road, Jalandhar, Punjab 144005',
        latitude: 31.3195,
        longitude: 75.6152,
        phone: '0181-2410700',
        total_beds: 110,
        available_beds: 28,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Ramp Access, Direct Ambulance Bay, Digital Token Screen',
      },
      {
        name: 'Apollo Super Speciality Hospital',
        type: 'Private Tertiary Hospital',
        city: 'Ranchi',
        address: 'Lake Road, Main Road Crossing, Ranchi, Jharkhand',
        latitude: 23.3551,
        longitude: 85.3262,
        phone: '0651-2446600',
        total_beds: 350,
        available_beds: 58,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: '24/7 Patient Concierge, Braille Signboards, Elevator Support',
      },
      {
        name: 'Sadar District Hospital',
        type: 'Government District Hospital',
        city: 'Ranchi',
        address: 'Purulia Road, Ahirtoli, Ranchi, Jharkhand',
        latitude: 23.3712,
        longitude: 85.3341,
        phone: '0651-2200100',
        total_beds: 500,
        available_beds: 72,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Ayushman Bharat Desk, Step-Free Transit Corridors, Help Desk',
      },
    ];

    for (const h of hospitalsData) {
      const createdHosp = await HospitalRepository.create(h);

      // Add departments and token allocations
      await HospitalRepository.addService({
        hospital_id: createdHosp.id,
        name: 'General Medicine & Geriatric Screening',
        department: 'General Medicine',
        total_daily_tokens: 60,
        available_tokens: 28,
        fee: h.type.includes('Government') ? 0 : 350,
        is_active: true,
      });

      await HospitalRepository.addService({
        hospital_id: createdHosp.id,
        name: 'Cardiology & Hypertension Clinic',
        department: 'Cardiology',
        total_daily_tokens: 40,
        available_tokens: 15,
        fee: h.type.includes('Government') ? 0 : 500,
        is_active: true,
      });

      await HospitalRepository.addService({
        hospital_id: createdHosp.id,
        name: 'Orthopedics & Joint Care',
        department: 'Orthopedics',
        total_daily_tokens: 35,
        available_tokens: 12,
        fee: h.type.includes('Government') ? 0 : 450,
        is_active: true,
      });
    }

    // 8. Seed Sample Requests for Sunita Devi
    const firstHosp = (await HospitalRepository.findAll())[0];
    await RequestRepository.create({
      patient_id: patientUser.id,
      hospital_id: firstHosp?.id,
      request_type: 'Transport Support',
      status: 'Processing',
      details: 'Requesting community transit shuttle for morning OPD visit from village Mehli.',
      priority: 'High',
    });

    await RequestRepository.create({
      patient_id: patientUser.id,
      hospital_id: firstHosp?.id,
      request_type: 'Accessibility Support',
      status: 'Approved',
      details: 'Ground floor wheelchair assistance requested upon arrival at hospital gate.',
      priority: 'Standard',
    });

    // 9. Seed Sample Documents in Vault
    await DocumentRepository.create({
      patient_id: patientUser.id,
      category: 'ID Proof',
      file_name: 'Aadhaar_Card_Masked.pdf',
      file_url: '/demo-vault/Aadhaar_Card_Masked.pdf',
      file_size_kb: 245.5,
      mime_type: 'application/pdf',
    });

    await DocumentRepository.create({
      patient_id: patientUser.id,
      category: 'Medical Document',
      file_name: 'Previous_OPD_Prescription_Slip.pdf',
      file_url: '/demo-vault/Previous_OPD_Prescription_Slip.pdf',
      file_size_kb: 412.0,
      mime_type: 'application/pdf',
    });

    // 10. Seed Notifications
    await NotificationRepository.create({
      user_id: patientUser.id,
      title: 'Welcome to PFIS Accessibility Portal',
      message: 'Your non-clinical accessibility profile is active. You can review your travel friction and find nearby verified hospitals.',
      type: 'success',
      link: '/patient/friction-profile',
    });

    await NotificationRepository.create({
      user_id: patientUser.id,
      title: 'Transport Assistance Request Received',
      message: 'Your request for morning transit assistance has been queued with Civil Hospital Phagwara support desk.',
      type: 'info',
      link: '/patient/requests',
    });

    console.log('[Seed] Relational database seeding finished successfully!');
    console.log('  -> Admin: admin@pfis.org (Admin@123)');
    console.log('  -> Admin: dhirajkumar464748@gmail.com (Admin@123)');
    console.log('  -> Patient: patient@pfis.org (Patient@123)');
    console.log('  -> Hospital: staff@hospital.org (Hospital@123)');
    console.log('===========================================================');
  } catch (err: any) {
    console.error('[Seed Error] Failed to seed relational database:', err.message);
  }
};
