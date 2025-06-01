import { Effect } from "effect";
import { ErrorResponse, Errors, SuccessResponse } from "@notlegaladvice/data";
import { FastifyInstance, FastifyRequest } from "fastify";
import { createUnboundSchemaHttpHandlerSuscriptor } from "../common/handler.js";
import { Objects } from "@notlegaladvice/application";
import { CreateLegalDocumentFromDocument } from "@notlegaladvice/usecase"
import { Prompts } from "@notlegaladvice/llm-integration";

const suscriptor = createUnboundSchemaHttpHandlerSuscriptor(
  (request: FastifyRequest<{ Body: {
    file: string
  }}>) => Effect.gen(function* () {
    const createLegalDocumentFromDocument = yield* CreateLegalDocumentFromDocument;
    const file = request.body.file
    if (Objects.isNull(file))
      return ErrorResponse("a file is required", Errors.Code.Unidentified);

    const fileInput: Prompts.OCRChainInput = {
      base64Image: file,
    }

    yield* Effect.log("INPUT", fileInput);
    const result = yield* createLegalDocumentFromDocument(fileInput);

    return SuccessResponse(result)
  }),
  {
    method: 'POST',
    url: '/api/v1/legal-document',
    name: 'execute_llm_extraction_from_document',
  }
)

export default async function (fastify: FastifyInstance) {
  suscriptor(fastify)
}
