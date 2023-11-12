const rateLimit = require("express-rate-limit");

async function rateLimterConfig(app) {
  const limiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    limit: 10, // Limit each IP to 10 requests per `window` (here, per 3 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: "بیش از 3 بار تست کرده اید",
  });

  // Apply the rate limiting middleware to all requests.
  app.use(limiter);
}

module.exports = { rateLimterConfig };
