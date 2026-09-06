import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { User, Building2, Mail, Lock, Phone, MapPin, Stethoscope, Users as UsersIcon, ShieldCheck } from 'lucide-react';
import { getRoleDashboard } from './Login';

export type RegisterRole = 'patient' | 'doctor' | 'hospital' | 'asha' | 'government';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paramRole = searchParams.get('role');
  const initialRole: RegisterRole =
    paramRole === 'doctor' || paramRole === 'hospital' || paramRole === 'asha' || paramRole === 'government'
      ? paramRole
      : 'patient';

  const { coords } = useLocation();

  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Patient Specific
  const [age, setAge] = useState(42);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [preferredLanguage, setPreferredLanguage] = useState('Hindi');
  const [transportAvailability, setTransportAvailability] = useState('low');
  const [city, setCity] = useState(coords.city || 'Phagwara');
  const [address, setAddress] = useState(coords.address || 'UniCenter, LPU Campus');

  // Hospital Specific
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState('Community Health Center');

  // Doctor Specific
  const [qualification, setQualification] = useState('MBBS, MD');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // ASHA Specific
  const [assignedVillage, setAssignedVillage] = useState('Khera Village');
  const [primaryHealthCenter, setPrimaryHealthCenter] = useState('PHC Chaheru');

  // Government Specific
  const [officialDesignation, setOfficialDesignation] = useState('District Chief Medical Officer');
  const [district, setDistrict] = useState('Kapurthala');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        name,
        email,
        password,
        role,
        phone,
        city: city || coords.city || 'Phagwara',
        address: address || coords.address || 'Medical Complex',
        latitude: coords.latitude || 31.2533,
        longitude: coords.longitude || 75.7042,
        pincode: coords.pincode || '144411',
      };

      if (role === 'patient') {
        payload.age = age;
        payload.gender = gender;
        payload.preferredLanguage = preferredLanguage;
        payload.transportAvailability = transportAvailability;
      } else if (role === 'hospital') {
        payload.hospitalName = hospitalName || name;
        payload.type = hospitalType;
      } else if (role === 'doctor') {
        payload.qualification = qualification;
        payload.specialization = specialization;
        payload.registrationNumber = registrationNumber || `REG-${Math.floor(10000 + Math.random() * 90000)}`;
        payload.hospitalName = hospitalName || 'Community Health Center';
      } else if (role === 'asha') {
        payload.assignedVillage = assignedVillage;
        payload.primaryHealthCenter = primaryHealthCenter;
      } else if (role === 'government') {
        payload.officialDesignation = officialDesignation;
        payload.district = district;
      }

      const res = await register(payload);
      if (res.success) {
        navigate(getRoleDashboard(res.user?.role || role));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create an Account</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Join the Patient Friction Intelligence System</p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setRole('patient')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all ${
            role === 'patient'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Patient</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('doctor')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all ${
            role === 'doctor'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('hospital')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all ${
            role === 'hospital'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Facility</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('asha')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all ${
            role === 'asha'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UsersIcon className="w-3.5 h-3.5" />
          <span>ASHA</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('government')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition-all col-span-2 sm:col-span-1 ${
            role === 'government'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Govt</span>
        </button>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={
            role === 'patient'
              ? 'Full Name'
              : role === 'doctor'
              ? 'Doctor Full Name (with title)'
              : role === 'hospital'
              ? 'Facility Administrator Name'
              : role === 'asha'
              ? 'ASHA Worker Name'
              : 'Official Full Name'
          }
          placeholder={
            role === 'patient'
              ? 'e.g. Sunita Devi'
              : role === 'doctor'
              ? 'e.g. Dr. Alok Verma'
              : role === 'hospital'
              ? 'e.g. Medical Superintendent'
              : role === 'asha'
              ? 'e.g. Anita Devi'
              : 'e.g. Dr. K. S. Randhawa'
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {role === 'hospital' && (
          <Input
            label="Hospital / Medical Facility Name"
            placeholder="e.g. District General Hospital"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            required
          />
        )}

        {role === 'doctor' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Medical Qualification"
              placeholder="e.g. MBBS, MD"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              required
            />
            <Input
              label="Specialization"
              placeholder="e.g. General Medicine"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
            <Input
              label="State Medical Council Reg. Number"
              placeholder="e.g. PMC-48291"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
            <Input
              label="Associated Facility / Clinic Name"
              placeholder="e.g. Civil Hospital"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
            />
          </div>
        )}

        {role === 'asha' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Assigned Habitation / Village"
              placeholder="e.g. Hesal Village"
              value={assignedVillage}
              onChange={(e) => setAssignedVillage(e.target.value)}
              required
            />
            <Input
              label="Parent Primary Health Centre (PHC)"
              placeholder="e.g. Angara PHC"
              value={primaryHealthCenter}
              onChange={(e) => setPrimaryHealthCenter(e.target.value)}
              required
            />
          </div>
        )}

        {role === 'government' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Official Designation"
              placeholder="e.g. District Chief Medical Officer"
              value={officialDesignation}
              onChange={(e) => setOfficialDesignation(e.target.value)}
              required
            />
            <Input
              label="Jurisdiction District"
              placeholder="e.g. Kapurthala"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
          />
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        {role === 'patient' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                min={1}
                max={120}
                required
              />

              <Select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                options={[
                  { label: 'Female', value: 'female' },
                  { label: 'Male', value: 'male' },
                  { label: 'Other', value: 'other' },
                ]}
              />

              <Select
                label="Primary Language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                options={[
                  { label: 'Hindi', value: 'Hindi' },
                  { label: 'Punjabi', value: 'Punjabi' },
                  { label: 'English', value: 'English' },
                  { label: 'Bengali', value: 'Bengali' },
                ]}
              />
            </div>

            <Select
              label="Transportation Availability"
              value={transportAvailability}
              onChange={(e) => setTransportAvailability(e.target.value)}
              options={[
                { label: 'No Vehicle / Irregular Bus (High Friction)', value: 'none' },
                { label: 'Shared Auto / Infrequent Bus (Moderate Friction)', value: 'low' },
                { label: 'Regular Transit (Manageable)', value: 'moderate' },
                { label: 'Personal Vehicle / Two-Wheeler (High Autonomy)', value: 'high' },
              ]}
            />
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Area / Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            icon={<MapPin className="w-4 h-4" />}
          />
          <Input
            label="City / District"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400">
          Sign In
        </Link>
      </div>
    </div>
  );
};
