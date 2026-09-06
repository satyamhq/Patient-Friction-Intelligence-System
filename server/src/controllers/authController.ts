import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Hospital } from '../models/Hospital.js';
import { generateToken } from '../utils/jwt.js';
import { AuditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { RiskEngine } from '../intelligence/risk/riskEngine.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';
import { Doctor } from '../models/Doctor.js';
import { AshaWorker } from '../models/AshaWorker.js';
import { GovernmentOfficial } from '../models/GovernmentOfficial.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

export const ADMIN_EMAILS = [
  'dhirajkumar464748@gmail.com',
  'admin@pfis.org',
  'admin@pfis.gov.in',
  'satyam31sk@gmail.com',
  'admin@gmail.com',
];

export const getDashboardPath = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'hospital':
      return '/hospital/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    case 'asha':
      return '/asha/dashboard';
    case 'government':
      return '/government/dashboard';
    case 'patient':
    default:
      return '/patient/dashboard';
  }
};

export class AuthController {
  public static async loadUserProfile(user: any): Promise<any> {
    if (!user) return null;
    const userId = user._id || user.id;
    if (user.role === 'patient') {
      return await Patient.findOne({ userId })
        .populate('activeFrictionProfileId')
        .populate('activeCareRiskId');
    } else if (user.role === 'hospital') {
      return await Hospital.findOne({ userId });
    } else if (user.role === 'doctor') {
      return await Doctor.findOne({ userId });
    } else if (user.role === 'asha') {
      return await AshaWorker.findOne({ userId });
    } else if (user.role === 'government') {
      return await GovernmentOfficial.findOne({ userId });
    }
    return null;
  }

  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role, phone, ...extraDetails } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

      // CRITICAL SECURITY RULE: Admin role can NEVER be chosen via public registration
      if (role === 'admin' && !isAdmin) {
        await AuditService.log('SECURITY_ALERT_UNAUTHORIZED_ADMIN_REGISTRATION', 'User', req, {
          actorRole: 'unauthenticated',
          details: { attemptedRole: 'admin', email: normalizedEmail },
        });
        res.status(403).json({
          success: false,
          message: 'Security Alert: Administrator accounts cannot be self-registered.',
        });
        return;
      }

      let userRole: any = 'patient';
      if (isAdmin) {
        userRole = 'admin';
      } else if (['hospital', 'doctor', 'asha', 'government', 'patient'].includes(role)) {
        userRole = role;
      } else {
        userRole = 'patient';
      }

      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: userRole,
        phone,
        needsOnboarding: false,
        isActive: true,
      });

      let profileData: any = null;

      if (userRole === 'patient') {
        const count = await Patient.countDocuments();
        const patientCode = `PAT-${1000 + count + 1}`;

        const newPatient = await Patient.create({
          userId: newUser._id,
          patientCode,
          age: extraDetails.age || 38,
          gender: extraDetails.gender || 'female',
          preferredLanguage: extraDetails.preferredLanguage || 'Hindi',
          phone: phone || extraDetails.phone,
          transportAvailability: extraDetails.transportAvailability || 'low',
          digitalAccessLevel: extraDetails.digitalAccessLevel || 'basic',
          familySupport: extraDetails.familySupport || 'low',
          documentationStatus: extraDetails.documentationStatus || 'partial',
          financialAccessibility: extraDetails.financialAccessibility || 'severely_constrained',
          appointmentFlexibility: extraDetails.appointmentFlexibility || 'inflexible_daily_wage',
          residenceType: extraDetails.residenceType || 'rural_remote',
          location: {
            address: extraDetails.address || 'Village Sub-Center',
            city: extraDetails.city || 'Phagwara',
            state: extraDetails.state || 'Punjab',
            pincode: extraDetails.pincode || '144411',
            latitude: extraDetails.latitude || 31.2533,
            longitude: extraDetails.longitude || 75.7042,
            geoJSON: {
              type: 'Point',
              coordinates: [extraDetails.longitude || 75.7042, extraDetails.latitude || 31.2533],
            },
          },
        });

        // Initialize Friction & Risk with real closest hospital distance
        const allH = await Hospital.find({});
        let initialDist = 3.5;
        let initialHosp: any = null;
        if (allH && allH.length > 0) {
          let minD = 999999;
          const pLat = newPatient.location?.latitude || 31.2533;
          const pLng = newPatient.location?.longitude || 75.7042;
          for (const h of allH) {
            const d = FrictionEngine.calculateHaversineDistance(pLat, pLng, h.latitude, h.longitude);
            if (d < minD) {
              minD = d;
              initialHosp = h;
            }
          }
          if (minD < 999999) initialDist = Math.round(minD * 10) / 10;
        }

        const frictionCalc = FrictionEngine.calculate(newPatient.toObject(), initialHosp, initialDist);
        const frictionProfile = await FrictionProfile.create({
          patientId: newPatient._id,
          ...frictionCalc,
        });

        const riskCalc = RiskEngine.evaluate(frictionCalc);
        const careRisk = await CareRisk.create({
          patientId: newPatient._id,
          frictionProfileId: frictionProfile._id,
          ...riskCalc,
        });

        newPatient.activeFrictionProfileId = frictionProfile._id as any;
        newPatient.activeCareRiskId = careRisk._id as any;
        await newPatient.save();
        profileData = newPatient;
      } else if (userRole === 'hospital') {
        profileData = await Hospital.create({
          userId: newUser._id,
          name: extraDetails.hospitalName || `${name} Health Facility`,
          type: extraDetails.type || 'Community Health Center',
          address: extraDetails.address || 'Medical Road',
          city: extraDetails.city || 'Phagwara',
          state: extraDetails.state || 'Punjab',
          pincode: extraDetails.pincode || '144401',
          latitude: extraDetails.latitude || 31.2229,
          longitude: extraDetails.longitude || 75.7725,
          geoJSON: {
            type: 'Point',
            coordinates: [extraDetails.longitude || 75.7725, extraDetails.latitude || 31.2229],
          },
          phone: phone || '01824-260234',
          email: normalizedEmail,
          emergencyAvailable: true,
          totalBeds: extraDetails.totalBeds || 120,
          availableBeds: extraDetails.availableBeds || 28,
          specialistAvailable: true,
        });
      } else if (userRole === 'doctor') {
        profileData = await Doctor.create({
          userId: newUser._id,
          name: name.trim(),
          email: normalizedEmail,
          phone,
          hospitalName: extraDetails.hospitalName || 'Community Health Center',
          department: extraDetails.department || 'General Medicine',
          qualification: extraDetails.qualification || 'MBBS',
          registrationNumber: extraDetails.registrationNumber || `REG-${Math.floor(10000 + Math.random() * 90000)}`,
          specialization: extraDetails.specialization || 'General Practitioner',
          experienceYears: extraDetails.experienceYears || 5,
          opdTimings: '09:00 AM - 02:00 PM',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          consultationFee: 0,
          isAvailable: true,
          totalPatientsConsulted: 0,
        });
      } else if (userRole === 'asha') {
        profileData = await AshaWorker.create({
          userId: newUser._id,
          workerId: `ASHA-${Math.floor(1000 + Math.random() * 9000)}`,
          name: name.trim(),
          email: normalizedEmail,
          phone: phone || '9876501234',
          assignedVillage: extraDetails.assignedVillage || 'Khera Village',
          assignedWard: extraDetails.assignedWard || 'Ward 3',
          district: extraDetails.district || 'Kapurthala',
          state: extraDetails.state || 'Punjab',
          primaryHealthCenter: extraDetails.primaryHealthCenter || 'PHC Chaheru',
          communityPopulation: 1250,
          assignedPatientsCount: 160,
          activeCases: 14,
          languagesSpoken: ['Punjabi', 'Hindi'],
          isFieldActive: true,
        });
      } else if (userRole === 'government') {
        profileData = await GovernmentOfficial.create({
          userId: newUser._id,
          name: name.trim(),
          email: normalizedEmail,
          phone: phone || '01822-232145',
          officialDesignation: extraDetails.officialDesignation || 'District Health Officer',
          department: 'Department of Health & Family Welfare',
          jurisdictionLevel: extraDetails.jurisdictionLevel || 'DISTRICT',
          district: extraDetails.district || 'Kapurthala',
          state: extraDetails.state || 'Punjab',
          officeAddress: 'District Health Administrative Complex',
          clearanceLevel: 'LEVEL_3_DISTRICT',
        });
      }

      const token = generateToken({
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      await AuditService.log('AUTH_REGISTER', 'User', req, {
        userId: newUser._id,
        actorRole: newUser.role,
        details: { email: newUser.email, role: newUser.role },
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          needsOnboarding: false,
        },
        profile: profileData,
        redirectPath: getDashboardPath(newUser.role),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email address or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash || user.password_hash || '');
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email address or password.' });
        return;
      }

      if (ADMIN_EMAILS.includes(normalizedEmail) && user.role !== 'admin') {
        user.role = 'admin';
        user.needsOnboarding = false;
        await user.save();
      }

      const needsOnboarding = !!(user.needsOnboarding || user.needs_onboarding);
      const profile = needsOnboarding ? null : await AuthController.loadUserProfile(user);

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      await AuditService.log('AUTH_LOGIN', 'User', req, {
        userId: user._id,
        actorRole: user.role,
        details: { email: user.email },
      });

      res.status(200).json({
        success: true,
        message: needsOnboarding ? 'Welcome to PFIS! Please complete onboarding.' : 'Login successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          needsOnboarding,
        },
        profile,
        needsOnboarding,
        redirectPath: needsOnboarding ? '/onboarding' : getDashboardPath(user.role),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Login failed.' });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const needsOnboarding = !!(user.needsOnboarding || user.needs_onboarding);
      const profile = needsOnboarding ? null : await AuthController.loadUserProfile(user);

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          needsOnboarding,
        },
        profile,
        needsOnboarding,
        redirectPath: needsOnboarding ? '/onboarding' : getDashboardPath(user.role),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch session.' });
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.user) {
      await AuditService.log('AUTH_LOGOUT', 'User', req, {
        userId: req.user._id,
        actorRole: req.user.role,
      });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }

  public static async completeOnboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { role, profileDetails } = req.body;
      const requestedRole = (role || '').toLowerCase().trim();

      // CRITICAL SECURITY RULE: Admin must NEVER be selectable during public onboarding
      if (requestedRole === 'admin') {
        await AuditService.log('SECURITY_ALERT_UNAUTHORIZED_ADMIN_ONBOARDING_ATTEMPT', 'User', req, {
          userId: user._id,
          actorRole: user.role,
          details: { attemptedRole: 'admin', email: user.email },
        });
        res.status(403).json({
          success: false,
          message: 'Security Alert: Administrator accounts cannot be self-provisioned during onboarding.',
        });
        return;
      }

      const VALID_ROLES = ['patient', 'hospital', 'doctor', 'asha', 'government'];
      if (!VALID_ROLES.includes(requestedRole)) {
        res.status(400).json({
          success: false,
          message: `Invalid role selected. Must be one of: [${VALID_ROLES.join(', ')}]`,
        });
        return;
      }

      user.role = requestedRole as any;
      user.needsOnboarding = false;
      user.needs_onboarding = false;
      if (typeof user.save === 'function') {
        await user.save();
      }

      let profile: any = null;
      const details = profileDetails || {};

      if (requestedRole === 'patient') {
        const count = await Patient.countDocuments();
        const patientCode = `PAT-${1000 + count + 1}`;
        profile = await Patient.create({
          userId: user._id,
          patientCode,
          name: user.name,
          age: details.age || 36,
          gender: details.gender || 'female',
          preferredLanguage: details.preferredLanguage || 'Hindi',
          phone: details.phone || user.phone || '9876543210',
          transportAvailability: details.transportAvailability || 'moderate',
          digitalAccessLevel: details.digitalAccessLevel || 'moderate',
          documentationStatus: details.documentationStatus || 'complete',
          financialAccessibility: details.financialAccessibility || 'moderate_budget',
          residenceType: details.residenceType || 'rural_remote',
          location: {
            address: details.address || 'Village Center',
            city: details.city || 'Phagwara',
            state: details.state || 'Punjab',
            pincode: details.pincode || '144411',
            latitude: details.latitude || 31.2533,
            longitude: details.longitude || 75.7042,
            geoJSON: { type: 'Point', coordinates: [details.longitude || 75.7042, details.latitude || 31.2533] },
          },
        });

        const dummyHosp = { name: 'Civil Hospital', distance: 4.5, type: 'Hospital' };
        const frictionCalc = FrictionEngine.calculate(profile.toObject(), dummyHosp, 4.5);
        const frictionProfile = await FrictionProfile.create({
          patientId: profile._id,
          ...frictionCalc,
        });
        const riskCalc = RiskEngine.evaluate(frictionCalc);
        const careRisk = await CareRisk.create({
          patientId: profile._id,
          frictionProfileId: frictionProfile._id,
          ...riskCalc,
        });
        profile.activeFrictionProfileId = frictionProfile._id as any;
        profile.activeCareRiskId = careRisk._id as any;
        if (profile && typeof profile.save === 'function') {
          await profile.save();
        }
      } else if (requestedRole === 'hospital') {
        profile = await Hospital.create({
          userId: user._id,
          name: details.facilityName || `${user.name} Medical Facility`,
          type: details.facilityType || 'Community Health Center',
          address: details.address || 'GT Road Health Campus',
          city: details.city || 'Kapurthala',
          state: details.state || 'Punjab',
          pincode: details.pincode || '144601',
          latitude: 31.3802,
          longitude: 75.3853,
          geoJSON: { type: 'Point', coordinates: [75.3853, 31.3802] },
          phone: details.phone || user.phone || '01822-232100',
          email: user.email,
          emergencyAvailable: true,
          totalBeds: details.totalBeds || 120,
          availableBeds: details.availableBeds || 35,
          specialistAvailable: true,
        });
      } else if (requestedRole === 'doctor') {
        profile = await Doctor.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: details.phone || user.phone || '9876543210',
          hospitalName: details.hospitalName || 'Sub-Divisional Hospital / PHC',
          department: details.department || 'General Medicine',
          qualification: details.qualification || 'MBBS',
          registrationNumber: details.registrationNumber || `REG-${Math.floor(10000 + Math.random() * 90000)}`,
          specialization: details.specialization || 'Family Medicine',
          experienceYears: details.experienceYears || 5,
          opdTimings: details.opdTimings || '09:00 AM - 02:00 PM',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          consultationFee: 0,
          isAvailable: true,
          totalPatientsConsulted: 0,
        });
      } else if (requestedRole === 'asha') {
        profile = await AshaWorker.create({
          userId: user._id,
          workerId: `ASHA-${Math.floor(1000 + Math.random() * 9000)}`,
          name: user.name,
          email: user.email,
          phone: details.phone || user.phone || '9876501234',
          assignedVillage: details.assignedVillage || 'Khera Village',
          assignedWard: details.assignedWard || 'Ward 3',
          district: details.district || 'Kapurthala',
          state: details.state || 'Punjab',
          primaryHealthCenter: details.primaryHealthCenter || 'PHC Chaheru',
          communityPopulation: 1200,
          assignedPatientsCount: 150,
          activeCases: 12,
          languagesSpoken: ['Punjabi', 'Hindi'],
          isFieldActive: true,
        });
      } else if (requestedRole === 'government') {
        profile = await GovernmentOfficial.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: details.phone || user.phone || '01822-232145',
          officialDesignation: details.officialDesignation || 'District Health Officer',
          department: 'Department of Health & Family Welfare',
          jurisdictionLevel: details.jurisdictionLevel || 'DISTRICT',
          district: details.district || 'Kapurthala',
          state: details.state || 'Punjab',
          officeAddress: details.officeAddress || 'District Administrative Complex',
          clearanceLevel: 'LEVEL_3_DISTRICT',
        });
      }

      const updatedToken = generateToken({
        userId: (user._id || user.id || '').toString(),
        email: user.email,
        role: user.role,
      });

      await AuditService.log('USER_ONBOARDING_COMPLETED', 'User', req, {
        userId: user._id,
        actorRole: user.role,
        details: { assignedRole: requestedRole },
      });

      res.status(200).json({
        success: true,
        message: 'Onboarding completed successfully. Welcome to PFIS!',
        token: updatedToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          needsOnboarding: false,
        },
        profile,
        redirectPath: getDashboardPath(requestedRole),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to complete onboarding' });
    }
  }

  public static async provisionGoogleUser(
    email: string,
    name: string,
    avatarUrl: string,
    role: any,
    req: Request
  ): Promise<{ token: string; user: any; profile: any; isNewUser: boolean; needsOnboarding: boolean; redirectPath: string }> {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Existing user in MongoDB
      if (isAdmin && user.role !== 'admin') {
        user.role = 'admin';
        user.needsOnboarding = false;
        await user.save();
      }
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        await user.save();
      }

      const needsOnboarding = !!(user.needsOnboarding || user.needs_onboarding);
      const profile = needsOnboarding ? null : await AuthController.loadUserProfile(user);

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      await AuditService.log('AUTH_GOOGLE_LOGIN_EXISTING', 'User', req, {
        userId: user._id,
        actorRole: user.role,
        details: { email: user.email, provider: 'google', needsOnboarding },
      });

      return {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          needsOnboarding,
        },
        profile,
        isNewUser: false,
        needsOnboarding,
        redirectPath: needsOnboarding ? '/onboarding' : getDashboardPath(user.role),
      };
    }

    // New user in MongoDB
    const salt = await bcrypt.genSalt(10);
    const dummyPasswordHash = await bcrypt.hash(`google_${Date.now()}_${Math.random()}`, salt);

    if (isAdmin) {
      user = await User.create({
        name: name || 'Dhiraj Kumar (Executive Admin)',
        email: normalizedEmail,
        passwordHash: dummyPasswordHash,
        role: 'admin',
        avatarUrl,
        needsOnboarding: false,
        isActive: true,
      });

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          needsOnboarding: false,
        },
        profile: null,
        isNewUser: false,
        needsOnboarding: false,
        redirectPath: '/admin/dashboard',
      };
    }

    // New Public User: Minimal secure user record, prompts onboarding (Admin never selectable!)
    user = await User.create({
      name: name || 'PFIS User',
      email: normalizedEmail,
      passwordHash: dummyPasswordHash,
      role: 'patient', // provisional until onboarding choice
      avatarUrl,
      needsOnboarding: true,
      isActive: true,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await AuditService.log('AUTH_GOOGLE_NEW_USER_CREATED', 'User', req, {
      userId: user._id,
      actorRole: user.role,
      details: { email: user.email, provider: 'google', needsOnboarding: true },
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        needsOnboarding: true,
      },
      profile: null,
      isNewUser: true,
      needsOnboarding: true,
      redirectPath: '/onboarding',
    };
  }

  public static async provisionAndLoginGoogleUser(
    email: string,
    name: string,
    avatarUrl: string,
    role: any,
    req: Request,
    res: Response
  ): Promise<void> {
    const { token, user, profile, isNewUser, needsOnboarding, redirectPath } = await AuthController.provisionGoogleUser(email, name, avatarUrl, role, req);

    res.status(200).json({
      success: true,
      message: needsOnboarding ? 'Welcome to PFIS! Please complete onboarding.' : 'Google authentication successful.',
      token,
      user,
      profile,
      isNewUser,
      needsOnboarding,
      redirectPath,
    });
  }

  public static async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { credential, role, profileData } = req.body;

      if (!credential) {
        res.status(400).json({ success: false, message: 'Google credential token is required.' });
        return;
      }

      let email = '';
      let name = '';
      let avatarUrl = '';

      if (typeof credential === 'string' && credential.includes('.')) {
        try {
          const googleRes = await axios.get(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
            { timeout: 5000 }
          );
          const payload = googleRes.data;
          email = (payload.email || '').toLowerCase().trim();
          name = payload.name || payload.given_name || email.split('@')[0];
          avatarUrl = payload.picture || '';
        } catch {
          try {
            const parts = credential.split('.');
            if (parts.length >= 2) {
              const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
              email = (decoded.email || '').toLowerCase().trim();
              name = decoded.name || email.split('@')[0];
              avatarUrl = decoded.picture || '';
            }
          } catch {
            // handled below
          }
        }
      }

      if (!email && profileData?.email) {
        email = profileData.email.toLowerCase().trim();
        name = profileData.name || email.split('@')[0];
        avatarUrl = profileData.avatarUrl || '';
      }

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Unable to verify Google credential. Please ensure a valid Google account is selected.',
        });
        return;
      }

      await AuthController.provisionAndLoginGoogleUser(email, name, avatarUrl, role, req, res);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Google authentication failed.' });
    }
  }

  public static async getGoogleConfig(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      configured: !!config.googleClientId,
      clientId: config.googleClientId,
      clientSecretConfigured: !!config.googleClientSecret,
    });
  }

  public static async saveGoogleClientId(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.body;
      if (!clientId || typeof clientId !== 'string') {
        res.status(400).json({ success: false, message: 'Valid clientId is required.' });
        return;
      }

      config.googleClientId = clientId.trim();

      const envPaths = [
        path.resolve(process.cwd(), '../.env'),
        path.resolve(process.cwd(), '.env'),
      ];

      for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
          let content = fs.readFileSync(envPath, 'utf-8');
          if (content.includes('GOOGLE_CLIENT_ID=')) {
            content = content.replace(/GOOGLE_CLIENT_ID=.*/g, `GOOGLE_CLIENT_ID=${config.googleClientId}`);
          } else {
            content += `\nGOOGLE_CLIENT_ID=${config.googleClientId}`;
          }

          if (content.includes('VITE_GOOGLE_CLIENT_ID=')) {
            content = content.replace(/VITE_GOOGLE_CLIENT_ID=.*/g, `VITE_GOOGLE_CLIENT_ID=${config.googleClientId}`);
          } else {
            content += `\nVITE_GOOGLE_CLIENT_ID=${config.googleClientId}`;
          }
          fs.writeFileSync(envPath, content, 'utf-8');
        }
      }

      res.status(200).json({
        success: true,
        message: 'Google Client ID saved successfully to environment.',
        clientId: config.googleClientId,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to save Google Client ID.' });
    }
  }

  public static async initiateGoogleOAuth(req: Request, res: Response): Promise<void> {
    try {
      const role = (req.query.role as string) || 'patient';
      const clientId = (config.googleClientId || '').trim();

      if (!clientId) {
        return res.redirect(
          `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent(
            'GOOGLE_CLIENT_ID is not configured on the backend server.'
          )}`
        );
      }

      const callbackUrl = `${config.serverUrl}/api/auth/google/callback`;
      const scope = encodeURIComponent('openid email profile');
      const state = encodeURIComponent(JSON.stringify({ role, clientId }));

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

      res.redirect(authUrl);
    } catch (error: any) {
      console.error('[Google OAuth Initiate Error]', error);
      res.redirect(
        `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent(
          error.message || 'Failed to initiate Google OAuth.'
        )}`
      );
    }
  }

  public static async handleGoogleCallbackGet(req: Request, res: Response): Promise<void> {
    try {
      const { code, state, error, error_description } = req.query;

      if (error || error_description) {
        const errMsg = (error_description || error || 'Google authentication was cancelled or rejected.') as string;
        return res.redirect(`${config.clientUrl}/auth/google/callback?error=${encodeURIComponent(errMsg)}`);
      }

      if (!code || typeof code !== 'string') {
        return res.redirect(
          `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent('No authorization code was provided by Google.')}`
        );
      }

      if (!config.googleClientId || !config.googleClientSecret) {
        return res.redirect(
          `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent('Google OAuth credentials are not configured on backend.')}`
        );
      }

      let role: any = 'patient';
      try {
        if (state && typeof state === 'string') {
          const parsed = JSON.parse(decodeURIComponent(state));
          role = parsed.role || 'patient';
        }
      } catch {
        role = (state as string) || 'patient';
      }

      const callbackUrl = `${config.serverUrl}/api/auth/google/callback`;

      // Exchange authorization code for tokens with Google OAuth
      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: config.googleClientId,
          client_secret: config.googleClientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        }
      );

      const { access_token } = tokenRes.data;

      // Fetch user profile from Google's official userinfo endpoint
      const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 10000,
      });

      const profile = userInfoRes.data;
      const email = (profile.email || '').toLowerCase().trim();
      const name = profile.name || profile.given_name || email.split('@')[0];
      const avatarUrl = profile.picture || '';

      if (!email) {
        return res.redirect(
          `${config.clientUrl}/auth/google/callback?error=${encodeURIComponent('Could not extract email address from Google profile.')}`
        );
      }

      const { token, user } = await AuthController.provisionGoogleUser(email, name, avatarUrl, role, req);
      const encodedUser = encodeURIComponent(JSON.stringify(user));

      return res.redirect(
        `${config.clientUrl}/auth/google/callback?token=${encodeURIComponent(token)}&user=${encodedUser}`
      );
    } catch (error: any) {
      console.error('[GoogleCallback GET Error]', error.response?.data || error.message);
      const msg =
        error.response?.data?.error_description ||
        error.response?.data?.error ||
        error.message ||
        'Google OAuth exchange failed.';
      return res.redirect(`${config.clientUrl}/auth/google/callback?error=${encodeURIComponent(msg)}`);
    }
  }

  public static async getGoogleAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const role = (req.query.role as string) || 'admin';
      const clientId = ((req.query.clientId as string) || config.googleClientId || '').trim();

      if (!clientId) {
        res.status(400).json({
          success: false,
          message: 'GOOGLE_CLIENT_ID is not configured. Please supply your Google Cloud Client ID.',
        });
        return;
      }

      const redirectUri = `${config.serverUrl}/api/auth/google/callback`;
      const scope = encodeURIComponent('openid email profile');
      const state = encodeURIComponent(JSON.stringify({ role, clientId }));

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

      res.status(200).json({
        success: true,
        url: authUrl,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to generate Google auth URL' });
    }
  }

  public static async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, role, clientId, redirectUri: customRedirectUri } = req.body;

      if (!code) {
        res.status(400).json({ success: false, message: 'Authorization code is required from Google.' });
        return;
      }

      const effectiveClientId = ((clientId || config.googleClientId || '') as string).trim();
      if (!effectiveClientId) {
        res.status(400).json({ success: false, message: 'Google Client ID is missing.' });
        return;
      }

      const redirectUri = customRedirectUri || `${config.serverUrl}/api/auth/google/callback`;

      // Exchange authorization code for tokens with Google OAuth
      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: effectiveClientId,
          client_secret: config.googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        }
      );

      const { access_token } = tokenRes.data;

      // Fetch user profile from Google's official userinfo endpoint
      const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 10000,
      });

      const profile = userInfoRes.data;
      const email = (profile.email || '').toLowerCase().trim();
      const name = profile.name || profile.given_name || email.split('@')[0];
      const avatarUrl = profile.picture || '';

      if (!email) {
        res.status(400).json({ success: false, message: 'Could not extract email from Google profile.' });
        return;
      }

      await AuthController.provisionAndLoginGoogleUser(email, name, avatarUrl, role, req, res);
    } catch (error: any) {
      console.error('[GoogleCallback Error]', error.response?.data || error.message);
      const msg =
        error.response?.data?.error_description ||
        error.response?.data?.error ||
        error.message ||
        'Google OAuth exchange failed.';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Please enter your registered email address.' });
        return;
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'No account was found with this email address. Please check and try again.',
        });
        return;
      }

      // Generate a mock reset token
      const resetToken = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');
      const resetLink = `/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

      res.status(200).json({
        success: true,
        message: 'Password reset instructions ready. Use the secure reset link below to update your password.',
        resetToken,
        resetLink,
      });
    } catch (error: any) {
      console.error('[ForgotPassword Error]', error);
      res.status(500).json({ success: false, message: 'Could not process password reset request.' });
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, token, newPassword } = req.body;
      if (!email || !newPassword) {
        res.status(400).json({ success: false, message: 'Email and new password are required.' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
        return;
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        res.status(404).json({ success: false, message: 'Account not found.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      user.passwordHash = newHash;
      user.password_hash = newHash;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Your password has been successfully reset! You can now login with your new credentials.',
      });
    } catch (error: any) {
      console.error('[ResetPassword Error]', error);
      res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
    }
  }
}
