import { Effect, Layer, Stream, Chunk } from "effect";
import { Streaming } from "./streaming.js";
import { IterableReadableStream } from "@langchain/core/dist/utils/stream";
import { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Services } from "@notlegaladvice/domain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

async function getStreamEffect() {
	let prompt = Effect.tryPromise({
		try: async () => ChatPromptTemplate.fromMessages([
			["system" as const, "Test"]
		]).invoke({}),
		catch: (error) => console.error(error)
	})
		.pipe(
			Effect.map(v => v.messages),
			Effect.runPromise
		);

	let counter = 0;
	let streamEffect = Streaming.makeCompletionStream(await prompt)
		.pipe(
			Effect.provide(
				Layer.succeed(
					Services.OCRAgentInstance,
					Services.OCRAgentInstance.of({
						stream: async (_: Array<BaseMessage>) => ({
							getReader: () => ({
								read: async () => {
									if (counter <= 100) {
										counter += 1;
										return {done: false, value: {content: 'chunk'} as AIMessageChunk}
									}
									return {done: true, value: {content: ''} as AIMessageChunk}
								},
								releaseLock: () => {},
								closed: Promise.resolve(),
								cancel: () => {}
							} as ReadableStreamDefaultReader<AIMessageChunk>)
						} as IterableReadableStream<AIMessageChunk>)
					} as ChatGoogleGenerativeAI)
				)
			)
		);

		return streamEffect;
}

describe("make completion stream", () => {
	it("given correct connection with llm when request completion then stream response", async () => {
		let _result = await (await getStreamEffect())
			.pipe(Effect.runPromise);
		let result = await Stream.runCollect(_result).pipe(Effect.runPromise);

		expect(result.length).toEqual(101);
		expect(Chunk.toArray(result).every(v => v.content === "chunk")).toBeTruthy();
	})
})

describe("make buffered reducer sink", () => {
	it("given reducer when function call then buffer", async () => {
		let stream = await (await getStreamEffect())
			.pipe(Effect.runPromise);
		let sink = await Streaming.makeBufferedReducerSink((_, chunk) => Effect.sync(() => chunk))
			.pipe(Effect.runPromise);

		let result = await Stream.run(
			stream,
			sink
		).pipe(
			Effect.runPromise
		);

		expect(result).toEqual({content: "chunk"});
	})
})

