import Joi from "joi";

const uuidSchema = Joi.string().guid({
  version: ["uuidv4"],
});

const documentTemplateSchema = Joi.object({
  templateName: Joi.string().required(),
  docType: Joi.string().required(),
  id: Joi.string(),
  description: Joi.string(),
  storageLocation: Joi.string(),
  filepath: Joi.string(),
  fileExtension: Joi.string(),
  templateKeyDescriptions: Joi.object(),
  sampleDocumentData: Joi.object(),
  sampleGeneratedDocumentUrl: Joi.string(),
  creationStatus: Joi.string(),
  created: Joi.string(),
  updated: Joi.string(),
});

export const getValidationErrors = (id, requestBody) => {
  const validationErrors = [];

  if (id) {
    const idValidation = uuidSchema.validate(id);
    if (idValidation.error) {
      validationErrors.push(idValidation.error);
    }
  }

  const documentTemplateValidation = documentTemplateSchema.validate(requestBody);
  if (documentTemplateValidation.error) {
    validationErrors.push(documentTemplateValidation.error);
  }

  return validationErrors;
};
