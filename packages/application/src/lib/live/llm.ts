import { Config, Effect, Layer } from "effect";
import { Services } from "@notlegaladvice/domain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Ollama } from "@langchain/ollama";

export type LLM = ChatGoogleGenerativeAI

export namespace LLMLives {
	export const agentsLive = () => ocrAgentLive

	export const ocrAgentLive = () =>
		Layer.effect(
			Services.OCRAgentInstance,
			Effect.gen(function* () {
				const model = yield* Config.string("OCR_MODEL");
				const llm = yield* Effect.sync(() => {
					let _llm = new Ollama({
						model,
						temperature: 0.7,
					});
					return _llm;
				})
				return Services.OCRAgentInstance.of(llm);
			}),
		);
}

