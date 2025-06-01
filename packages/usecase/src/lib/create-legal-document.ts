import { DomainEntities, Services } from "@notlegaladvice/domain";
import { Context, Effect, Layer } from "effect";
import { Errors } from "@notlegaladvice/data";

type CreateLegalDocumentSignature = (legalDocument: DomainEntities.LegalDocument) => Effect.Effect<
  DomainEntities.LegalDocument,
  Errors.UnableToCreateLegalDocument,
  Services.LegalDocumentRepository
>

export class CreateLegalDocument extends Context.Tag("CreateLegalDocument")<
  CreateLegalDocument,
  CreateLegalDocumentSignature
>() {}

const createLegalDocument: CreateLegalDocumentSignature = (legalDocument) => {
  return Effect.gen(function* () {
    const legalDocumentRepository = yield* Services.LegalDocumentRepository;
    return yield* legalDocumentRepository.createLegalDocument(legalDocument).pipe(
      Effect.tap(v => Effect.log(v)),
      Effect.withSpan("create_legal_document_use_case"),
      Effect.catchAll(error => Effect.fail(new Errors.UnableToCreateLegalDocument({cause: error}))),
      Effect.map(_ => legalDocument)
    );
  })
}

export const createLegalDocumentLive = Layer.succeed(
  CreateLegalDocument,
  CreateLegalDocument.of(createLegalDocument)
);
