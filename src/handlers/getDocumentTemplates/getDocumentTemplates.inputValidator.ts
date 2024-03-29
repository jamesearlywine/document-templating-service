import Joi from "joi";

const validDocTypeValues = ["JobAffidavit", "Adlib"];
const requestSchema = Joi.object({
  docType: Joi.string()
    .valid(...validDocTypeValues)
    .messages({
      "any.required": `queryParam 'docType' is required, valid values are: ${validDocTypeValues.join(
        ",",
      )}`,
    }),
});
export const getValidationErrors = (docType) => {
  const validationErrors = [];

  const validation = requestSchema.validate({ docType });
  if (validation.error) {
    validationErrors.push(validation.error);
  }

  return validationErrors;
};
