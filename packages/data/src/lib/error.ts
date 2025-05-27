/* eslint-disable @typescript-eslint/no-namespace */
import { Data } from "effect";

export namespace Errors {
	export enum Code {
		UnableToConsumeStream = "UNABLE_TO_CONSUME_STREAM",
		UnableToInvokeTemplate = "UNABLE_TO_INVOKE_TEMPLATE",
		UnableToCreateSink = "UNABLE_TO_CREATE_SINK",
		UnableToCreateStream = "UNABLE_TO_CREATE_STREAM",
		UnableToParseFile = "UNABLE_TO_PARSE_FILE",
		UnableToParseLLMOutput = "UNABLE_TO_PARSE_LLM_OUTPUT",
		UnableToConvertFileToBase64 = "UNABLE_TO_CONVERT_FILE_TO_BASE64",
		UnableToConvertPDFToImage = "UNABLE_TO_CONVERT_PDF_TO_IMAGE",
		Unidentified = "UNIDENTIFIED"
	}

	export class UnableToConvertFileToBase64 extends Data.TaggedError(Code.UnableToConvertFileToBase64)<{
		cause: Error
	}>{}
	export class UnableToConvertPDFToImage extends Data.TaggedError(Code.UnableToConvertPDFToImage)<{
		cause: Error
	}>{}
	export class UnableToParseFile extends Data.TaggedError(Code.UnableToParseFile)<{
		cause: Error
	}>{}
	export class UnableToParseLLMOutput extends Data.TaggedError(Code.UnableToParseLLMOutput)<{
		cause: Error
	}>{}
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

