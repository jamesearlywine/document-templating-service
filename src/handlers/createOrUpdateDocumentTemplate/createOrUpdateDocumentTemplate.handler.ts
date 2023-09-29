export const handler = async (event: Record<string, unknown>) => {
  return {
    message: "Hello after cdk update",
    event,
    env: process.env,
  };
};
