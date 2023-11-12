const rateLimit = require("express-rate-limit");


  const otpRateLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 5, // Limit each IP to 10 requests per `window` (here, per 3 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message:
      "به دلیل درخواست های مکرر بلاک  شدید لطفا بعد از 3 دقیقه دوباره تلاش کنید",
  });

 


module.exports = { otpRateLimiter };
