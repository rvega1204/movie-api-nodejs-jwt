/**
 * @file validateRequest.js
 * @description Higher-order middleware function to validate request bodies against Zod schemas.
 */

/**
 * Request Validation Middleware Generator
 * Returns a middleware function that checks the request body against the provided Zod schema.
 * If validation fails, it returns a 400 response with a flattened list of error messages.
 * 
 * @function validateRequest
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 * @returns {import('express').RequestHandler} A middleware function.
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    // Perform partial parse
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Map Zod errors to a flat string list for client consumption
      const formatted = result.error.format();

      const flatErrors = Object.values(formatted)
        .flat()
        .filter(Boolean)
        .map((error) => error._errors)
        .flat();

      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: flatErrors.join(", "),
      });
    }

    // Validation passed, proceed to next middleware/controller
    next();
  };
};

export default validateRequest;
