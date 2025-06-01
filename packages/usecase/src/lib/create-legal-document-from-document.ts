import { DomainEntities, Services } from "@notlegaladvice/domain";
import { Context, Effect, Layer } from "effect";
import { Errors } from "@notlegaladvice/data";
import { Prompts } from "@notlegaladvice/llm-integration";
import { ExecuteLLMExtractionFromDocument } from "./execute-llm-extraction-from-document.js";
import { CreateLegalDocument } from "./create-legal-document.js";

type CreateLegalDocumentFromDocumentSignature = (
  input: Prompts.OCRChainInput
) => Effect.Effect<
  DomainEntities.LegalDocument,
  Errors.UnableToExecuteLLMExtractionPipeline |
  Errors.UnableToCreateLegalDocument,
  ExecuteLLMExtractionFromDocument |
  CreateLegalDocument |
  Services.OCRAgentInstance |
  Services.AgentCompletionInstance |
  Services.LegalDocumentRepository
>

export class CreateLegalDocumentFromDocument extends Context.Tag("CreateLegalDocumentFromDocument")<
  CreateLegalDocumentFromDocument,
  CreateLegalDocumentFromDocumentSignature
>() {}

const createLegalDocumentFromDocument: CreateLegalDocumentFromDocumentSignature = (input) => {
  return Effect.gen(function* () {
    const executeLLMExtractionFromDocument = yield* ExecuteLLMExtractionFromDocument;
    const result = yield* executeLLMExtractionFromDocument(input);

    const createLegalDocument = yield* CreateLegalDocument;
    yield* createLegalDocument(result);

    return result;
  })
}

export const createLegalDocumentFromDocumentLive = Layer.succeed(
  CreateLegalDocumentFromDocument,
  CreateLegalDocumentFromDocument.of(createLegalDocumentFromDocument)
);
