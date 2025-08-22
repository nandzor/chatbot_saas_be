// Deployment Configuration for Chatbot SaaS
// This file helps configure the application for different deployment environments

const path = require('path');

// Environment configurations
const configs = {
  development: {
    name: 'Development',
    baseUrl: '/',
    apiBaseUrl: 'http://localhost:3000',
    publicPath: '/',
    buildDir: 'dist',
    sourceMap: true,
    minify: false,
    env: 'development'
  },
  staging: {
    name: 'Staging',
    baseUrl: '/chatbot-saas/',
    apiBaseUrl: 'http://100.81.120.54:9999',
    publicPath: '/chatbot-saas/',
    buildDir: 'dist',
    sourceMap: true,
    minify: true,
    env: 'staging'
  },
  production: {
    name: 'Production',
    baseUrl: '/chatbot-saas/',
    apiBaseUrl: 'http://100.81.120.54:9999',
    publicPath: '/chatbot-saas/',
    buildDir: 'dist',
    sourceMap: false,
    minify: true,
    env: 'production'
  }
};

// Get current environment
const getEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  return env;
};

// Get configuration for current environment
const getConfig = (env = null) => {
  const currentEnv = env || getEnvironment();
  const config = configs[currentEnv];
  
  if (!config) {
    throw new Error(`Unknown environment: ${currentEnv}`);
  }
  
  return config;
};

// Validate configuration
const validateConfig = (config) => {
  const required = ['baseUrl', 'apiBaseUrl', 'publicPath', 'buildDir'];
  
  for (const field of required) {
    if (!config[field]) {
      throw new Error(`Missing required configuration field: ${field}`);
    }
  }
  
  return true;
};

// Print configuration information
const printConfig = (config) => {
  console.log(`🚀 Deploying to ${config.name} environment`);
  console.log(`📍 Base URL: ${config.baseUrl}`);
  console.log(`🔗 API Base URL: ${config.apiBaseUrl}`);
  console.log(`📁 Public Path: ${config.publicPath}`);
  console.log(`📦 Build Directory: ${config.buildDir}`);
  console.log(`🗺️  Source Maps: ${config.sourceMap ? 'Enabled' : 'Disabled'}`);
  console.log(`⚡ Minification: ${config.minify ? 'Enabled' : 'Disabled'}`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log('');
};

// Main configuration object
const config = {
  // Get current environment
  getEnvironment,
  
  // Get configuration for environment
  getConfig,
  
  // Validate configuration
  validateConfig,
  
  // Print configuration
  printConfig,
  
  // Get all available environments
  getEnvironments: () => Object.keys(configs),
  
  // Get all configurations
  getAllConfigs: () => configs,
  
  // Check if environment is production
  isProduction: (env = null) => {
    const currentEnv = env || getEnvironment();
    return currentEnv === 'production';
  },
  
  // Check if environment is staging
  isStaging: (env = null) => {
    const currentEnv = env || getEnvironment();
    return currentEnv === 'staging';
  },
  
  // Check if environment is development
  isDevelopment: (env = null) => {
    const currentEnv = env || getEnvironment();
    return currentEnv === 'development';
  }
};

// Auto-print configuration when imported
if (require.main === module) {
  const currentConfig = getConfig();
  validateConfig(currentConfig);
  printConfig(currentConfig);
}

module.exports = config;
