import { z } from 'zod';

export namespace LLMResponses {
  const durationSchema = z.object({
    years: z.number().int().describe("years of duration"),
    months: z.number().int().describe("months of duration"),
    days: z.number().int().describe("days of duration"),
  });

  const obligationItemSchema = z.object({
    involved_part: z.string().describe("which of the involved parts inside of the involved_parts has the obligation"),
    description: z.string().describe("description of the obligation"),
  });

  const rightItemSchema = z.object({
    involved_part: z.string().describe("which of the involved parts inside of the involved_parts has the right"),
    description: z.string().describe("description of the right"),
  });

  const termsItemSchema = z.object({
    involved_part: z.string().describe("which of the involved parts inside of the involved_parts is involved in the term"),
    duration: durationSchema.describe("duration of the term"),
    description: z.string().describe("description of the term"),
  });

  const economicConditionItemSchema = z.object({
    involved_part: z.string().describe("which of the involved parts inside of the involved_parts is involved in the economic condition"),
    amount: z.number().describe("amount of money associated to the economic condition"),
    currency: z.string().describe("currency of the amount of money"),
    description: z.string().describe("description of the economic condition"),
    conditions: z.array(z.string().describe("description of the condition")).describe("conditions that apply for the economic condition to be valid"),
  });

  export const legalDocumentSchema = z.object({
    title: z.string().describe("a text with a maximum of 50 characters that explains the main purpose of the document"),
    terms: z.array(termsItemSchema).describe("temporal terms that apply to the legal document"),
    involved_parts: z.array(z.string().describe("involved part inside the legal document")).describe("list of the involved parts listed on the legal document"),
    objectives: z.array(z.string().describe("description of the objective")).describe("objectives of the legal document, what is its purpose"),
    obligations: z.array(obligationItemSchema).describe("obligations listed inside of the legal document"),
    rights: z.array(rightItemSchema).describe("rights listed inside of the legal document"),
    due_date_validity: z.string().describe("maximum date of validity of any term inside of the legal document"),
    economic_conditions: z.array(economicConditionItemSchema).describe("economic conditions listed inside of the legal document"),
    involved_laws: z.array(z.object({
      name: z.string().describe("name of the law that is related to the contents of the legal document"),
      description: z.string().describe("descriptions of the contents of the law that is related to the contents of the legal document")
    })).describe("laws related to the legal document"),
  });
}
