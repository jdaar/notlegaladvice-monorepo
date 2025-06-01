import { Effect } from "effect";
import { SuccessResponse } from "@notlegaladvice/data";
import { FastifyInstance, FastifyRequest } from "fastify";
import { createUnboundSchemaHttpHandlerSuscriptor } from "../common/handler.js";
import { DisableLegalDocument } from "@notlegaladvice/usecase"

const suscriptor = createUnboundSchemaHttpHandlerSuscriptor(
  (request: FastifyRequest<{ Body: {
    id: string,
    isDisabled: boolean
  }}>) => Effect.gen(function* () {
    const disableLegalDocument = yield* DisableLegalDocument;
    const id = request.body.id
    const isDisabled = request.body.isDisabled
    yield* disableLegalDocument(id, isDisabled);
    return SuccessResponse("Se cambio el estado de habilitado para el documento legal con id: ".concat(id))
  }),
  {
    method: 'PATCH',
    url: '/api/v1/legal-document',
    name: 'disable_legal_document',
  }
)

export default async function (fastify: FastifyInstance) {
  suscriptor(fastify)
}
