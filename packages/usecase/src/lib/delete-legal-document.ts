import { Services } from "@notlegaladvice/domain";
import { Context, Effect, Layer } from "effect";
import { Errors } from "@notlegaladvice/data";

type DeleteLegalDocumentSignature = (id: string) => Effect.Effect<
  void,
  Errors.UnableToDeleteLegalDocument,
  Services.LegalDocumentRepository
>

export class DeleteLegalDocument extends Context.Tag("DeleteLegalDocument")<
  DeleteLegalDocument,
  DeleteLegalDocumentSignature
>() {}

const deleteLegalDocument: DeleteLegalDocumentSignature = (id: string) => {
  return Effect.gen(function* () {
    const legalDocumentRepository = yield* Services.LegalDocumentRepository;
    return yield* legalDocumentRepository.deleteLegalDocument(id).pipe(
      Effect.tap(v => Effect.log(v)),
      Effect.withSpan("delete_legal_document_use_case"),
      Effect.catchAll(error => Effect.fail(new Errors.UnableToDeleteLegalDocument({cause: error as Error})))
    );
  })
}

export const deleteLegalDocumentLive = Layer.succeed(
  DeleteLegalDocument,
  DeleteLegalDocument.of(deleteLegalDocument)
);
