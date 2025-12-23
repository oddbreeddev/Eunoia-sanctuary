export const handler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      status: "online", 
      sanctuary: "Eunoia",
      message: "The Oracle is listening." 
    }),
  };
};