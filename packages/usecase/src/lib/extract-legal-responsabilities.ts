import { Context, Effect, Layer, Stream } from "effect";
import { DomainEntities, Services } from "@notlegaladvice/domain";
import { Streaming } from "@notlegaladvice/streaming";
import { Prompts } from "@notlegaladvice/llm-integration";
import { Errors } from "@notlegaladvice/data";

export class ExtractLegalAdviceUseCase extends Context.Tag("ExtractLegalAdviceUseCase")<
  ExtractLegalAdviceUseCase,
	(
    userRequest: string,
    file: {
      fileMimeType: string,
      fileBase64: string
    }
	) => Effect.Effect<
		DomainEntities.LegalAdvice,
		Errors.UnableToInvokeTemplate |
		Errors.UnableToConsumeStream |
		Errors.UnableToCreateStream |
		Errors.UnableToParseFile |
		Errors.UnableToCreateSink,
		Services.TypistAgentInstance
	>
>() {}

function extractLegalAdvice(
  userRequest: string,
  file: {
    fileMimeType: string,
    fileBase64: string
  }
) {
	return Effect.gen(function* () {
		const prompt = yield* Effect.tryPromise({
			try: async () => await Prompts.Templates.extractLegalAdvice.invoke({
        userRequest,
        ...file
      }),
			catch: (error) => new Errors.UnableToInvokeTemplate({
				cause: error as Error
			})
		})
			.pipe(
				Effect.tap(v => Effect.log(v)),
				Effect.withSpan("prompt_invocation"),
				Effect.catchAll(error => Effect.fail(new Errors.UnableToInvokeTemplate({cause: error})))
			);

		const llm = yield* Services.TypistAgentInstance

		yield* Effect.promise(() => llm.invoke(prompt))

		const sink = yield* Streaming.makeBufferedReducerSink((accumulated, chunk) => {
			return Effect.succeed(accumulated.concat(chunk))
		})
			.pipe(
				Effect.tap(v => Effect.log(v)),
				Effect.withSpan("sink_instantiation"),
				Effect.catchAll(error => Effect.fail(new Errors.UnableToCreateSink({cause: error})))
			);
		const stream = yield* Streaming.makeCompletionStream(prompt.messages)
			.pipe(
				Effect.tap(v => Effect.log(v)),
				Effect.withSpan("stream_instantiation"),
				Effect.catchAll(error => Effect.fail(new Errors.UnableToCreateStream({cause: error})))
			);

		const result = yield* Stream.run(
			stream,
			sink
		)
			.pipe(
				Effect.tap(v => Effect.log(v)),
				Effect.withSpan("stream_consumption"),
				Effect.catchAll(error => Effect.fail(new Errors.UnableToConsumeStream({cause: error as Error})))
			);

    if (result.tool_calls === null || result.tool_calls === undefined || result.tool_calls.length === 0)
      return yield* Effect.fail(new Errors.UnableToParseFile({cause: new Error('no tool call retrieved from llm')}))

    if (result.tool_calls[0].name !== 'create_cba_platform_response_format')
      yield* Effect.fail(new Errors.UnableToParseFile({cause: new Error('tool call does not match format')}))

    return result.tool_calls![0].args as DomainEntities.LegalAdvice
	})
}

export const extractLegalAdviceLive = Layer.succeed(
	ExtractLegalAdviceUseCase,
	ExtractLegalAdviceUseCase.of(extractLegalAdvice)
)

