const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  else {
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY);
    } 
    catch (err) {
      return res.status(401).send("Token expired");
    }
  }
  return next();
};

module.exports = verifyToken;
