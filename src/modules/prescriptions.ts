import { Router } from "express";
import { z } from "zod";
import { LoadLevel, PrescriptionStatus } from "@prisma/client";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, HttpError } from "../middleware/error";
import { prisma } from "../db/prisma";
import { validateWorkoutCombination } from "../services/combinationRules";

export const prescriptionsRouter = Router();

const prescriptionItemInput = z.object({
  workoutTypeId: z.string().min(1),
  loadLevel: z.nativeEnum(LoadLevel),
  durationMinutes: z.number().int().positive().optional(),
  distanceKm: z.number().positive().optional(),
  intensityNotes: z.string().optional(),
  objective: z.string().optional(),
  notes: z.string().optional()
});

const createPrescriptionSchema = z.object({
  studentId: z.string().min(1),
  scheduledDate: z.string().date(),
  overrideReason: z.string().min(10).optional(),
  items: z.array(prescriptionItemInput).min(1)
});

async function ensureTeacherOwnsStudent(teacherId: string, studentId: string) {
  const profile = await prisma.studentProfile.findFirst({ where: { teacherId, userId: studentId, active: true } });
  if (!profile) throw new HttpError(404, "Active student not found for this teacher");
}

async function loadWorkoutsForValidation(items: Array<{ workoutTypeId: string; loadLevel: LoadLevel }>) {
  const types = await prisma.workoutType.findMany({
    where: { id: { in: items.map((item) => item.workoutTypeId) } },
    include: { group: true }
  });

  if (types.length !== items.length) throw new HttpError(400, "One or more workout types were not found");

  return items.map((item) => ({
    workoutType: types.find((type) => type.id === item.workoutTypeId)!,
    loadLevel: item.loadLevel
  }));
}

prescriptionsRouter.post(
  "/validate-combination",
  requireAuth,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const data = z.object({ items: z.array(prescriptionItemInput.pick({ workoutTypeId: true, loadLevel: true })).min(1) }).parse(req.body);
    const workouts = await loadWorkoutsForValidation(data.items);
    return res.json({ warnings: validateWorkoutCombination(workouts) });
  })
);

prescriptionsRouter.post(
  "/",
  requireAuth,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const data = createPrescriptionSchema.parse(req.body);
    await ensureTeacherOwnsStudent(req.user!.id, data.studentId);

    const workouts = await loadWorkoutsForValidation(data.items);
    const warnings = validateWorkoutCombination(workouts);
    const hasRestriction = warnings.some((warning) => warning.severity === "restriction");

    if (hasRestriction && !data.overrideReason) {
      throw new HttpError(409, "This combination has a restriction and requires overrideReason");
    }

    const prescription = await prisma.prescription.create({
      data: {
        teacherId: req.user!.id,
        studentId: data.studentId,
        scheduledDate: new Date(data.scheduledDate),
        items: { create: data.items },
        warnings: {
          create: warnings.map((warning) => ({
            ...warning,
            overridden: warning.severity === "restriction" && Boolean(data.overrideReason),
            overrideReason: warning.severity === "restriction" ? data.overrideReason : undefined
          }))
        }
      },
      include: { items: { include: { workoutType: { include: { group: true } } } }, warnings: true }
    });

    return res.status(201).json(prescription);
  })
);

prescriptionsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = z
      .object({ studentId: z.string().optional(), from: z.string().date().optional(), to: z.string().date().optional(), status: z.nativeEnum(PrescriptionStatus).optional() })
      .parse(req.query);

    const prescriptions = await prisma.prescription.findMany({
      where: {
        teacherId: req.user!.role === "teacher" ? req.user!.id : undefined,
        studentId: req.user!.role === "student" ? req.user!.id : query.studentId,
        status: query.status,
        scheduledDate: { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined }
      },
      include: { items: { include: { workoutType: { include: { group: true } }, log: true } }, warnings: true },
      orderBy: { scheduledDate: "desc" }
    });

    return res.json(prescriptions);
  })
);

prescriptionsRouter.get(
  "/:prescriptionId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const prescription = await prisma.prescription.findUnique({
      where: { id: req.params.prescriptionId },
      include: { items: { include: { workoutType: { include: { group: true } }, log: true } }, warnings: true }
    });

    if (!prescription) throw new HttpError(404, "Prescription not found");
    if (req.user!.role === "teacher" && prescription.teacherId !== req.user!.id) throw new HttpError(403, "Forbidden");
    if (req.user!.role === "student" && prescription.studentId !== req.user!.id) throw new HttpError(403, "Forbidden");

    return res.json(prescription);
  })
);

prescriptionsRouter.patch(
  "/:prescriptionId",
  requireAuth,
  requireRole("teacher"),
  asyncHandler(async (req, res) => {
    const data = z.object({ status: z.nativeEnum(PrescriptionStatus).optional(), scheduledDate: z.string().date().optional() }).parse(req.body);
    const current = await prisma.prescription.findFirst({ where: { id: req.params.prescriptionId, teacherId: req.user!.id } });
    if (!current) throw new HttpError(404, "Prescription not found");

    const updated = await prisma.prescription.update({
      where: { id: req.params.prescriptionId },
      data: { status: data.status, scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined },
      include: { items: { include: { workoutType: { include: { group: true } }, log: true } }, warnings: true }
    });

    return res.json(updated);
  })
);
