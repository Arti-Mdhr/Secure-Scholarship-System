import { z } from "zod";

export const createApplicationSchema = z.object({
  scholarshipTitle: z.string().min(3).max(200),

  personalStatement: z.string().min(50),

  gpa: z.number().min(0).max(4),

  annualFamilyIncome: z.number().min(0),

  university: z.string().min(2),

  program: z.string().min(2),

  expectedGraduationDate: z.string(),

  achievements: z.string().min(5),

  extracurricularActivities: z.string().min(5),
});