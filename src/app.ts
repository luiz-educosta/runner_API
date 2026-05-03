import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { openApiSpec } from "./docs/openapi";
import { authRouter } from "./modules/auth";
import { studentsRouter } from "./modules/students";
import { workoutsRouter } from "./modules/workouts";
import { prescriptionsRouter } from "./modules/prescriptions";
import { logsRouter } from "./modules/logs";
import { teacherRouter } from "./modules/teacher";
import { errorHandler, notFoundHandler } from "./middleware/error";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get("/openapi.json", (_req, res) => res.json(openApiSpec));

app.use("/auth", authRouter);
app.use("/students", studentsRouter);
app.use("/", workoutsRouter);
app.use("/prescriptions", prescriptionsRouter);
app.use("/", logsRouter);
app.use("/teacher", teacherRouter);

app.use(notFoundHandler);
app.use(errorHandler);
