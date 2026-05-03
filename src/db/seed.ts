import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const groups = [
  {
    name: "Corrida",
    description: "Treinos especificos de corrida e avaliacoes de desempenho.",
    types: [
      ["Rodagem leve", "leve", false],
      ["Rodagem normal", "moderada", false],
      ["Treino longo", "intensa", false],
      ["Fartlek", "moderada", false],
      ["Treino intervalado/tiro", "intensa", false],
      ["Treino de ritmo/tempo run", "intensa", false],
      ["Regenerativo", "leve", false],
      ["Teste de VO2Max", "intensa", true],
      ["Teste de pace/distancia", "intensa", true]
    ]
  },
  {
    name: "Fortalecimento",
    description: "Treinos de forca geral e especifica para corredores.",
    types: [
      ["Inferiores", "moderada", false],
      ["Superiores", "leve", false],
      ["Core", "leve", false],
      ["Full body", "moderada", false],
      ["Forca especifica para corrida", "moderada", false]
    ]
  },
  {
    name: "Mobilidade",
    description: "Treinos para amplitude, controle e qualidade de movimento.",
    types: [
      ["Mobilidade geral", "leve", false],
      ["Mobilidade focada para corrida", "leve", false],
      ["Quadril, tornozelo e cadeia posterior", "leve", false]
    ]
  },
  {
    name: "Ativacao muscular",
    description: "Ativacoes pre-treino ou complementares para corrida.",
    types: [
      ["Ativacao de membros inferiores", "leve", false],
      ["Ativacao de core", "leve", false],
      ["Ativacao de gluteos", "leve", false],
      ["Ativacao de musculos importantes para corrida", "leve", false],
      ["Ativacao de membros superiores", "leve", false]
    ]
  },
  {
    name: "Educativos de corrida",
    description: "Drills e treinos tecnicos para melhorar eficiencia de corrida.",
    types: [
      ["Drills de tecnica", "leve", false],
      ["Coordenacao motora", "leve", false],
      ["Cadencia", "leve", false],
      ["Postura", "leve", false],
      ["Eficiencia de passada", "leve", false]
    ]
  }
] as const;

async function main() {
  const teacherPassword = await bcrypt.hash("123456", 10);
  const studentPassword = await bcrypt.hash("123456", 10);

  const teacher = await prisma.user.upsert({
    where: { email: "professor@example.com" },
    update: {},
    create: { name: "Professor Demo", email: "professor@example.com", passwordHash: teacherPassword, role: "teacher" }
  });

  await prisma.user.upsert({
    where: { email: "aluno@example.com" },
    update: {},
    create: {
      name: "Aluno Demo",
      email: "aluno@example.com",
      passwordHash: studentPassword,
      role: "student",
      studentProfile: { create: { teacherId: teacher.id, level: "iniciante", goal: "Correr 5 km" } }
    }
  });

  for (const group of groups) {
    const savedGroup = await prisma.workoutGroup.upsert({
      where: { name: group.name },
      update: { description: group.description },
      create: { name: group.name, description: group.description }
    });

    for (const [name, defaultLoadLevel, isAssessment] of group.types) {
      await prisma.workoutType.upsert({
        where: { groupId_name: { groupId: savedGroup.id, name } },
        update: { defaultLoadLevel, isAssessment, active: true },
        create: { groupId: savedGroup.id, name, defaultLoadLevel, isAssessment }
      });
    }
  }

  console.log("Seed completed");
  console.log("Teacher login: professor@example.com / 123456");
  console.log("Student login: aluno@example.com / 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
