import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { config } from './config/env.js';

export const createApp = (): Express => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000',
    config.clientUrl,
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, server-to-server, curl)
        if (!origin) {
          return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/+$/, '');
        if (
          allowedOrigins.includes(normalizedOrigin) ||
          config.nodeEnv === 'development' ||
          config.demoMode ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)
        ) {
          callback(null, true);
        } else {
          console.warn(`[CORS Blocked] Origin: ${origin}`);
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request Rate Limiting (Global API)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests created from this IP, please try again after 15 minutes.',
    },
  });
  app.use('/api', limiter);

  // Stricter Rate Limiting for Authentication & Security-Critical Endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // 60 attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many authentication attempts from this IP. Please wait 15 minutes.',
    },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/onboard', authLimiter);

  // Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Body Parsing
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Static uploads directory for document previews
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // System Health & Open Source Telemetry Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    const memory = process.memoryUsage();
    res.status(200).json({
      status: 'healthy',
      system: 'Patient Friction Intelligence System (PFIS)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: config.nodeEnv,
      appMode: config.appMode,
      demoMode: config.demoMode,
      providers: {
        database: config.databaseType,
        maps: config.mapProvider,
        ai: config.aiProvider,
        storage: config.storageProvider,
      },
      memory: {
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      },
      disclaimer: 'PFIS is an operational healthcare access intelligence platform. All demo data is synthetic. Not for clinical medical diagnosis.',
    });
  });

  // Mount Application Routes
  app.use('/api', routes);

  // 404 Route Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint [${req.method}] ${req.url} does not exist on PFIS server.`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
