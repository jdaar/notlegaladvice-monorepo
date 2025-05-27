/* eslint-disable @typescript-eslint/no-namespace */
import { Context } from "effect";
import type { FastifyInstance } from "fastify";
import { Ollama } from "@langchain/ollama";

export namespace Services {
	export class OCRAgentInstance extends Context.Tag("OCRAgentInstance")<
		OCRAgentInstance,
    Ollama
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

