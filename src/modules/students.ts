import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, HttpError } from "../middleware/error";
import { prisma } from "../db/prisma";

export const studentsRouter = Router();

studentsRouter.use(requireAuth, requireRole("teacher"));

const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  birthDate: z.string().date().optional(),
  level: z.string().optional(),
  goal: z.string().optional()
});

const updateStudentSchema = z.object({
  name: z.string().min(2).optional(),
  birthDate: z.string().date().nullable().optional(),
  level: z.string().nullable().optional(),
  goal: z.string().nullable().optional(),
  active: z.boolean().optional()
});

studentsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createStudentSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: "student",
        studentProfile: {
          create: {
            teacherId: req.user!.id,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            level: data.level,
            goal: data.goal
          }
        }
      },
      select: { id: true, name: true, email: true, role: true, studentProfile: true }
    });

    return res.status(201).json(user);
  })
);

studentsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const students = await prisma.studentProfile.findMany({
      where: { teacherId: req.user!.id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" }
    });

    return res.json(students);
  })
);

studentsRouter.get(
  "/:studentId",
  asyncHandler(async (req, res) => {
    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.params.studentId, teacherId: req.user!.id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });

    if (!student) throw new HttpError(404, "Student not found");

    return res.json(student);
  })
);

studentsRouter.patch(
  "/:studentId",
  asyncHandler(async (req, res) => {
    const data = updateStudentSchema.parse(req.body);
    const profile = await prisma.studentProfile.findFirst({ where: { userId: req.params.studentId, teacherId: req.user!.id } });

    if (!profile) throw new HttpError(404, "Student not found");

    const [updatedProfile] = await prisma.$transaction([
      prisma.studentProfile.update({
        where: { id: profile.id },
        data: {
          birthDate: data.birthDate ? new Date(data.birthDate) : data.birthDate,
          level: data.level,
          goal: data.goal,
          active: data.active
        },
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
      }),
      ...(data.name ? [prisma.user.update({ where: { id: req.params.studentId }, data: { name: data.name } })] : [])
    ]);

    return res.json(updatedProfile);
  })
);

studentsRouter.get(
  "/:studentId/history",
  asyncHandler(async (req, res) => {
    const { from, to } = z.object({ from: z.string().date().optional(), to: z.string().date().optional() }).parse(req.query);
    const profile = await prisma.studentProfile.findFirst({ where: { userId: req.params.studentId, teacherId: req.user!.id } });

    if (!profile) throw new HttpError(404, "Student not found");

    const history = await prisma.prescription.findMany({
      where: {
        studentId: req.params.studentId,
        teacherId: req.user!.id,
        scheduledDate: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined
        }
      },
      include: {
        items: { include: { workoutType: { include: { group: true } }, log: true } },
        warnings: true
      },
      orderBy: { scheduledDate: "desc" }
    });

    return res.json(history);
  })
);
