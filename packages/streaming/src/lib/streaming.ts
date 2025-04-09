import { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import { Effect, Schedule, Sink, Stream } from "effect";
import { Services } from "@notlegaladvice/domain";

export namespace Streaming {
	export type SinkCallback = (chunk: AIMessageChunk) => Effect.Effect<void, Error, never>;

	export function makeCompletionStream(
		input: Array<BaseMessage>,
	): Effect.Effect<
		Stream.Stream<AIMessageChunk, void, never>,
		never,
		Services.TypistAgentInstance
	> {
		return Effect.gen(function* () {
			const llm = yield* Services.TypistAgentInstance;
			const stream = yield* Effect.promise(() => llm.stream(input));
			const reader = stream.getReader();
			const readStreamChunk = async function* () {
				let done = false;
				while (!done) {
					const chunk = await reader.read();
					done = chunk.done;
					if (!done) {
						yield chunk.value!;
					}
				}
			};
			return Stream.fromAsyncIterable(
				readStreamChunk(),
				(error) => error as Error,
			).pipe(Stream.retry(Schedule.exponential(2)));
		});
	}

	export function makeBufferedReducerSink(
		reducer: (
			accumulated: AIMessageChunk,
			chunk: AIMessageChunk,
		) => Effect.Effect<AIMessageChunk, Error, never>,
	) {
		return Effect.gen(function* () {
			return Sink.foldLeftEffect(
				{concat: (chunk: AIMessageChunk) => chunk} as AIMessageChunk,
				(accumulated: AIMessageChunk, chunk: AIMessageChunk) =>
					Effect.gen(function* () {
            if (typeof accumulated.concat === 'function') yield* Effect.log(accumulated.concat(chunk));
						return yield* reducer(accumulated, chunk);
					}),
			);
		});
	}
}

