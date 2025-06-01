import { Effect } from "effect";
import { SuccessResponse } from "@notlegaladvice/data";
import { FastifyInstance, FastifyRequest } from "fastify";
import { createUnboundSchemaHttpHandlerSuscriptor } from "../common/handler.js";
import { GetLegalDocuments } from "@notlegaladvice/usecase"

const suscriptor = createUnboundSchemaHttpHandlerSuscriptor(
  (_: FastifyRequest) => Effect.gen(function* () {
    const getLegalDocuments = yield* GetLegalDocuments;
    const result = yield* getLegalDocuments();
    return SuccessResponse(result)
  }),
  {
    method: 'GET',
    url: '/api/v1/legal-document',
    name: 'get_legal_documents',
  }
)

export default async function (fastify: FastifyInstance) {
  suscriptor(fastify)
}
