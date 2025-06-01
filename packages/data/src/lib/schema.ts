import { z } from 'zod'
import { LLMResponses } from "@notlegaladvice/llm-integration"

export type LegalDocument =  z.infer<typeof LLMResponses.legalDocumentSchema>
