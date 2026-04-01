const ApiError = require("../utils/api-error");

function validate(schema) {
  return function validationMiddleware(req, res, next) {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return next(new ApiError(400, firstIssue.message));
    }

    req.validated = result.data;
    next();
  };
}

module.exports = validate;
