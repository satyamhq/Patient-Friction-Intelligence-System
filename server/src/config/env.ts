import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root or local
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appMode: (process.env.APP_MODE || (process.env.DEMO_MODE === 'false' ? 'development' : 'demo')) as
    | 'demo'
    | 'development'
    | 'production',
  demoMode: process.env.DEMO_MODE !== 'false',

  // Database Configuration
  databaseType: process.env.DATABASE_TYPE || 'auto', // 'auto' | 'postgres' | 'mongodb' | 'mysql' | 'embedded'
  databaseUrl: process.env.DATABASE_URL || process.env.MONGODB_URI || '',
  mongodbUri: process.env.MONGODB_URI || process.env.DATABASE_URL || '',
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

  // Authentication & Security
  jwtSecret: process.env.JWT_SECRET || 'pfis_dev_local_secret_key_change_in_production',
  jwtExpiresIn: '7d',
  adminEmails: (process.env.ADMIN_EMAILS || 'admin@pfis.org,sysadmin@pfis.local')
    .split(',')
    .map((e) => e.trim().toLowerCase()),

  // Maps & Geocoding Provider: 'osm' | 'google'
  mapProvider: (process.env.MAP_PROVIDER || 'osm') as 'osm' | 'google',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',

  // AI Intelligence Provider: 'none' | 'ollama' | 'openai'
  aiProvider: (process.env.AI_PROVIDER || 'none') as 'none' | 'ollama' | 'openai',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3:8b',
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // Storage Provider: 'local' | 'minio' | 's3'
  storageProvider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 'minio' | 's3',

  // Networking URLs
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  serverUrl: (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, ''),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
};

