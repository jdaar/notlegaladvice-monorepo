import { Data } from "effect";

export namespace Errors {
	export enum Code {
		UnableToConsumeStream = "UNABLE_TO_CONSUME_STREAM",
		UnableToInvokeTemplate = "UNABLE_TO_INVOKE_TEMPLATE",
		UnableToCreateSink = "UNABLE_TO_CREATE_SINK",
		UnableToCreateStream = "UNABLE_TO_CREATE_STREAM",
		Unidentified = "UNIDENTIFIED"
	}

	export class UnableToInvokeTemplate extends Data.TaggedError(Code.UnableToInvokeTemplate)<{
		cause: Error
	}>{}
	export class UnableToCreateSink extends Data.TaggedError(Code.UnableToCreateSink)<{
		cause: Error
	}>{}
	export class UnableToCreateStream extends Data.TaggedError(Code.UnableToCreateStream)<{
		cause: Error
	}>{}
	export class UnableToConsumeStream extends Data.TaggedError(Code.UnableToConsumeStream)<{
		cause: Error
	}>{}
}

