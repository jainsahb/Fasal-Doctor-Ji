import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`Fasal Doctor Ji API running on :${env.port}`);
});
