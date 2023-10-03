import Joi from "joi";

const requestSchema = Joi.object({
  id: Joi.string().required().uuid().messages({
    "any.required": "pathParam 'id' is required, and must be in uuid format.",
  }),
});
export const getValidationErrors = (id) => {
  const validationErrors = [];

  const validation = requestSchema.validate({ id });
  if (validation.error) {
    validationErrors.push(validation.error);
  }

  return validationErrors;
};
