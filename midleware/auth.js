const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.cookies['x-access-token'];
  if (!token)
    return res.status(403).send("A token is required for authentication");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.jwtPayload = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
