import Joi from "joi";

const uuidSchema = Joi.string().guid({
  version: ["uuidv4"],
});
export const getValidationErrors = (id) => {
  const validationErrors = [];

  if (id) {
    const idValidation = uuidSchema.validate(id);
    if (idValidation.error) {
      validationErrors.push(idValidation.error);
    }
  }

  return validationErrors;
};
