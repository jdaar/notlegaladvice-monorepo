import { Effect } from "effect";
import { ErrorResponse, Errors, SuccessResponse } from "@notlegaladvice/data";
import { FastifyInstance, FastifyRequest } from "fastify";
import { createUnboundSchemaHttpHandlerSuscriptor } from "../common/handler.js";
import { Objects } from "@notlegaladvice/application";
import { ExtractLegalAdviceUseCase } from "@notlegaladvice/usecase"

const suscriptor = createUnboundSchemaHttpHandlerSuscriptor(
  (request: FastifyRequest<{ Body: {
    request: string,
    file: string
  }}>) => Effect.gen(function* () {
    const extractLegalAdviceUseCase = yield* ExtractLegalAdviceUseCase;
    const file = request.body.file
    if (Objects.isNull(file))
      return ErrorResponse("a file is required", Errors.Code.Unidentified);

    const userRequest = request.body.request

    const fileInput = {
      fileMimeType: "application/pdf",
      fileBase64: file,
    }

    yield* Effect.log(file);
    const result = yield* extractLegalAdviceUseCase(userRequest, fileInput);

    return SuccessResponse(result)
  }),
  {
    method: 'POST',
    url: '/api/v1/legal-advice',
    name: 'extract_legal_advice',
  }
)

export default async function (fastify: FastifyInstance) {
  suscriptor(fastify)
}
