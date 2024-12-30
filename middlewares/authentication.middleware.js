const { verifyUserToken } = require("../services/authentication.service");

function checkForAuthentication(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];

    if (!tokenCookieValue) {
      req.user = null;
      return next();
    }

    try {
      const userPayload = verifyUserToken(tokenCookieValue);
      req.user = userPayload;
      return next();
    } catch (error) {
      // Clear invalid cookie
      res.clearCookie(cookieName);
      req.user = null;
      console.error("Authentication Error:", error.message);
      return next();
    }
  };
}

module.exports = {
  checkForAuthentication,
};
