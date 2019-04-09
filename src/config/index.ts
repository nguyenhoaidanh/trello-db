const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`Using environment config: '${NODE_ENV}'`);

require('dotenv').config({
  path: `.env.${NODE_ENV}`
});

export * from '@config/database';
export * from '@config/server';
export { NODE_ENV };
