import { Services } from "@notlegaladvice/domain"
import { Effect } from "effect";
import { mainLive } from "./live.js";
import { Placeholder, GetLegalDocuments, CreateLegalDocument, ExecuteLLMExtractionFromDocument } from "@notlegaladvice/usecase";


export namespace Contexts {
	export type UseCaseContext =
    Services.DatabaseClientInstance |
    Services.LegalDocumentRepository |
		Services.OCRAgentInstance |
    Services.AgentCompletionInstance;

	export type HandlerContext = Placeholder
  | GetLegalDocuments
  | CreateLegalDocument
  | ExecuteLLMExtractionFromDocument;

	export type ApplicationContext = UseCaseContext | HandlerContext;
}

export function execute<D, E>(
  effect: Effect.Effect<
    D,
    E,
		Contexts.ApplicationContext
  >,
) {
  return Effect.runPromise(
    Effect.provide(effect, mainLive())
  );
}

