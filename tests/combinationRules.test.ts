import { describe, expect, it } from "vitest";
import { validateWorkoutCombination, type WorkoutForValidation } from "../src/services/combinationRules";

function workout(groupName: string, name: string, loadLevel: "leve" | "moderada" | "intensa", isAssessment = false): WorkoutForValidation {
  return { workoutType: { group: { name: groupName }, name, isAssessment }, loadLevel };
}

describe("validateWorkoutCombination", () => {
  it("allows activation, education and running together", () => {
    const warnings = validateWorkoutCombination([
      workout("Ativacao muscular", "Ativacao de gluteos", "leve"),
      workout("Educativos de corrida", "Drills de tecnica", "leve"),
      workout("Corrida", "Rodagem leve", "leve")
    ]);

    expect(warnings).toContainEqual(expect.objectContaining({ type: "allowed_running_session", severity: "info" }));
  });

  it("restricts intense running with heavy lower strength", () => {
    const warnings = validateWorkoutCombination([
      workout("Corrida", "Treino intervalado/tiro", "intensa"),
      workout("Fortalecimento", "Inferiores", "intensa")
    ]);

    expect(warnings).toContainEqual(expect.objectContaining({ type: "intense_running_with_heavy_lower_strength", severity: "restriction" }));
  });

  it("alerts when assessment is mixed with extra load", () => {
    const warnings = validateWorkoutCombination([
      workout("Corrida", "Teste de VO2Max", "intensa", true),
      workout("Fortalecimento", "Core", "moderada")
    ]);

    expect(warnings).toContainEqual(expect.objectContaining({ type: "assessment_with_extra_load", severity: "alert" }));
  });
});
