export const extractFilename = (path: string) => {
  return path.split("/").slice(-1)[0];
};

export const extractFileExtension = (path: string) => {
  return extractFilename(path).split(".").slice(-1)[0];
};
