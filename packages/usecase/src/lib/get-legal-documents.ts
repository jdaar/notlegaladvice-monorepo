import { DomainEntities, Services } from "@notlegaladvice/domain";
import { Context, Effect, Layer } from "effect";
import { Errors } from "@notlegaladvice/data";

type GetLegalDocumentsSignature = () => Effect.Effect<
  Array<DomainEntities.LegalDocument>,
  Errors.UnableToCreateLegalDocument,
  Services.LegalDocumentRepository
>

export class GetLegalDocuments extends Context.Tag("GetLegalDocuments")<
  GetLegalDocuments,
  GetLegalDocumentsSignature
>() {}

const getLegalDocuments: GetLegalDocumentsSignature = () => {
  return Effect.gen(function* () {
    const legalDocumentRepository = yield* Services.LegalDocumentRepository;
    return yield* legalDocumentRepository.getLegalDocuments().pipe(
      Effect.tap(v => Effect.log(v)),
      Effect.withSpan("get_legal_documents_use_case"),
      Effect.catchAll(error => Effect.fail(new Errors.UnableToCreateLegalDocument({cause: error})))
    );
  })
}

export const getLegalDocumentsLive = Layer.succeed(
  GetLegalDocuments,
  GetLegalDocuments.of(getLegalDocuments)
);
