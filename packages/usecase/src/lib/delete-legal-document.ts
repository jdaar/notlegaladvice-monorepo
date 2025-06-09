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
import { Effect, Layer } from "effect";
import { deleteLegalDocumentLive, DeleteLegalDocument } from "./delete-legal-document";
import { Services } from "@notlegaladvice/domain";
import { Errors } from "@notlegaladvice/data";

describe("Given a valid document id and a repository that successfully deletes the legal document, When deleteLegalDocument is executed, Then it should succeed and call deleteLegalDocument with the correct id", () => {
  it("should delete the legal document and return undefined", async () => {
    // Arrange
    const docId = "doc1";
    const mockRepository: Services.LegalDocumentRepository['Type'] = ({
      deleteLegalDocument: jest.fn(() => Effect.succeed(undefined))
    }) as any;

    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* DeleteLegalDocument;
      return yield* usecase(docId);
    }).pipe(
      Effect.provide(
        Layer.provideMerge(deleteLegalDocumentLive, repositoryLayer)
      )
    );

    const result = await Effect.runPromise(effectUnderTest);

    // Assert
    expect(result).toBeUndefined();
    expect(mockRepository.deleteLegalDocument).toHaveBeenCalledWith(docId);
  });
});

describe("Given a repository that fails when deleting a legal document, When deleteLegalDocument is executed, Then it should fail with UnableToDeleteLegalDocument error", () => {
  it("should fail with an error message containing 'UNABLE_TO_DELETE_LEGAL_DOCUMENT'", async () => {
    // Arrange
    const docId = "doc2";
    const error = new Error("Repository failure");
    const mockRepository: Services.LegalDocumentRepository['Type'] = ({
      deleteLegalDocument: jest.fn(() => Effect.fail(error))
    }) as any;

    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* DeleteLegalDocument;
      return yield* usecase(docId);
    }).pipe(
      Effect.provide(
        Layer.provideMerge(deleteLegalDocumentLive, repositoryLayer)
      )
    );

    // Assert
    await expect(Effect.runPromise(effectUnderTest))
      .rejects
      .toHaveProperty("message", expect.stringContaining("UNABLE_TO_DELETE_LEGAL_DOCUMENT"));
  });
});
