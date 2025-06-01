import { Config, Effect, Layer } from "effect";
import { Services } from "@notlegaladvice/domain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export type LLM = ChatGoogleGenerativeAI

export namespace LLMLives {
	export const agentsLive = () =>
    ocrAgentLive()

	export const ocrAgentLive = () =>
		Layer.effect(
			Services.OCRAgentInstance,
			Effect.gen(function* () {
				const model = yield* Config.string("OCR_MODEL");
				const apiKey = yield* Config.string("GOOGLE_API_KEY");
				const llm = yield* Effect.sync(() => {
					let _llm = new ChatGoogleGenerativeAI({
            apiKey,
						model,
						temperature: 0.7,
					});
					return _llm;
				})
				return Services.OCRAgentInstance.of(llm);
			}),
		);
}

