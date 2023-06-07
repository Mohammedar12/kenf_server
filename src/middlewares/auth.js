const config = require("../config/config");

const auth =
  (roles, allow_if_app = false) =>
  (req, res, next) => {
    if (req.session?.user?.id) {
      if (!roles || roles === "" || roles === []) {
        req.user = req.session.user;
        next();
      } else if (Array.isArray(roles)) {
        if (roles.includes(req.session.user.role)) {
          req.user = req.session.user;
          next();
        } else {
          if (allow_if_app) {
            if (req.headers.token === config.frontendToken) {
              req.user = req.session.user;
              next();
            }
          } else {
            res.status(403).send({
              status: 403,
              message: "Unauthorized request",
            });
          }
        }
      } else {
        if (roles === req.session.user.role) {
          req.user = req.session.user;
          next();
        } else {
          if (allow_if_app) {
            if (req.headers.token === config.frontendToken) {
              req.user = req.session.user;
              next();
            }
          } else {
            console.log("sdfsdf2");
            res.status(403).send({
              status: 403,
              message: "Unauthorized request",
            });
          }
        }
      }
    } else {
      if (allow_if_app) {
        if (req.headers.token === config.frontendToken) {
          next();
        } else {
          res.status(401).send({
            status: 401,
            message: "Unauthenticated request",
          });
        }
      } else {
        res.status(401).send({
          status: 401,
          message: "Unauthenticated request",
        });
      }
    }
  };
module.exports = auth;
