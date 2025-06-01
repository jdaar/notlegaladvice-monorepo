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
		UnableToConnectToDatabase = "UNABLE_TO_CONNECT_TO_DATABASE",
		UnableToInsertIntoDatabase = "UNABLE_TO_INSERT_INTO_DATABASE",
		UnableToRetrieveFromDatabase = "UNABLE_TO_RETRIEVE_FROM_DATABASE",
		UnableToUpdateDatabase = "UNABLE_TO_UPDATE_DATABASE",
		UnableToDeleteFromDatabase = "UNABLE_TO_DELETE_FROM_DATABASE",
		UnableToCreateLegalDocument = "UNABLE_TO_CREATE_LEGAL_DOCUMENT",
		UnableToDeleteLegalDocument = "UNABLE_TO_DELETE_LEGAL_DOCUMENT",
    UnableToDisableLegalDocument = "UNABLE_TO_DISABLE_LEGAL_DOCUMENT",
		UnableToGetLegalDocuments = "UNABLE_TO_GET_LEGAL_DOCUMENTS",
    UnableToExecuteLLMExtractionPipeline = "UNABLE_TO_EXECUTE_LLM_EXTRACTION_PIPELINE",
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
	export class UnableToConnectToDatabase extends Data.TaggedError(Code.UnableToConnectToDatabase)<{
		cause: Error
	}>{}
	export class UnableToInsertIntoDatabase extends Data.TaggedError(Code.UnableToInsertIntoDatabase)<{
		cause: Error
	}>{}
	export class UnableToRetrieveFromDatabase extends Data.TaggedError(Code.UnableToRetrieveFromDatabase)<{
		cause: Error
	}>{}
	export class UnableToUpdateDatabase extends Data.TaggedError(Code.UnableToUpdateDatabase)<{
		cause: Error
	}>{}
	export class UnableToDeleteFromDatabase extends Data.TaggedError(Code.UnableToDeleteFromDatabase)<{
		cause: Error
	}>{}
	export class UnableToCreateLegalDocument extends Data.TaggedError(Code.UnableToCreateLegalDocument)<{
		cause: Error
	}>{}
	export class UnableToGetLegalDocuments extends Data.TaggedError(Code.UnableToGetLegalDocuments)<{
		cause: Error
	}>{}
	export class UnableToDeleteLegalDocument extends Data.TaggedError(Code.UnableToDeleteLegalDocument)<{
		cause: Error
	}>{}
	export class UnableToDisableLegalDocument extends Data.TaggedError(Code.UnableToDisableLegalDocument)<{
		cause: Error
	}>{}
	export class UnableToExecuteLLMExtractionPipeline extends Data.TaggedError(Code.UnableToExecuteLLMExtractionPipeline)<{
		cause: Error
	}>{}
}

