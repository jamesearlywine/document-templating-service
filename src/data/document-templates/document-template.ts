export const DocumentTemplateType = {
  DocxTemplater: "DocxTemplater",
};
export type DocumentTemplateType =
  (typeof DocumentTemplateType)[keyof typeof DocumentTemplateType];
