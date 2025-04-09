import { Effect, Ref, Option, Schema, JSONSchema } from "effect";
import { WebSocket } from "@fastify/websocket";
import { ErrorResponse, SuccessResponse } from "@notlegaladvice/data";
import { FastifyInstance } from "fastify";
import { IncomingHttpHeaders } from "http";
import { Streaming } from "@notlegaladvice/streaming";
import { AIMessageChunk } from "@langchain/core/messages";
import { Errors } from "@notlegaladvice/data";
import { Contexts, execute, Objects } from "@notlegaladvice/application";

export namespace Controllers {
	const PROTOCOL = [
		'WS' as const,
		'HTTP' as const
	] as const
	export type Protocol = typeof PROTOCOL[number];

	const PROTOCOL_VERB = [
		'GET' as const,
		'POST' as const,
		'DELETE' as const,
		'UPDATE' as const,
		'MESSAGE' as const,
	] as const
	export type ProtocolVerb = typeof PROTOCOL_VERB[number];

	export type Handler<
		S1 extends Schema.Schema<any, any, any>,
		S2 extends Schema.Schema<any, any, any>
	> = {
		type: Protocol,
		function: (payload: Payload<S1['Type']>, sinkCallback: Option.Option<Streaming.SinkCallback>) => Effect.Effect<S2['Type'], Error, Contexts.ApplicationContext>,
		schema: {
			request?: S1
			response?: S2
		}
	}
	type AnyHandler = Handler<any, any>
	type HandlerPool = {
		[verb in ProtocolVerb]?: AnyHandler
	}

	export type Payload<T> = {
		body: T,
		headers?: IncomingHttpHeaders,
		messageQuantity?: number
	}

	export abstract class Controller {
		private readonly protocol: Protocol;
		private readonly url: string;
		private readonly name: string;
		private readonly handlers: HandlerPool;

		constructor(
			protocol: Protocol,
			handlers: HandlerPool,
			name: string,
			url: string
		) {
			this.protocol = protocol;
			this.handlers = handlers;
			this.name = name;
			this.url = url;
		}

		public subscribe(server: FastifyInstance) {
			if (
				!Objects.isNull(this.handlers['MESSAGE']) &&
				!Objects.isNull(this.handlers['GET'])
			) {
				throw Error("colliding http verb, WS and GET not allowed simultaneously");
			}

			if (this.protocol === 'HTTP') {
				let verbs = Object.keys(this.handlers) as Array<ProtocolVerb>;
				for (let i = 0; i < verbs.length; i += 1) {
					if (Objects.requireNonNull(this.handlers[verbs[i]]).type === 'HTTP') {
						this.subscribeHTTPHandler(server, verbs[i])
					}
				}
			} else if (this.protocol === 'WS') {
				if (Objects.requireNonNull(this.handlers['MESSAGE']).type === 'WS') {
					this.subscribeWSHandler(server)
				}
			}
		}

		private convertSchemaToJsonSchema<E, D, R>(
			schema: Schema.Schema<E, D, R>,
			id: string
		) {
			Objects.requireNonNull(schema);

			const jsonSchema = Objects.requireNonNull(JSONSchema.make(
				schema.annotations({ identifier: id })
			));

			const modifiedSchema = Object.entries(Objects.requireNonNull(jsonSchema.$defs))
					.map(([key, value]) => ({$schema: jsonSchema.$schema, ...value, $id: key}))
					.filter(v => v.$id === id)
					[0];

			return modifiedSchema;
		}

		private subscribeJSONSchemas(
			server: FastifyInstance,
			verb: ProtocolVerb,
			requestJsonSchemaId: string,
			responseJsonSchemaId: string,
		) {
			if (!Objects.isNull(Objects.requireNonNull(this.handlers[verb]).schema.request)) {
				server.addSchema(
					this.convertSchemaToJsonSchema(
						this.handlers[verb]!.schema.request!,
						requestJsonSchemaId
					)
				);
			}
			if (!Objects.isNull(Objects.requireNonNull(this.handlers[verb]).schema.response)) {
				server.addSchema(
					this.convertSchemaToJsonSchema(
						this.handlers[verb]!.schema.response!,
						responseJsonSchemaId
					)
				);
			}
		}

