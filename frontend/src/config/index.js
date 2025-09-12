/**
 * Config Index
 * Centralized export untuk semua configuration files
 */

// App Config
export * from './app';

// Routes Config
export * from './routes';

// Table Configs
export * from './tableConfigs';

// Re-export default configs
export { default as appConfig } from './app';
export { default as routes } from './routes';
export { default as tableConfigs } from './tableConfigs';
