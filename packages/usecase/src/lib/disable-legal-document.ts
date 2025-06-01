import { Services } from "@notlegaladvice/domain";
import { Context, Effect, Layer } from "effect";
import { Errors } from "@notlegaladvice/data";

type DisableLegalDocumentSignature = (id: string, isDisabled: boolean) => Effect.Effect<
  void,
  Errors.UnableToDisableLegalDocument,
  Services.LegalDocumentRepository
>

export class DisableLegalDocument extends Context.Tag("DisableLegalDocument")<
  DisableLegalDocument,
  DisableLegalDocumentSignature
>() {}

const disableLegalDocument: DisableLegalDocumentSignature = (id: string, isDisabled: boolean) => {
  return Effect.gen(function* () {
    const legalDocumentRepository = yield* Services.LegalDocumentRepository;
    return yield* legalDocumentRepository.markLegalDocumentAsDisabled(id, isDisabled).pipe(
      Effect.tap(v => Effect.log(v)),
      Effect.withSpan("disable_legal_document_use_case"),
      Effect.catchAll(error => Effect.fail(new Errors.UnableToDisableLegalDocument({cause: error as Error})))
    );
  })
}

export const disableLegalDocumentLive = Layer.succeed(
  DisableLegalDocument,
  DisableLegalDocument.of(disableLegalDocument)
);
