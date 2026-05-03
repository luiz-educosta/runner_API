import type { LoadLevel, WorkoutType } from "@prisma/client";

export type WorkoutForValidation = {
  workoutType: Pick<WorkoutType, "name" | "isAssessment"> & { group: { name: string } };
  loadLevel: LoadLevel;
};

export type CombinationWarningResult = {
  type: string;
  message: string;
  severity: "info" | "alert" | "restriction";
};

function isGroup(workout: WorkoutForValidation, groupName: string) {
  return workout.workoutType.group.name.toLowerCase() === groupName.toLowerCase();
}

function hasGroup(workouts: WorkoutForValidation[], groupName: string) {
  return workouts.some((workout) => isGroup(workout, groupName));
}

function hasIntenseGroup(workouts: WorkoutForValidation[], groupName: string) {
  return workouts.some((workout) => isGroup(workout, groupName) && workout.loadLevel === "intensa");
}

function isLowerStrength(workout: WorkoutForValidation) {
  const name = workout.workoutType.name.toLowerCase();
  return isGroup(workout, "Fortalecimento") && (name.includes("inferiores") || name.includes("perna"));
}

export function validateWorkoutCombination(workouts: WorkoutForValidation[]): CombinationWarningResult[] {
  const warnings: CombinationWarningResult[] = [];
  const hasRunning = hasGroup(workouts, "Corrida");
  const hasEducation = hasGroup(workouts, "Educativos de corrida");
  const hasActivation = hasGroup(workouts, "Ativacao muscular");
  const hasMobility = hasGroup(workouts, "Mobilidade");
  const hasStrength = hasGroup(workouts, "Fortalecimento");
  const hasIntenseRunning = hasIntenseGroup(workouts, "Corrida");
  const hasHeavyStrength = hasIntenseGroup(workouts, "Fortalecimento");
  const hasHeavyLowerStrength = workouts.some((workout) => isLowerStrength(workout) && workout.loadLevel === "intensa");
  const hasAssessment = workouts.some((workout) => workout.workoutType.isAssessment);

  if (hasRunning && hasEducation && hasActivation) {
    warnings.push({
      type: "allowed_running_session",
      message: "Combinacao adequada para sessao de corrida: educativo + ativacao + corrida.",
      severity: "info"
    });
  }

  if (hasMobility && hasStrength && !hasRunning) {
    warnings.push({
      type: "allowed_strength_mobility",
      message: "Mobilidade + fortalecimento e permitido quando a carga total estiver adequada.",
      severity: hasHeavyStrength ? "alert" : "info"
    });
  }

  if (hasIntenseRunning && hasHeavyStrength) {
    warnings.push({
      type: "intense_running_with_heavy_strength",
      message: "Evite corrida intensa e fortalecimento pesado no mesmo dia para reduzir sobrecarga.",
      severity: "alert"
    });
  }

  if (hasIntenseRunning && hasHeavyLowerStrength) {
    warnings.push({
      type: "intense_running_with_heavy_lower_strength",
      message: "Corrida intensa com fortalecimento pesado de membros inferiores exige justificativa do professor.",
      severity: "restriction"
    });
  }

  if (hasAssessment && workouts.length > 1) {
    warnings.push({
      type: "assessment_with_extra_load",
      message: "Testes como VO2Max ou pace devem evitar cargas adicionais intensas no mesmo dia.",
      severity: "alert"
    });
  }

  return warnings;
}
