//checkAccess.js
const checkRole = (role) => (req, res, next) => {
  if (req.user && req.user.roles.includes(role)) {
    console.log(`role is ${req.user.roles}`);
    return next();
  }
  res.status(403).json({ error: "شما دسترسی ندارید", Access: false });
};

module.exports = { checkRole };
