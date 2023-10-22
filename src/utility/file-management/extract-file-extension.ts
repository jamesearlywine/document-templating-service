import { extractFilename } from "./extract-file-name";

export const extractFileExtension = (path: string) => {
  return extractFilename(path).split(".").slice(-1)[0];
};
