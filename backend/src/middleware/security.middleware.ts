import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { securityConfig } from '../config/security.config';

// Helmet - захист HTTP заголовків
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://via.placeholder.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Загальний ліміт запитів
export const generalRateLimiter = rateLimit(securityConfig.rateLimit);

// Спеціальний ліміт для авторизації (реєстрація/логін)
export const authRateLimiter = rateLimit(securityConfig.authRateLimit);

// Ліміт для API
export const apiRateLimiter = rateLimit(securityConfig.apiRateLimit);