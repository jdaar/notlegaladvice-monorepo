import { Context, Effect, Layer } from "effect";
import { DomainEntities, Services } from "@notlegaladvice/domain";
import { Prompts } from "@notlegaladvice/llm-integration";
import { Errors } from "@notlegaladvice/data";
import { Streaming } from "@notlegaladvice/streaming";
import { Stream } from "effect";

export class ExtractTextFromFileViaOCR extends Context.Tag("ExtractTextFromFileViaOCR")<
  ExtractTextFromFileViaOCR,
	(
    userRequest: string,
    file: {
      fileMimeType: string,
      fileBase64: string
    }
	) => Effect.Effect<
		string,
		Errors.UnableToConsumeStream |
		Errors.UnableToCreateStream |
		Errors.UnableToCreateSink |
    Errors.UnableToInvokeTemplate |
    Errors.UnableToParseLLMOutput,
		Services.OCRAgentInstance
	>
>() {}

function extractTextFromFileViaOCR(
  userRequest: string,
  file: {
    fileMimeType: string,
    fileBase64: string
  }
) {
	return Effect.gen(function* () {
		const prompt = yield* Effect.tryPromise({
			try: async () => await Prompts.Templates.extractTextFromFileViaOCR.invoke({
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

		const llm = yield* Services.OCRAgentInstance

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

    try {
      // Parse the result to get structured output
      const parsedResult = JSON.parse(result.content as string);
      if (!parsedResult.fileContent || typeof parsedResult.fileContent !== 'string') {
        return yield* Effect.fail(new Errors.UnableToParseLLMOutput({
          cause: new Error('LLM response does not contain valid fileContent field')
        }));
      }
      
      return parsedResult.fileContent;
    } catch (error) {
      return yield* Effect.fail(new Errors.UnableToParseLLMOutput({
        cause: error instanceof Error ? error : new Error('Failed to parse LLM output as JSON')
      }));
    }
  });
}

export const extractTextFromFileViaOCRLive = Layer.succeed(
  ExtractTextFromFileViaOCR,
  ExtractTextFromFileViaOCR.of(extractTextFromFileViaOCR)
);

