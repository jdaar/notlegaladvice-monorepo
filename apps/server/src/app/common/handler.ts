import { Effect } from 'effect';
import { Contexts, execute } from '@notlegaladvice/application'
import { FastifyRequest, FastifyInstance } from 'fastify';

/*
function convertSchemaToJsonSchema<E, D, R>(
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
*/

export function createUnboundSchemaHttpHandlerSuscriptor<I, E, R>(handler: (request: FastifyRequest<{Body: R}>) => Effect.Effect<I, E, Contexts.ApplicationContext>, handlerConfig: {
  name: string,
  method: string,
  url: string
}) {
  return (instance: FastifyInstance) => {
    instance.route({
      url: handlerConfig.url,
      method: handlerConfig.method,
      handler: (request: FastifyRequest<{Body: R}>) => {
        const effectWithSpan = handler(request).pipe(
          Effect.tap((result) => Effect.log(result)),
          Effect.withSpan(`${handlerConfig.name}.HTTP`, {
            attributes: {
              [`http.method`]: handlerConfig.method,
              [`http.target`]: handlerConfig.url,
            },
          })
        );
        return execute(effectWithSpan);
      }
    });
  }
}

