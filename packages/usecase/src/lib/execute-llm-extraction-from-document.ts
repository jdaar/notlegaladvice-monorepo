import { DomainEntities, Services } from "@notlegaladvice/domain";
import { Context, Effect, Layer } from "effect";
import { Errors } from "@notlegaladvice/data";
import { LLMChains, Prompts } from "@notlegaladvice/llm-integration";

type ExecuteLLMExtractionFromDocumentSignature = (
  input: Prompts.OCRChainInput
) => Effect.Effect<
  DomainEntities.LegalDocument,
  Errors.UnableToExecuteLLMExtractionPipeline,
  Services.OCRAgentInstance |
  Services.AgentCompletionInstance
>

export class ExecuteLLMExtractionFromDocument extends Context.Tag("ExecuteLLMExtractionFromDocument")<
  ExecuteLLMExtractionFromDocument,
  ExecuteLLMExtractionFromDocumentSignature
>() {}

const executeLLMExtractionFromDocument: ExecuteLLMExtractionFromDocumentSignature = (input) => {
  return Effect.gen(function* () {
    const model = yield* Services.OCRAgentInstance;
    const callOllamaApi = yield* Services.AgentCompletionInstance;

    const sequence = LLMChains.fullPipeline(
      model,
      callOllamaApi
    );

    return yield* Effect.tryPromise({
      try: () => sequence.invoke(input),
      catch: error => new Errors.UnableToExecuteLLMExtractionPipeline({cause: error as Error})
    }).pipe(
      Effect.tap(v => Effect.log(v)),
      Effect.withSpan("execute_llm_extraction_from_document_use_case"),
    );
  })
}

export const executeLLMExtractionFromDocumentLive = Layer.succeed(
  ExecuteLLMExtractionFromDocument,
  ExecuteLLMExtractionFromDocument.of(executeLLMExtractionFromDocument)
);
