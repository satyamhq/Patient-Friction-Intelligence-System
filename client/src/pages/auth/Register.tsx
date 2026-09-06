import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { User, Building2, Mail, Lock, Phone, MapPin } from 'lucide-react';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'hospital' ? 'hospital' : 'patient';
  const { coords, requestCurrentLocation } = useLocation();

  const [role, setRole] = useState<'patient' | 'hospital'>(initialRole);
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
  const [hospitalType, setHospitalType] = useState('Government');

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
        address: address || coords.address || 'UniCenter, LPU Campus',
        latitude: coords.latitude,
        longitude: coords.longitude,
        pincode: coords.pincode || '144411',
      };

      if (role === 'patient') {
        payload.age = age;
        payload.gender = gender;
        payload.preferredLanguage = preferredLanguage;
        payload.transportAvailability = transportAvailability;
      } else {
        payload.hospitalName = hospitalName || name;
        payload.type = hospitalType;
      }

      const res = await register(payload);
      if (res.success) {
        if (res.user.role === 'patient') navigate('/patient/dashboard');
        else navigate('/hospital/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h2>
        <p className="text-xs text-slate-500">Join the Patient Friction Intelligence System</p>
      </div>

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setRole('patient')}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            role === 'patient'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Patient Account</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('hospital')}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            role === 'hospital'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hospital Facility</span>
        </button>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={role === 'patient' ? 'Full Name' : 'Administrator Full Name'}
          placeholder={role === 'patient' ? 'e.g. Sunita Devi' : 'e.g. Dr. A. K. Sharma'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {role === 'hospital' && (
          <Input
            label="Hospital / Medical Facility Name"
            placeholder="e.g. Apollo Super Speciality Hospital"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            required
          />
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
                  { label: 'Santali', value: 'Santali' },
                  { label: 'English', value: 'English' },
                  { label: 'Bengali', value: 'Bengali' },
                  { label: 'Mundari', value: 'Mundari' },
                  { label: 'Kurukh', value: 'Kurukh' },
                ]}
              />
            </div>

            <Select
              label="Transportation Availability"
              value={transportAvailability}
              onChange={(e) => setTransportAvailability(e.target.value)}
              options={[
                { label: 'No Vehicle / Irregular Rural Bus (High Barrier)', value: 'none' },
                { label: 'Shared Auto / Infrequent Bus (Moderate Barrier)', value: 'low' },
                { label: 'Regular Public Transit / Multi-Hop', value: 'moderate' },
                { label: 'Personal Vehicle / Two-Wheeler (High Autonomy)', value: 'high' },
              ]}
            />
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Habitation / Village / Area"
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
          Create {role === 'patient' ? 'Patient' : 'Hospital'} Account
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
          Sign In
        </Link>
      </div>
    </div>
  );
};
