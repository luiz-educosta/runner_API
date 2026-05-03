import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string().min(16).default("change-me-in-production"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  PORT: z.coerce.number().default(3333),
  CORS_ORIGIN: z.string().default("*")
});

export const env = envSchema.parse(process.env);
