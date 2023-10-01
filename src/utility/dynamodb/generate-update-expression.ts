import { marshall } from "@aws-sdk/util-dynamodb";

export const generateUpdateExpression = (object) => {
  const exp = {
    UpdateExpression: "set",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };
  for (const [key, value] of Object.entries(object)) {
    exp.UpdateExpression += ` #${key} = :${key},`;
    exp.ExpressionAttributeNames[`#${key}`] = key;
    exp.ExpressionAttributeValues[`:${key}`] = marshall(value);
  }

  // remove trailing comma
  exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);

  return exp;
};
