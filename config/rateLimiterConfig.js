const rateLimit = require("express-rate-limit");


  const otpRateLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 5, // 5 request for easch IP
    standardHeaders: "draft-7", 
    legacyHeaders: false, 
    message:
      "به دلیل درخواست های مکرر بلاک  شدید لطفا بعد از 3 دقیقه دوباره تلاش کنید",
  });

 


module.exports = { otpRateLimiter };
