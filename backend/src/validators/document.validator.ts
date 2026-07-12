import { z } from "zod";

export const uploadDocumentSchema =
  z.object({
    documentType: z.enum([
      "transcript",
      "recommendation_letter",
      "identity_document",
    ]),
  });