export const presignupHandler = async (event: any, context: any) => {
  console.log(event);
  // throw new Error("Failed to save data in DynamoDB.");
  return event;
};
