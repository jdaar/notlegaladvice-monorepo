import { MongoClient, ServerApiVersion } from 'mongodb';
import { Services } from "@notlegaladvice/domain";
import { Config, Effect, Layer } from 'effect';
import { Errors } from "@notlegaladvice/data"

export const databaseClientLive = Layer.effect(
  Services.DatabaseClientInstance,
  Effect.gen(function*() {
    const uri = yield* Config.string("MONGODB_CONNECTION_URI");
    console.log('URI', uri)
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    return yield* Effect.tryPromise({
      try: async () => await client.connect(),
      catch: error => new Errors.UnableToConnectToDatabase({cause: error as Error})
    }).pipe(
      Effect.map(_client => Services.DatabaseClientInstance.of(_client))
    );
  })
);

