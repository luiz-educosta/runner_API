import { Router } from "express";
import { z } from "zod";
import { LoadLevel } from "@prisma/client";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, HttpError } from "../middleware/error";
import { prisma } from "../db/prisma";

export const workoutsRouter = Router();

const workoutTypeSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  defaultLoadLevel: z.nativeEnum(LoadLevel).default("leve"),
  isAssessment: z.boolean().default(false),
  active: z.boolean().default(true)
});

workoutsRouter.get(
  "/workout-groups",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const groups = await prisma.workoutGroup.findMany({ include: { types: true }, orderBy: { name: "asc" } });
    return res.json(groups);
  })
);

workoutsRouter.get(
  "/workout-types",
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = z.object({ groupId: z.string().optional(), active: z.coerce.boolean().optional() }).parse(req.query);
    const types = await prisma.workoutType.findMany({
      where: { groupId: query.groupId, active: query.active },
      include: { group: true },
      orderBy: { name: "asc" }
    });
    return res.json(types);
  })
);

workoutsRouter.post(
  "/workout-types",
  requireAuth,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const data = workoutTypeSchema.parse(req.body);
    const type = await prisma.workoutType.create({ data, include: { group: true } });
    return res.status(201).json(type);
  })
);

workoutsRouter.patch(
  "/workout-types/:workoutTypeId",
  requireAuth,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const data = workoutTypeSchema.partial().parse(req.body);
    const exists = await prisma.workoutType.findUnique({ where: { id: req.params.workoutTypeId } });
    if (!exists) throw new HttpError(404, "Workout type not found");

    const type = await prisma.workoutType.update({
      where: { id: req.params.workoutTypeId },
      data,
      include: { group: true }
    });

    return res.json(type);
  })
);