		private subscribeHTTPHandler(
			server: FastifyInstance,
			verb: ProtocolVerb
		) {
			const id = this.name
				.concat('_')
				.concat(verb);
			const requestJsonSchemaId = id.concat('_request');
			const responseJsonSchemaId = id.concat('_response');

			this.subscribeJSONSchemas(server, verb, requestJsonSchemaId, responseJsonSchemaId);

			server.route({
				url: this.url,
				method: verb,
				handler: async (request) => {
					return await execute(Objects.requireNonNull(this.handlers[verb]).function(
						request,
						Option.none()
					)
						.pipe(
							Effect.tap((result) => Effect.log(result)),
							Effect.withSpan(`${this.name}.${this.protocol}`, {
								attributes: {
									[`${this.protocol}.body`]: request.body,
									[`${this.protocol}.method`]: verb,
									[`${this.protocol}.target`]: this.url,
								},
							})
						)
					);
				},
				schema: {
					body: {
						$ref: requestJsonSchemaId
					}
				}
			});
		}

		private subscribeWSHandler(
			server: FastifyInstance
		) {
			server.register((_) => server.get(this.url, { websocket: true },
				(socket, _) => {
					const messageQuantity = Ref.make<number>(0).pipe(Effect.runSync);
					socket.on("message", (message: unknown & { toString: () => string }) =>
						this.createWSMessageHandler(
							message,
							socket,
							messageQuantity,
							this.createSinkCallback(socket)
						)
					);
				})
			)
		}

		private async createWSMessageHandler(
			message: object & { toString: () => string },
			socket: WebSocket,
			messageQuantity: Ref.Ref<number>,
			sinkCallback: Streaming.SinkCallback
		) {
			return await execute(
				Ref.get(messageQuantity)
					.pipe(
						Effect.flatMap(quantity =>
							Objects.requireNonNull(this.handlers["MESSAGE"]).function(
								{
									body: message,
									messageQuantity: quantity
								},
								Option.some(sinkCallback)
							)
								.pipe(
									Effect.tap(() => Ref.update(messageQuantity, v => v + 1)),
									Effect.tap((_) =>
										Effect.try({
											try: () => {
												socket.close(1000, "request served");
												return Effect.void;
											},
											catch: (error) => new Error(`Failed to send message: ${(error as Error).message}`)
										}),
									),
									Effect.tap((result) => Effect.log(result)),
									Effect.withSpan(`${this.name}.${this.protocol}`, {
										attributes: {
											[`${this.protocol}.body`]: message.toString(),
											[`${this.protocol}.method`]: 'MESSAGE',
											[`${this.protocol}.quantity`]: messageQuantity,
											[`${this.protocol}.target`]: this.url,
										},
									})
								)
						)
					)
			);
		}

		private createSinkCallback(socket: WebSocket) {
			return (chunk: AIMessageChunk) => Effect.try({
				try: () => {
					socket.send(
						JSON.stringify(SuccessResponse(chunk.content))
					);
					return null;
				},
				catch: (error) =>
					new Error(
						`failed to send message: ${(error as Error).message}`,
					),
			}).pipe(
				Effect.onError((error: unknown & { toString: () => string }) =>
					Effect.try({
						try: () => {
							socket.send(ErrorResponse(
								error.toString(),
								Errors.Code.Unidentified)
							.toString());
							socket.close(1000, "request served");
						},
						catch: (error) => new Error(`failed to send message: ${(error as Error).message}`)
					})
						.pipe(
							Effect.tap((result) => Effect.log(result)),
							Effect.catchAll(_ => Effect.log("unable to send error message to client")),
							Effect.andThen(Effect.void)
						)
				)
			);
		}
	}
}

