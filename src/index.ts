import { env } from "./config/env";
import { app } from "./app";

app.listen(env.PORT, () => {
  console.log(`runner_API listening on http://localhost:${env.PORT}`);
  console.log(`Swagger available at http://localhost:${env.PORT}/docs`);
});
