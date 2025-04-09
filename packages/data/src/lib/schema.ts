import { Schema } from "effect";
import { Response } from "./response.js";
import { Errors } from "./error.js";

export namespace Schemas {
	export class ControllerPayload {
		private static get error(): Schema.Schema<{
			code: Errors.Code,
			message: string
		}, any, never> {
			return Schema.Struct({
				code: Domain.errorCode,
				message: Schema.String
			});
		}

		private static response<T, E>(schema: Schema.Schema<T, E, never>): Schema.Schema<Response<T>, any, never> {
			return Schema.Union(
				Schema.Struct({
					isError: Schema.Literal(true),
					error: ControllerPayload.error,
				}),
				Schema.Struct({
					isError: Schema.Literal(false),
					data: schema
				}),
			)
		}

		public static get extractLegalAdvice() {
			return {
				request: Schema.Struct({
					files: Schema.Record({
						key: Schema.String,
						value: Schema.Struct({
							extractedText: Schema.String,
							reflection: Schema.String
						})
					}),
					context: Schema.String
				}),
				response: ControllerPayload.response(Schema.Struct({
					advice: Domain.legalAdvice
				}))
			}
		}
	}

	export class Domain {
		public static get errorCode() {
			return Schema.Enums(Errors.Code);
		}

		public static get legalAdvice() {
			return Schema.Struct({
				country: Schema.String,
				regulatedByLaw: Schema.String,
				description: Schema.String,
				contextRequirements: Schema.Record({
					key: Schema.String,
					value: Schema.Struct({
						valid: Schema.Boolean,
						description: Schema.String
					})
				})
			})
		}
	}
}

