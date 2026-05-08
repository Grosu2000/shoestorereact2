export const securityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 100, // максимум 100 запитів з одного IP
    message: 'Забагато запитів, будь ласка, спробуйте пізніше',
    skipSuccessfulRequests: false,
  },
  authRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 5, // максимум 5 спроб входу за 15 хвилин
    message: 'Забагато спроб входу. Спробуйте через 15 хвилин',
  },
  apiRateLimit: {
    windowMs: 60 * 1000, // 1 хвилина
    max: 30, // 30 запитів на хвилину для API
  },
  corsOptions: {
    origin: [
      'http://localhost:5173',
      'https://shoestore-frontend-relz.onrender.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
};