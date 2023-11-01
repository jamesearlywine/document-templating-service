export type retryFunctionOptions = {
  maxRetries: number;
};
export const retry = (
  fn,
  {
    maxRetries,
  }: {
    maxRetries: number;
  },
) => {
  let retries = 0;
  let result;
  const errors = [];

  while (retries < maxRetries) {
    try {
      result = fn();
      break;
    } catch (error) {
      errors.push(error);
      retries++;
      continue;
    }
  }

  return { result, errors };
};
