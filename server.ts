import "dotenv/config";

import app from "./app";

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
});
