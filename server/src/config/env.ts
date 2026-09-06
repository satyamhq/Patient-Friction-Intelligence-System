import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root or local
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseType: process.env.DATABASE_TYPE || 'auto', // 'postgres' | 'mysql' | 'auto'
  databaseUrl: process.env.DATABASE_URL || '',
  pgHost: process.env.PG_HOST || 'localhost',
  pgPort: parseInt(process.env.PG_PORT || '5432', 10),
  pgUser: process.env.PG_USER || 'postgres',
  pgPassword: process.env.PG_PASSWORD || 'postgres',
  pgDatabase: process.env.PG_DATABASE || 'pfis',
  mysqlHost: process.env.MYSQL_HOST || 'localhost',
  mysqlPort: parseInt(process.env.MYSQL_PORT || '3306', 10),
  mysqlUser: process.env.MYSQL_USER || 'root',
  mysqlPassword: process.env.MYSQL_PASSWORD || '',
  mysqlDatabase: process.env.MYSQL_DATABASE || 'pfis',
  jwtSecret: process.env.JWT_SECRET || 'pfis_super_secure_jwt_secret_key_2026_sih',
  jwtExpiresIn: '7d',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  serverUrl: (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, ''),
  nodeEnv: process.env.NODE_ENV || 'development',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
};
