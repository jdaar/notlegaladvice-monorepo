import type { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import type { Effect } from "effect";
import { Context } from "effect";
import type { MemoryVectorStore } from "langchain/vectorstores/memory";
import type { FastifyInstance } from "fastify";

export namespace Services {
	export class TypistAgentInstance extends Context.Tag("TypistAgentInstance")<
		TypistAgentInstance,
    ChatGoogleGenerativeAI
	>() {}

	export class EmbeddingsInstance extends Context.Tag("EmbeddingsInstance")<
		EmbeddingsInstance,
		GoogleGenerativeAIEmbeddings
	>() {}

	export class VectorStoreInstance extends Context.Tag("VectorStoreInstance")<
		VectorStoreInstance,
		MemoryVectorStore
	>() {}

	interface KeyValueStore {
		readonly has: (key: string) => Effect.Effect<boolean, Error, never>;
		readonly set: (key: string) => Effect.Effect<void, Error, never>;
		readonly delete: (key: string) => Effect.Effect<void, Error, never>;
	}

	export class KeyValueStoreInstance extends Context.Tag("KeyValueStoreInstance")<
		KeyValueStoreInstance,
		KeyValueStore
	>() {}
}

export namespace Entrypoints {
	export class WebServerInstance extends Context.Tag("WebServerInstance")<
		WebServerInstance,
		FastifyInstance
	>() {}
}

