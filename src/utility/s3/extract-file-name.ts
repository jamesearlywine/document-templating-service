export const extractFilename = (path: string) => {
  return path.split("/").pop();
};

export const extractFileExtension = (path: string) => {
  return extractFilename(path).split(".").pop();
};
