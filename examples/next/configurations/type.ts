export type Config = {
  CONFIG_NAME: 'dev' | 'stage';
  NEXT_PUBLIC_PROJECT_ID: string;
  NEXT_PUBLIC_STORAGE_BUCKET: string;
  PRIVATE_KEY: string;
  CLIENT_EMAIL: string;
  DATABASE_URL: string;
  API_BASE_URL: string;
  DEV_HOST_URL: string;
};
