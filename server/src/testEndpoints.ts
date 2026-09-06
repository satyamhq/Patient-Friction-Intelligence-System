import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  const results: { test: string; status: 'PASS' | 'FAIL'; details?: any }[] = [];

  function record(test: string, status: 'PASS' | 'FAIL', details?: any) {
    results.push({ test, status, details });
    console.log(`[${status}] ${test} ${details ? JSON.stringify(details).slice(0, 100) : ''}`);
  }

  // 1. Health
  try {
    const res = await axios.get(`${API_URL}/health`);
    if (res.data?.status === 'ok') {
      record('Health Check', 'PASS');
    } else {
      record('Health Check', 'FAIL', res.data);
    }
  } catch (err: any) {
    record('Health Check', 'FAIL', err.message);
  }

  // 2. Auth Logout
  try {
    const res = await axios.post(`${API_URL}/auth/logout`);
    if (res.status === 200 && res.data?.success) {
      record('Auth Logout without token', 'PASS');
    } else {
      record('Auth Logout without token', 'FAIL', res.data);
    }
  } catch (err: any) {
    record('Auth Logout without token', 'FAIL', err.message);
  }

  // 3. Register & Login Patient
  let patientToken = '';
  let patientUser: any = null;
  const patientEmail = `test_patient_${Date.now()}@example.com`;
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Ramesh Patel',
      email: patientEmail,
      password: 'Password@123',
      role: 'patient',
      phone: '+91-9876543210'
    });
    if (res.data?.success && res.data?.token) {
      patientToken = res.data.token;
      patientUser = res.data.user;
      record('Patient Registration', 'PASS');
    } else {
      record('Patient Registration', 'FAIL', res.data);
    }
  } catch (err: any) {
    record('Patient Registration', 'FAIL', err.response?.data || err.message);
  }

  // Auth Logout with token
  if (patientToken) {
    try {
      const res = await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      if (res.status === 200 && res.data?.success) {
        record('Auth Logout with valid token', 'PASS');
      } else {
        record('Auth Logout with valid token', 'FAIL', res.data);
      }
    } catch (err: any) {
      record('Auth Logout with valid token', 'FAIL', err.response?.data || err.message);
    }
  }

  // Login Patient
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: patientEmail,
      password: 'Password@123'
    });
    if (res.data?.success && res.data?.token) {
      patientToken = res.data.token;
      patientUser = res.data.user;
      record('Patient Login', 'PASS');
    } else {
      record('Patient Login', 'FAIL', res.data);
    }
  } catch (err: any) {
    record('Patient Login', 'FAIL', err.response?.data || err.message);
  }

  // 4. Get Patient Me
  try {
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    if (res.data?.success) {
      record('Get Auth Me', 'PASS');
    } else {
      record('Get Auth Me', 'FAIL', res.data);
    }
  } catch (err: any) {
    record('Get Auth Me', 'FAIL', err.response?.data || err.message);
  }

  // 5. Patient Profile & Friction
  try {
    const res = await axios.get(`${API_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    record('Get Patient Profile', res.data?.success ? 'PASS' : 'FAIL', res.data);
  } catch (err: any) {
    record('Get Patient Profile', 'FAIL', err.response?.data || err.message);
  }

  try {
    const res = await axios.get(`${API_URL}/patients/me/friction`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    record('Get Patient Friction', res.data?.success ? 'PASS' : 'FAIL', res.data);
  } catch (err: any) {
    record('Get Patient Friction', 'FAIL', err.response?.data || err.message);
  }

  try {
    const res = await axios.get(`${API_URL}/patients/me/risk`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    record('Get Patient Risk', res.data?.success ? 'PASS' : 'FAIL', res.data);
  } catch (err: any) {
    record('Get Patient Risk', 'FAIL', err.response?.data || err.message);
  }

  // 6. Hospital listing
  try {
    const res = await axios.get(`${API_URL}/hospitals`);
    record('Get Hospitals List', (res.data?.success || Array.isArray(res.data)) ? 'PASS' : 'FAIL', res.data);
  } catch (err: any) {
    record('Get Hospitals List', 'FAIL', err.response?.data || err.message);
  }

  try {
    const res = await axios.get(`${API_URL}/hospitals/departments`);
    record('Get Hospital Departments', (res.data?.success || Array.isArray(res.data)) ? 'PASS' : 'FAIL', res.data);
  } catch (err: any) {
    record('Get Hospital Departments', 'FAIL', err.response?.data || err.message);
  }

  try {
    const res = await axios.get(`${API_URL}/hospitals/medicines`);
    record('Get Hospital Medicines', (res.data?.success || Array.isArray(res.data)) ? 'PASS' : 'FAIL', res.data);
  } catch (err: any) {
    record('Get Hospital Medicines', 'FAIL', err.response?.data || err.message);
  }

  // 7. Register & Login Doctor
  let doctorToken = '';
  const doctorEmail = `test_doctor_${Date.now()}@example.com`;
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Dr. Anita Sharma',
      email: doctorEmail,
      password: 'Password@123',
      role: 'doctor',
      phone: '+91-9876543211',
      specialization: 'Cardiology'
    });
    if (res.data?.success && res.data?.token) {
      doctorToken = res.data.token;
      record('Doctor Registration', 'PASS');
    } else {
      record('Doctor Registration', 'FAIL', res.data);
    }
  } catch (err: any) {
    record('Doctor Registration', 'FAIL', err.response?.data || err.message);
  }

  if (doctorToken) {
    try {
      const res = await axios.get(`${API_URL}/doctors/profile`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      record('Get Doctor Profile', res.data?.success ? 'PASS' : 'FAIL', res.data);
    } catch (err: any) {
      record('Get Doctor Profile', 'FAIL', err.response?.data || err.message);
    }

    try {
      const res = await axios.get(`${API_URL}/doctors/appointments`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      record('Get Doctor Appointments', res.data?.success ? 'PASS' : 'FAIL', res.data);
    } catch (err: any) {
      record('Get Doctor Appointments', 'FAIL', err.response?.data || err.message);
    }
  }

  // 8. Register & Login ASHA Worker
  let ashaToken = '';
  const ashaEmail = `test_asha_${Date.now()}@example.com`;
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Sunita Devi',
      email: ashaEmail,
      password: 'Password@123',
      role: 'asha',
      phone: '+91-9876543212',
      district: 'Jaipur',
      village: 'Amer'
    });
    if (res.data?.success && res.data?.token) {
      ashaToken = res.data.token;
      record('ASHA Registration', 'PASS');
    } else {
      record('ASHA Registration', 'FAIL', res.data);
    }
  } catch (err: any) {
    record('ASHA Registration', 'FAIL', err.response?.data || err.message);
  }

  if (ashaToken) {
    try {
      const res = await axios.get(`${API_URL}/asha/patients`, {
        headers: { Authorization: `Bearer ${ashaToken}` }
      });
      record('Get ASHA Patients', res.data?.success ? 'PASS' : 'FAIL', res.data);
    } catch (err: any) {
      record('Get ASHA Patients', 'FAIL', err.response?.data || err.message);
    }

    try {
      const res = await axios.get(`${API_URL}/asha/visits`, {
        headers: { Authorization: `Bearer ${ashaToken}` }
      });
      record('Get ASHA Visits', res.data?.success ? 'PASS' : 'FAIL', res.data);
    } catch (err: any) {
      record('Get ASHA Visits', 'FAIL', err.response?.data || err.message);
    }
  }

  // 9. Register & Login Government Official
  let govToken = '';
  const govEmail = `test_gov_${Date.now()}@example.com`;
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Rajesh Verma',
      email: govEmail,
      password: 'Password@123',
      role: 'government',
      department: 'Health & Family Welfare',
      jurisdictionLevel: 'State'
    });
    if (res.data?.success && res.data?.token) {
      govToken = res.data.token;
      record('Government Registration', 'PASS');
    } else {
      record('Government Registration', 'FAIL', res.data);
    }
  } catch (err: any) {
    record('Government Registration', 'FAIL', err.response?.data || err.message);
  }

  if (govToken) {
    try {
      const res = await axios.get(`${API_URL}/government/analytics`, {
        headers: { Authorization: `Bearer ${govToken}` }
      });
      record('Get Government Analytics', res.data?.success ? 'PASS' : 'FAIL', res.data);
    } catch (err: any) {
      record('Get Government Analytics', 'FAIL', err.response?.data || err.message);
    }
  }

  // 10. Register & Login Hospital Admin
  let hospitalToken = '';
  const hospitalEmail = `test_hosp_${Date.now()}@example.com`;
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'City Care Hospital',
      email: hospitalEmail,
      password: 'Password@123',
      role: 'hospital',
      phone: '+91-9876543213',
      hospitalType: 'District Hospital'
    });
    if (res.data?.success && res.data?.token) {
      hospitalToken = res.data.token;
      record('Hospital Registration', 'PASS');
    } else {
      record('Hospital Registration', 'FAIL', res.data);
    }
  } catch (err: any) {
    record('Hospital Registration', 'FAIL', err.response?.data || err.message);
  }

  console.log('\n=== TEST SUMMARY ===');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed > 0) {
    console.log('\nFAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(f => {
      console.log(`- ${f.test}: ${JSON.stringify(f.details)}`);
    });
  }
}

runTests();
