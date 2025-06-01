import { Prompts } from "./prompt.js";
import { DomainEntities, Services } from "@notlegaladvice/domain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { LLMResponses } from "./response.js";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers"
import { z } from 'zod'

export namespace LLMChains {
  const ocrChain = (model: ChatGoogleGenerativeAI) => Prompts.Templates.extractOCRTextFromDocument
      .pipe(model)
      .pipe(new StringOutputParser());

  const serializationChain = (model: ChatGoogleGenerativeAI) => Prompts.Templates.serializeLegalDocument
      .pipe(
        model.withStructuredOutput(LLMResponses.legalDocumentSchema)
      )

  export const fullPipeline = (model: ChatGoogleGenerativeAI, callOllamaApi: Services.AgentCompletionFunction) =>
    RunnableSequence.from<Prompts.OCRChainInput, DomainEntities.LegalDocument>([
        ocrChain(model),
        (ocrAnalysisString: string): {ocrAnalysis: string, currentDate: string} => {
            console.log("OCR Analysis String Output:", ocrAnalysisString);
            return {
                ocrAnalysis: ocrAnalysisString,
                currentDate: new Date().toLocaleDateString("en-US", {
                    year: 'numeric', month: 'long', day: 'numeric'
                }),
            };
        },
        callOllamaApi,
        (agentResponse: string): Prompts.SerializationChainInput => {
          console.log("Agent Response String Output: ", agentResponse)
          return {
            documentText: agentResponse
          }
        },
        serializationChain(model),
        (response: z.infer<typeof LLMResponses.legalDocumentSchema>) => {
          return {
            title: response.title,
            terms: response.terms.map(v => ({
              duration: v.duration,
              description: v.description,
              involvedPart: v.involved_part
            })),
            rights: response.rights.map(v => ({
              involvedPart: v.involved_part,
              description: v.description
            })),
            obligations: response.obligations.map(v => ({
              involvedPart: v.involved_part,
              description: v.description
            })),
            objectives: response.objectives,
            involvedLaws: response.involved_laws.map(v => ({
              description: v.description,
              name: v.name
            })),
            involvedParts: response.involved_parts,
            dueDateValidity: response.due_date_validity,
            economicConditions: response.economic_conditions.map(v => ({
              description: v.description,
              involvedPart: v.involved_part,
              amount: v.amount,
              currency: v.currency,
              conditions: v.conditions
            }))
          } satisfies DomainEntities.LegalDocument
        }
    ]);
}
