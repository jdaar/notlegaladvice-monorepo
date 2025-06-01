import { Effect } from "effect";
import { SuccessResponse } from "@notlegaladvice/data";
import { FastifyInstance, FastifyRequest } from "fastify";
import { createUnboundSchemaHttpHandlerSuscriptor } from "../common/handler.js";
import { DeleteLegalDocument } from "@notlegaladvice/usecase"

const suscriptor = createUnboundSchemaHttpHandlerSuscriptor(
  (request: FastifyRequest<{ Body: {
    id: string
  }}>) => Effect.gen(function* () {
    const deleteLegalDocument = yield* DeleteLegalDocument;
    const id = request.body.id
    yield* deleteLegalDocument(id);
    return SuccessResponse("Se elimino el documento legal con id: ".concat(id))
  }),
  {
    method: 'DELETE',
    url: '/api/v1/legal-document',
    name: 'disable_legal_document',
  }
)

export default async function (fastify: FastifyInstance) {
  suscriptor(fastify)
}
