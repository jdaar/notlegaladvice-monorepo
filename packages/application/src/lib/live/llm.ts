import { Config, Effect, Layer } from "effect";
import { Services } from "@notlegaladvice/domain";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { LLMTools } from "@notlegaladvice/llm-integration";

export type LLM = ChatGoogleGenerativeAI

export namespace LLMLives {
	export const agentsLive = () => typistAgentLive

	export const typistAgentLive = () =>
		Layer.effect(
			Services.TypistAgentInstance,
			Effect.gen(function* () {
				const apiKey = yield* Config.string("GOOGLE_API_KEY");
				const model = yield* Config.string("GOOGLE_AI_MODEL");
				const llm = yield* Effect.sync(() => {
					let _llm = new ChatGoogleGenerativeAI({
						model,
						apiKey: apiKey,
						temperature: 0.7,
					})
						.bindTools([
							LLMTools.createLegalAdvice
						]) as LLM
					return _llm;
				})
				return Services.TypistAgentInstance.of(llm);
			}),
		);

	export const embeddingsLive = Layer.effect(
		Services.EmbeddingsInstance,
		Effect.gen(function* () {
			const apiKey = yield* Config.string("GOOGLE_API_KEY");
			return Services.EmbeddingsInstance.of(
				new GoogleGenerativeAIEmbeddings({
					model: "text-embedding-004",
					taskType: TaskType.RETRIEVAL_DOCUMENT,
					title: "templates",
					apiKey,
				}),
			);
		}),
	);

	export const vectorStoreLive = Layer.effect(
		Services.VectorStoreInstance,
		Effect.gen(function* () {
			const embeddings = yield* Services.EmbeddingsInstance;
			return Services.VectorStoreInstance.of(new MemoryVectorStore(embeddings));
		}),
	);
}

