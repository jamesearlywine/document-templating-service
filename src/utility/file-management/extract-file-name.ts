export const extractFilename = (path: string) => {
  return path.split("/").slice(-1)[0];
};
