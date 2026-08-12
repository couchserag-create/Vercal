import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

function secret(name: string, developmentValue: string): string {
  const value = process.env[name];
  if (value && value.length >= 32) return value;

  if (isProduction) {
    throw new Error(`${name} must be configured in Vercel and contain at least 32 characters.`);
  }

  return developmentValue;
}

function adminValue(name: string, developmentValue: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) throw new Error(`${name} must be configured in Vercel.`);
  return developmentValue;
}

export const securityConfig = {
  isProduction,
  jwtSecret: secret('JWT_SECRET', 'development-only-jwt-secret-change-before-production'),
  csrfSecret: secret('CSRF_SECRET', 'development-only-csrf-secret-change-before-production'),
  dbEncryptionKey: secret('DB_ENCRYPTION_KEY', 'development-only-db-key-change-before-production'),
  projectAccessSecret: secret('PROJECT_ACCESS_SECRET', 'development-only-project-access-secret-change-before-production'),
  adminEmail: adminValue('ADMIN_EMAIL', 'admin@example.test'),
  adminPassword: adminValue('ADMIN_PASSWORD', 'change-me-in-development'),
};
