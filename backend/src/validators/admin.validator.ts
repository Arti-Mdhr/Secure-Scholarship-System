import { z } from "zod";

export const reviewApplicationSchema =
  z.object({
    status: z.enum([
      "under_review",
      "approved",
      "rejected",
    ]),

    reviewerComments:
      z.string().min(5).max(1000),
  });