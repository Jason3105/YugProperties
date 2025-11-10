// Configuration for API endpoints
const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://yugproperties.onrender.com',
  SITE_URL: process.env.REACT_APP_SITE_URL || 'https://yug-properties-frontend.onrender.com',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};

export default config;
