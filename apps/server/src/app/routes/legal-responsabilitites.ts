import { Effect } from "effect";
import { Controllers } from "../common/controller.js";
import { SuccessResponse } from "@notlegaladvice/data";
import { Schemas } from "@notlegaladvice/data";
import { ExtractLegalAdviceUseCase } from "@notlegaladvice/usecase";
import { FastifyInstance } from "fastify";

class LegalResponsabilitiesController extends Controllers.Controller {
	constructor() {
		super(
			"HTTP",
			{
				"POST": {
					type: "HTTP",
					function: ((payload, _) => {
						return Effect.gen(function* () {
							const useCase = yield* ExtractLegalAdviceUseCase;
							const result = yield* useCase([], payload.body.context);
							return SuccessResponse({
								advice: result
							})
						});
					}),
					schema: {
						request: Schemas.ControllerPayload.extractLegalAdvice.request,
						response: Schemas.ControllerPayload.extractLegalAdvice.response
					}
				} satisfies Controllers.Handler<
					typeof Schemas.ControllerPayload.extractLegalAdvice.request,
					typeof Schemas.ControllerPayload.extractLegalAdvice.response
				>
			},
			"extract_legal_advice",
			"/api/v1/legal-advice"
		)
	}
}

const controllerInstance = new LegalResponsabilitiesController();

export default async function (fastify: FastifyInstance) {
  controllerInstance.subscribe(fastify);
}
