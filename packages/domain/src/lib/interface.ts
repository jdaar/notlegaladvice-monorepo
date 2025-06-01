/* eslint-disable @typescript-eslint/no-namespace */
import { Context, Effect } from "effect";
import type { FastifyInstance } from "fastify";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MongoClient } from 'mongodb';
import { DomainEntities } from "./entity.js";

export namespace Services {
  export type AgentCompletionFunction = (input: {
    ocrAnalysis: string,
    currentDate: string
  }) => Promise<string>

	export class OCRAgentInstance extends Context.Tag("OCRAgentInstance")<
		OCRAgentInstance,
    ChatGoogleGenerativeAI
	>() {}

	export class AgentCompletionInstance extends Context.Tag("AgentCompletionInstance")<
		AgentCompletionInstance,
    AgentCompletionFunction
	>() {}

  export class DatabaseClientInstance extends Context.Tag("DatabaseClientInstance")<
    DatabaseClientInstance,
    MongoClient
  >() {}

  export class LegalDocumentRepository extends Context.Tag("LegalDocumentRepository")<
    LegalDocumentRepository,
    {
      readonly createLegalDocument: (document: DomainEntities.LegalDocument) => Effect.Effect<void, Error, never>
      readonly getLegalDocuments: () => Effect.Effect<Array<DomainEntities.LegalDocument>, Error, never>
      readonly deleteLegalDocument: (id: string) => Effect.Effect<void, Error, never>
      readonly markLegalDocumentAsDisabled: (id: string, isDisabled: boolean) => Effect.Effect<void, Error, never>
    }
  >() {}

	export class PDFRenderer extends Context.Tag("PDFRenderer")<
		PDFRenderer,
		{
			readonly renderPDFToImages: (pdfBytes: Uint8Array) => Promise<Array<Uint8Array>>
		}
	>() {}
}

export namespace Entrypoints {
	export class WebServerInstance extends Context.Tag("WebServerInstance")<
		WebServerInstance,
		FastifyInstance
	>() {}
}

