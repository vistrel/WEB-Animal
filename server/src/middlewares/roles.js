const ApiError = require("../utils/api-error");

function allowRoles(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return next(new ApiError(401, "Потрібна авторизація"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Недостатньо прав доступу"));
    }

    next();
  };
}

module.exports = allowRoles;
