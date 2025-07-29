const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    res.status(429).send('Too many requests, please try again later.');
  },
});

module.exports = (req, res, next) => {
  helmet()(req, res, () => {
    cors()(req, res, () => {
      rateLimiter(req, res, next);
    });
  });
};
