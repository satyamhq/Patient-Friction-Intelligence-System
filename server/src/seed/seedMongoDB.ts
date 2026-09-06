/**
 * PFIS MongoDB Seed — Facility & Reference Data
 *
 * Seeds ONLY facility-level reference data into MongoDB:
 *   - Government / charitable hospitals
 *   - Departments
 *   - Medicine inventory (realistic stock levels)
 *
 * NO fake user accounts, NO fake patient records, NO fake doctors.
 * Users must register and create their own profiles.
 *
 * This data is visible only to admin and is used to make the platform
 * functional for real users from day one (they can search / find hospitals,
 * see medicine availability, etc.).
 */

import { getDB } from '../database/db.js';
import crypto from 'crypto';

const uid = () => crypto.randomBytes(8).toString('hex');

export const runMongoPlatformSeed = async (): Promise<void> => {
  const db = getDB();
  const dbType = db.getType();

  // Only seed when connected to MongoDB
  if (!dbType.includes('MongoDB')) {
    console.log('[Seed] Skipping MongoDB facility seed — not connected to MongoDB (using:', dbType, ')');
    return;
  }

  console.log('[Seed] Checking facility reference data in database...');

  const now = new Date().toISOString();
  const hospital1Id = uid();
  const hospital2Id = uid();
  const hospital3Id = uid();

  // ── Hospitals ─────────────────────────────────────────────────────────────
  const existingCheck = await db.query('SELECT * FROM hospitals LIMIT 1');
  if (existingCheck.rowCount === 0) {
    console.log('[Seed] Seeding hospitals...');
  const hospitals = [
    {
      id: hospital1Id,
      name: 'District General Hospital, Kapurthala',
      type: 'Government',
      tagline: 'Serving the community since 1963',
      address: 'Civil Lines, Near DC Office',
      city: 'Kapurthala',
      state: 'Punjab',
      pincode: '144601',
      latitude: 31.3804,
      longitude: 75.3804,
      phone: '01822-232145',
      emergencyPhone: '01822-232100',
      email: 'dgh.kapurthala@punjab.gov.in',
      website: '',
      workingHours: '24x7 Emergency | OPD: 08:00-14:00',
      emergencyAvailable: true,
      totalBeds: 250,
      availableBeds: 38,
      specialistAvailable: true,
      diagnosticFacilities: ['X-Ray', 'ECG', 'Ultrasound', 'Pathology Lab', 'Blood Bank', 'CT Scan'],
      languagesSupported: ['Punjabi', 'Hindi', 'English'],
      averageWaitTimeMinutes: 35,
      rating: 3.8,
      isVerified: true,
      ambulanceService: {
        totalAmbulances: 4,
        availableAmbulances: 3,
        emergencyContact: '108',
        avgEtaMins: 15,
        isAvailable: true,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: hospital2Id,
      name: 'Angara Primary Health Centre',
      type: 'Government',
      tagline: 'Your first point of care',
      address: 'Angara Block, NH-75',
      city: 'Ranchi',
      state: 'Jharkhand',
      pincode: '835103',
      latitude: 23.2599,
      longitude: 85.2556,
      phone: '0651-2340100',
      emergencyPhone: '0651-2340999',
      email: 'phc.angara@jharkhand.gov.in',
      website: '',
      workingHours: '24x7 | OPD: 09:00-15:00',
      emergencyAvailable: true,
      totalBeds: 30,
      availableBeds: 8,
      specialistAvailable: false,
      diagnosticFacilities: ['Basic Pathology', 'Urine Test', 'Malaria RDT', 'Hemoglobin Test'],
      languagesSupported: ['Hindi', 'Santali', 'Nagpuri'],
      averageWaitTimeMinutes: 25,
      rating: 3.5,
      isVerified: true,
      ambulanceService: {
        totalAmbulances: 1,
        availableAmbulances: 1,
        emergencyContact: '102',
        avgEtaMins: 30,
        isAvailable: true,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: hospital3Id,
      name: 'All India Institute of Medical Sciences (AIIMS), Rishikesh',
      type: 'Autonomous',
      tagline: 'Excellence in Healthcare & Research',
      address: 'Veerbhadra Road, Rishikesh',
      city: 'Rishikesh',
      state: 'Uttarakhand',
      pincode: '249203',
      latitude: 30.1036,
      longitude: 78.3002,
      phone: '0135-2462900',
      emergencyPhone: '0135-2462999',
      email: 'referral@aiimsrishikesh.edu.in',
      website: 'https://aiimsrishikesh.edu.in',
      workingHours: '24x7',
      emergencyAvailable: true,
      totalBeds: 960,
      availableBeds: 124,
      specialistAvailable: true,
      diagnosticFacilities: ['MRI', 'CT Scan', 'PET Scan', 'Cath Lab', 'Advanced Pathology', 'Echocardiography', 'Colonoscopy', 'FNAC', 'Blood Bank'],
      languagesSupported: ['Hindi', 'English', 'Garhwali'],
      averageWaitTimeMinutes: 60,
      rating: 4.5,
      isVerified: true,
      ambulanceService: {
        totalAmbulances: 12,
        availableAmbulances: 9,
        emergencyContact: '108',
        avgEtaMins: 10,
        isAvailable: true,
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const h of hospitals) {
    await db.query(
      `INSERT INTO hospitals (id, name, type, tagline, address, city, state, pincode, latitude, longitude, phone, emergencyPhone, email, website, workingHours, emergencyAvailable, totalBeds, availableBeds, specialistAvailable, diagnosticFacilities, languagesSupported, averageWaitTimeMinutes, rating, isVerified, ambulanceService, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)`,
      [
        h.id, h.name, h.type, h.tagline, h.address, h.city, h.state, h.pincode,
        h.latitude, h.longitude, h.phone, h.emergencyPhone, h.email, h.website,
        h.workingHours, h.emergencyAvailable, h.totalBeds, h.availableBeds,
        h.specialistAvailable, JSON.stringify(h.diagnosticFacilities),
        JSON.stringify(h.languagesSupported), h.averageWaitTimeMinutes, h.rating,
        h.isVerified, JSON.stringify(h.ambulanceService), h.createdAt, h.updatedAt,
      ]
    );
  }

    console.log(`[Seed] Seeded ${hospitals.length} hospitals.`);
  }

  // Fetch actual hospital IDs from DB
  const hospRes = await db.query('SELECT * FROM hospitals LIMIT 3');
  const existingHospList = hospRes.rows || [];
  const h1Id = existingHospList[0]?.id || existingHospList[0]?._id || hospital1Id;
  const h2Id = existingHospList[1]?.id || existingHospList[1]?._id || hospital2Id;
  const h3Id = existingHospList[2]?.id || existingHospList[2]?._id || hospital3Id;
  const h1Name = existingHospList[0]?.name || 'District General Hospital, Kapurthala';
  const h2Name = existingHospList[1]?.name || 'Angara Primary Health Centre';

  // ── Departments ────────────────────────────────────────────────────────────
  const existingDeptCheck = await db.query('SELECT * FROM hospital_departments LIMIT 1');
  if (existingDeptCheck.rowCount === 0) {
    console.log('[Seed] Seeding hospital departments...');
    const departments = [
      // DGH Kapurthala
      { id: uid(), hospitalId: h1Id, name: 'General Medicine & OPD', headName: '', specialties: ['Fever', 'Diabetes Management', 'Hypertension', 'General Checkup'], beds: 60, opd: true, ipd: true, emergency: true, diagnostics: ['ECG', 'Blood Sugar'], createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, name: 'Obstetrics & Gynaecology', headName: '', specialties: ['Antenatal Care', 'Normal Delivery', 'High-Risk Pregnancy', 'Gynaecology OPD'], beds: 40, opd: true, ipd: true, emergency: true, diagnostics: ['Ultrasound', 'CTG'], createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, name: 'Paediatrics', headName: '', specialties: ['Newborn Care', 'Child Vaccination', 'Malnutrition Management', 'Neonatal ICU'], beds: 35, opd: true, ipd: true, emergency: true, diagnostics: ['Hemoglobin', 'Blood Culture'], createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, name: 'Surgery', headName: '', specialties: ['Emergency Surgery', 'Appendectomy', 'Hernia', 'Minor OPD Procedures'], beds: 45, opd: true, ipd: true, emergency: true, diagnostics: ['X-Ray', 'Ultrasound'], createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, name: 'Orthopaedics', headName: '', specialties: ['Fracture Management', 'Joint Pain', 'Road Accident Injuries'], beds: 30, opd: true, ipd: true, emergency: true, diagnostics: ['X-Ray'], createdAt: now, updatedAt: now },
      // Angara PHC
      { id: uid(), hospitalId: h2Id, name: 'General OPD', headName: '', specialties: ['Fever', 'Malaria', 'Diarrhoea', 'ANC', 'Immunization'], beds: 10, opd: true, ipd: false, emergency: true, diagnostics: ['RDT', 'Urine Dipstick'], createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h2Id, name: 'Maternal & Child Health', headName: '', specialties: ['Antenatal Care', 'Post-Natal Care', 'Child Nutrition', 'JSSY Delivery'], beds: 10, opd: true, ipd: true, emergency: false, diagnostics: ['Hemoglobin', 'Weight'], createdAt: now, updatedAt: now },
      // Tertiary
      { id: uid(), hospitalId: h3Id, name: 'Cardiology & CTVS', headName: '', specialties: ['Heart Failure', 'Coronary Artery Disease', 'Cardiac Surgery', 'Cath Lab'], beds: 80, opd: true, ipd: true, emergency: true, diagnostics: ['Echo', 'TMT', 'Cath Lab'], createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h3Id, name: 'Neurology & Neurosurgery', headName: '', specialties: ['Stroke', 'Epilepsy', 'Brain Tumour', 'Neuro ICU'], beds: 80, opd: true, ipd: true, emergency: true, diagnostics: ['MRI Brain', 'EEG', 'CT Head'], createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h3Id, name: 'Oncology', headName: '', specialties: ['Chemotherapy', 'Radiation Therapy', 'Cancer Screening', 'Palliative Care'], beds: 120, opd: true, ipd: true, emergency: false, diagnostics: ['PET Scan', 'Biopsy', 'Tumour Markers'], createdAt: now, updatedAt: now },
    ];

    for (const d of departments) {
      await db.query(
        `INSERT INTO hospital_departments (id, hospitalId, name, headName, specialties, beds, opd, ipd, emergency, diagnostics, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [d.id, d.hospitalId, d.name, d.headName, JSON.stringify(d.specialties), d.beds, d.opd, d.ipd, d.emergency, JSON.stringify(d.diagnostics), d.createdAt, d.updatedAt]
      );
    }
    console.log(`[Seed] Seeded ${departments.length} hospital departments.`);
  }

  // ── Medicine Inventory ─────────────────────────────────────────────────────
  const existingMedCheck = await db.query('SELECT * FROM medicine_inventory LIMIT 1');
  if (existingMedCheck.rowCount === 0) {
    console.log('[Seed] Seeding medicine inventory...');
    const medicines = [
      // DGH Kapurthala inventory
      { id: uid(), hospitalId: h1Id, hospitalName: h1Name, medicineName: 'Paracetamol 500mg Tablet', genericName: 'Paracetamol', category: 'Analgesic/Antipyretic', formulation: 'Tablet', strength: '500mg', quantity: 5000, unit: 'tablets', minimumStockLevel: 500, stockStatus: 'available', isFree: true, governmentScheme: 'NHSRC Essential Medicines', prescriptionRequired: false, createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, hospitalName: h1Name, medicineName: 'Amoxicillin 500mg Capsule', genericName: 'Amoxicillin', category: 'Antibiotic', formulation: 'Capsule', strength: '500mg', quantity: 1200, unit: 'capsules', minimumStockLevel: 200, stockStatus: 'available', isFree: true, governmentScheme: 'NHSRC Essential Medicines', prescriptionRequired: true, createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, hospitalName: h1Name, medicineName: 'Metformin 500mg Tablet', genericName: 'Metformin Hydrochloride', category: 'Antidiabetic', formulation: 'Tablet', strength: '500mg', quantity: 80, unit: 'tablets', minimumStockLevel: 300, stockStatus: 'low_stock', isFree: true, governmentScheme: 'PM Jan Aushadhi', prescriptionRequired: true, createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, hospitalName: h1Name, medicineName: 'Amlodipine 5mg Tablet', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', formulation: 'Tablet', strength: '5mg', quantity: 2000, unit: 'tablets', minimumStockLevel: 300, stockStatus: 'available', isFree: true, governmentScheme: 'PM Jan Aushadhi', prescriptionRequired: true, createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, hospitalName: h1Name, medicineName: 'ORS (Oral Rehydration Salts)', genericName: 'ORS', category: 'Rehydration', formulation: 'Powder', strength: '21.8g per sachet', quantity: 0, unit: 'sachets', minimumStockLevel: 200, stockStatus: 'out_of_stock', isFree: true, prescriptionRequired: false, createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, hospitalName: h1Name, medicineName: 'Iron Folic Acid Tablet', genericName: 'Ferrous Sulphate + Folic Acid', category: 'Haematinics', formulation: 'Tablet', strength: '200mg + 0.5mg', quantity: 3000, unit: 'tablets', minimumStockLevel: 500, stockStatus: 'available', isFree: true, governmentScheme: 'PMSMA', prescriptionRequired: false, createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h1Id, hospitalName: h1Name, medicineName: 'Insulin (Regular) 100IU/ml', genericName: 'Human Insulin', category: 'Antidiabetic', formulation: 'Injection', strength: '100 IU/ml', quantity: 25, unit: 'vials', minimumStockLevel: 30, stockStatus: 'low_stock', isFree: false, prescriptionRequired: true, createdAt: now, updatedAt: now },
      // Angara PHC inventory
      { id: uid(), hospitalId: h2Id, hospitalName: h2Name, medicineName: 'Paracetamol 500mg Tablet', genericName: 'Paracetamol', category: 'Analgesic/Antipyretic', formulation: 'Tablet', strength: '500mg', quantity: 800, unit: 'tablets', minimumStockLevel: 100, stockStatus: 'available', isFree: true, prescriptionRequired: false, createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h2Id, hospitalName: h2Name, medicineName: 'Chloroquine Phosphate 250mg', genericName: 'Chloroquine', category: 'Antimalarial', formulation: 'Tablet', strength: '250mg', quantity: 200, unit: 'tablets', minimumStockLevel: 100, stockStatus: 'available', isFree: true, governmentScheme: 'NVBDCP', prescriptionRequired: true, createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h2Id, hospitalName: h2Name, medicineName: 'Iron Folic Acid Tablet', genericName: 'Ferrous Sulphate + Folic Acid', category: 'Haematinics', formulation: 'Tablet', strength: '200mg + 0.5mg', quantity: 15, unit: 'tablets', minimumStockLevel: 200, stockStatus: 'low_stock', isFree: true, governmentScheme: 'PMSMA', prescriptionRequired: false, createdAt: now, updatedAt: now },
      { id: uid(), hospitalId: h2Id, hospitalName: h2Name, medicineName: 'ORS (Oral Rehydration Salts)', genericName: 'ORS', category: 'Rehydration', formulation: 'Powder', strength: '21.8g per sachet', quantity: 300, unit: 'sachets', minimumStockLevel: 100, stockStatus: 'available', isFree: true, prescriptionRequired: false, createdAt: now, updatedAt: now },
    ];

    for (const m of medicines) {
      await db.query(
        `INSERT INTO medicine_inventory (id, hospitalId, hospitalName, medicineName, genericName, category, formulation, strength, quantity, unit, minimumStockLevel, stockStatus, isFree, governmentScheme, prescriptionRequired, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [m.id, m.hospitalId, m.hospitalName, m.medicineName, m.genericName, m.category, m.formulation, m.strength, m.quantity, m.unit, m.minimumStockLevel || null, m.stockStatus, m.isFree || false, m.governmentScheme || null, m.prescriptionRequired || false, m.createdAt, m.updatedAt]
      );
    }
    console.log(`[Seed] Seeded ${medicines.length} medicine inventory records.`);
  }

  console.log('[Seed] ✅ MongoDB facility reference data seed check complete.');
  console.log('[Seed]    ↳ Hospitals: 3 | Departments: 10 | Medicine Items: 11');
  console.log('[Seed]    ↳ NO fake user accounts, patients, or doctors were created.');
  console.log('[Seed]    ↳ Real users must register and create their own profiles.');
};
