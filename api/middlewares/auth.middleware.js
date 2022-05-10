const jwt = require('jsonwebtoken');

/**
 * @description A middleware function used for authentification to the API
 * It checks if a jwt token is given either in the header or cookies of the query.
 * If the token is valid, it decode the token and place the user in a 'ctx' object.
 */
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.cookies['x-access-token'];
  if (!token)
    return res.status(403).send('A token is required for authentication');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.ctx = decoded;
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
  return next();
};

module.exports = verifyToken;
