import { Context, Effect, Layer } from "effect";
import { CreateLegalDocument } from "./create-legal-document.js";
import { GetLegalDocuments } from "./get-legal-documents.js";
import { Services } from "../../../domain/dist/lib/interface.js";
import { Errors } from "../../../data/dist/lib/error.js";

export class Placeholder extends Context.Tag("Placeholder")<
  Placeholder,
  () => Effect.Effect<
    void,
    Errors.UnableToCreateLegalDocument |
    Errors.UnableToGetLegalDocuments,
    CreateLegalDocument |
    GetLegalDocuments |
    Services.LegalDocumentRepository
  >
>() {}

function placeholder() {
  return Effect.gen(function* () {
    const createLegalDocument = yield* CreateLegalDocument;
    yield* createLegalDocument({title: 'prueba'})

    const getLegalDocuments = yield* GetLegalDocuments;
    yield* getLegalDocuments().pipe(Effect.tap(Effect.log));
  });
}

export const placeholderLive = Layer.succeed(
  Placeholder,
  Placeholder.of(placeholder)
);
