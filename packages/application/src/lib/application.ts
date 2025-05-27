import { Services } from "@notlegaladvice/domain"
import { Effect } from "effect";
import { mainLive } from "./live.js";
import { ExtractLegalAdviceUseCase } from "@notlegaladvice/usecase";

export namespace Contexts {
	export type UseCaseContext =
		Services.OCRAgentInstance;

	export type HandlerContext = ExtractLegalAdviceUseCase;

	export type ApplicationContext = UseCaseContext | HandlerContext;
}

export function execute<D, E>(
  effect: Effect.Effect<
    D,
    E,
		Contexts.ApplicationContext
  >,
) {
  return Effect.runPromise(Effect.provide(effect, mainLive()));
}

