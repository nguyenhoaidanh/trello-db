const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`Using environment config: '${NODE_ENV}'`);

require('dotenv').config({
  path: `.env.${NODE_ENV}`
});

if (NODE_ENV === 'production') {
  // manual setup on production,
  // I don't know???
}

export * from '@/config/database';
export * from '@/config/server';
export { NODE_ENV };
