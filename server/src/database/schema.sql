-- ==========================================================
-- PATIENT FRICTION INTELLIGENCE SYSTEM (PFIS) - DATABASE SCHEMA
-- Compatible with PostgreSQL & MySQL (ANSI SQL Standard)
-- 13 Relational Tables with Foreign Keys and Indexes
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'patient', -- 'patient', 'hospital', 'admin'
    phone VARCHAR(64),
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. PATIENT PROFILES (Non-Clinical Operational & Accessibility Parameters)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    age INT DEFAULT 45,
    gender VARCHAR(32) DEFAULT 'Other',
    location VARCHAR(255) DEFAULT 'Rural',
    is_rural BOOLEAN DEFAULT TRUE,
    distance_to_hospital_km DECIMAL(6,2) DEFAULT 25.0,
    transport_mode VARCHAR(64) DEFAULT 'Bus',
    digital_literacy VARCHAR(64) DEFAULT 'Low',
    family_support VARCHAR(64) DEFAULT 'Moderate',
    wage_loss_risk VARCHAR(64) DEFAULT 'High',
    preferred_language VARCHAR(32) DEFAULT 'en',
    smartphone_access BOOLEAN DEFAULT TRUE,
    internet_type VARCHAR(64) DEFAULT 'Mobile 4G',
    disability_needs TEXT,
    appointment_flexibility VARCHAR(64) DEFAULT 'Morning Only',
    document_readiness VARCHAR(64) DEFAULT 'Partial',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON patient_profiles(user_id);

-- 3. HOSPITALS (Healthcare Access Facilities)
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) DEFAULT 'General',
    city VARCHAR(128) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    phone VARCHAR(64),
    total_beds INT DEFAULT 100,
    available_beds INT DEFAULT 25,
    emergency_24x7 BOOLEAN DEFAULT TRUE,
    teleconsult_available BOOLEAN DEFAULT TRUE,
    accessibility_facilities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);

-- 4. HOSPITAL SERVICES (Departments, Token Capacities & Non-Clinical Services)
CREATE TABLE IF NOT EXISTS hospital_services (
    id VARCHAR(64) PRIMARY KEY,
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(128) NOT NULL,
    total_daily_tokens INT DEFAULT 50,
    available_tokens INT DEFAULT 20,
    fee DECIMAL(8,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_hospital ON hospital_services(hospital_id);

-- 5. APPOINTMENTS (Non-Clinical Scheduling & Token Allocations)
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    service_id VARCHAR(64) REFERENCES hospital_services(id) ON DELETE SET NULL,
    scheduled_date VARCHAR(64) NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    token_number INT,
    status VARCHAR(32) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Completed', 'Cancelled'
    friction_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital ON appointments(hospital_id);

-- 6. TELECONSULTATIONS (Live Remote Navigation Sessions)
CREATE TABLE IF NOT EXISTS teleconsultations (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(128) NOT NULL,
    scheduled_time VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'Scheduled', -- 'Scheduled', 'In-Progress', 'Completed', 'Cancelled'
    room_id VARCHAR(128) NOT NULL,
    channel_type VARCHAR(32) DEFAULT 'Video', -- 'Video', 'Audio'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teleconsult_patient ON teleconsultations(patient_id);

-- 7. FRICTION PROFILES (Explainable Non-Clinical Barrier Scores)
CREATE TABLE IF NOT EXISTS friction_profiles (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Low Friction', 'Moderate Friction', 'High Friction', 'Critical Access Difficulty'
    journey_completion_prob DECIMAL(5,2) NOT NULL,
    primary_barrier VARCHAR(128) NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_friction_patient ON friction_profiles(patient_id);

-- 8. FRICTION FACTORS (Decomposed Operational Attributes)
CREATE TABLE IF NOT EXISTS friction_factors (
    id VARCHAR(64) PRIMARY KEY,
    friction_profile_id VARCHAR(64) NOT NULL REFERENCES friction_profiles(id) ON DELETE CASCADE,
    factor_name VARCHAR(128) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    explanation TEXT NOT NULL,
    suggested_intervention TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_factors_profile ON friction_factors(friction_profile_id);

-- 9. ACCESSIBILITY RISKS (Mitigation Strategies)
CREATE TABLE IF NOT EXISTS accessibility_risks (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    risk_level VARCHAR(32) NOT NULL,
    barrier_title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    mitigation_action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risks_patient ON accessibility_risks(patient_id);

-- 10. REQUESTS (Support, Transit, Appointment & Escort Inquiries)
CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE SET NULL,
    request_type VARCHAR(64) NOT NULL, -- 'Appointment', 'Teleconsultation', 'Accessibility Support', 'Transport Support', 'Document Assistance'
    status VARCHAR(32) DEFAULT 'Pending', -- 'Pending', 'Processing', 'Approved', 'Completed', 'Cancelled'
    details TEXT,
    priority VARCHAR(32) DEFAULT 'Standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_patient ON requests(patient_id);

-- 11. DOCUMENTS (Vault for Identification & Non-Clinical Records)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL, -- 'ID Proof', 'Medical Document', 'Appointment Document', 'Insurance', 'Other'
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_kb DECIMAL(8,2) DEFAULT 120.0,
    mime_type VARCHAR(64) DEFAULT 'application/pdf',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patient_id);

-- 12. NOTIFICATIONS (Live Operational Status Alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- 13. AUDIT LOGS (Compliance & Access Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    ip_address VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
