const ApiError = require("../utils/api-error");

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Потрібна авторизація"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Недостатньо прав доступу"));
    }

    next();
  };
}

const allowRoles = requireRoles;

module.exports = allowRoles;
module.exports.allowRoles = allowRoles;
module.exports.requireRoles = requireRoles;
