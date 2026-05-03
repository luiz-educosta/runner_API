import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { prisma } from "../db/prisma";

export const teacherRouter = Router();

teacherRouter.use(requireAuth, requireRole("teacher"));

const filtersSchema = z.object({
  studentId: z.string().optional(),
  groupId: z.string().optional(),
  status: z.string().optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional()
});

teacherRouter.get(
  "/workout-logs",
  asyncHandler(async (req, res) => {
    const filters = filtersSchema.parse(req.query);
    const logs = await prisma.workoutLog.findMany({
      where: {
        studentId: filters.studentId,
        student: { studentProfile: { teacherId: req.user!.id } },
        completedAt: { gte: filters.from ? new Date(filters.from) : undefined, lte: filters.to ? new Date(filters.to) : undefined },
        prescriptionItem: { workoutType: { groupId: filters.groupId } }
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        prescriptionItem: { include: { workoutType: { include: { group: true } }, prescription: true } }
      },
      orderBy: { completedAt: "desc" }
    });

    return res.json(logs);
  })
);

teacherRouter.get(
  "/missed-workouts",
  asyncHandler(async (req, res) => {
    const filters = filtersSchema.parse(req.query);
    const now = new Date();
    const prescriptions = await prisma.prescription.findMany({
      where: {
        teacherId: req.user!.id,
        studentId: filters.studentId,
        scheduledDate: { lt: now, gte: filters.from ? new Date(filters.from) : undefined, lte: filters.to ? new Date(filters.to) : undefined },
        items: { some: { log: null, workoutType: { groupId: filters.groupId } } }
      },
      include: { student: { select: { id: true, name: true, email: true } }, items: { include: { workoutType: { include: { group: true } }, log: true } } },
      orderBy: { scheduledDate: "desc" }
    });

    return res.json(prescriptions);
  })
);

teacherRouter.get(
  "/alerts",
  asyncHandler(async (req, res) => {
    const filters = filtersSchema.parse(req.query);
    const [combinationWarnings, effortAlerts] = await Promise.all([
      prisma.combinationWarning.findMany({
        where: {
          prescription: {
            teacherId: req.user!.id,
            studentId: filters.studentId,
            scheduledDate: { gte: filters.from ? new Date(filters.from) : undefined, lte: filters.to ? new Date(filters.to) : undefined }
          }
        },
        include: { prescription: { include: { student: { select: { id: true, name: true, email: true } } } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.workoutLog.findMany({
        where: {
          studentId: filters.studentId,
          student: { studentProfile: { teacherId: req.user!.id } },
          completedAt: { gte: filters.from ? new Date(filters.from) : undefined, lte: filters.to ? new Date(filters.to) : undefined },
          OR: [{ painLevel: { gte: 7 } }, { fatigueLevel: { gte: 7 } }, { difficultyLevel: { gte: 8 } }, { rpe: { gte: 8 } }]
        },
        include: { student: { select: { id: true, name: true, email: true } }, prescriptionItem: { include: { workoutType: { include: { group: true } } } } },
        orderBy: { completedAt: "desc" }
      })
    ]);

    return res.json({ combinationWarnings, effortAlerts });
  })
);
