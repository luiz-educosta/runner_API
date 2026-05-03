import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, HttpError } from "../middleware/error";
import { prisma } from "../db/prisma";

export const logsRouter = Router();

const logSchema = z.object({
  prescriptionItemId: z.string().min(1),
  completedAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  distanceKm: z.number().positive().optional(),
  pace: z.string().optional(),
  rpe: z.number().int().min(0).max(10).optional(),
  painLevel: z.number().int().min(0).max(10).optional(),
  fatigueLevel: z.number().int().min(0).max(10).optional(),
  difficultyLevel: z.number().int().min(0).max(10).optional(),
  notes: z.string().optional()
});

logsRouter.get(
  "/me/prescriptions",
  requireAuth,
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const query = z.object({ from: z.string().date().optional(), to: z.string().date().optional() }).parse(req.query);
    const prescriptions = await prisma.prescription.findMany({
      where: {
        studentId: req.user!.id,
        scheduledDate: { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined }
      },
      include: { items: { include: { workoutType: { include: { group: true } }, log: true } }, warnings: true },
      orderBy: { scheduledDate: "asc" }
    });

    return res.json(prescriptions);
  })
);

logsRouter.post(
  "/workout-logs",
  requireAuth,
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const data = logSchema.parse(req.body);
    const item = await prisma.prescriptionItem.findUnique({
      where: { id: data.prescriptionItemId },
      include: { prescription: true, log: true }
    });

    if (!item || item.prescription.studentId !== req.user!.id) throw new HttpError(404, "Prescription item not found");
    if (item.log) throw new HttpError(409, "Workout already logged");

    const log = await prisma.workoutLog.create({
      data: { ...data, studentId: req.user!.id, completedAt: data.completedAt ? new Date(data.completedAt) : undefined },
      include: { prescriptionItem: { include: { workoutType: { include: { group: true } } } } }
    });

    return res.status(201).json(log);
  })
);

logsRouter.patch(
  "/workout-logs/:workoutLogId",
  requireAuth,
  requireRole("student"),
  asyncHandler(async (req, res) => {
    const data = logSchema.omit({ prescriptionItemId: true }).partial().parse(req.body);
    const current = await prisma.workoutLog.findFirst({ where: { id: req.params.workoutLogId, studentId: req.user!.id } });
    if (!current) throw new HttpError(404, "Workout log not found");

    const log = await prisma.workoutLog.update({
      where: { id: req.params.workoutLogId },
      data: { ...data, completedAt: data.completedAt ? new Date(data.completedAt) : undefined },
      include: { prescriptionItem: { include: { workoutType: { include: { group: true } } } } }
    });

    return res.json(log);
  })
);
