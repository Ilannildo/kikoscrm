const ROUNDS_OF_HASHING = 10;
const ACCESS_TTL_SECONDS = 1 * 60 * 60;
const REFRESH_TTL_DAYS = 7;
const DOMAIN_REFERENCE = '.kikos.teragestor.com';
const CORS_ALLOWED_ORIGINS = ['http://localhost:3000', 'https://api.kikos.teragestor.com', 'https://app.kikos.teragestor.com'];

export { ACCESS_TTL_SECONDS, CORS_ALLOWED_ORIGINS, REFRESH_TTL_DAYS, ROUNDS_OF_HASHING, DOMAIN_REFERENCE };
