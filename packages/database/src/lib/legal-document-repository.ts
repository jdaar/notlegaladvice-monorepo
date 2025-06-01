import { DomainEntities, Services } from "@notlegaladvice/domain";
import { Effect, Layer } from 'effect';
import { Errors } from '@notlegaladvice/data';

export const legalDocumentRepositoryLive = Layer.effect(
  Services.LegalDocumentRepository,
  Effect.gen(function*() {
    const client = yield* Services.DatabaseClientInstance;
    const db = yield* Effect.sync(() => client.db("notlegaladvice"));
    const collection = yield* Effect.sync(() => db.collection("document_data"));

    return Services.LegalDocumentRepository.of({
      createLegalDocument: (document) => {
        return Effect.tryPromise({
          try: async () => await collection.insertOne(document),
          catch: error => new Errors.UnableToInsertIntoDatabase({ cause: error as Error })
        })
      },
      getLegalDocuments: () => {
        return Effect.tryPromise({
          try: async () => (await collection.find().toArray()).map(value => value as unknown as DomainEntities.LegalDocument & {id: string}),
          catch: error => new Errors.UnableToRetrieveFromDatabase({ cause: error as Error })
        })
      }
    });
  })
);

