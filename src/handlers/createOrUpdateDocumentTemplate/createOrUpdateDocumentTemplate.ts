export const handler = async (event: Record<string, unknown>) => {
  return {
    message: "HELLO!",
    event,
  };
};
