import { deleteLegalDocumentLive, DeleteLegalDocument } from "./delete-legal-document";
import { Effect, Layer } from "effect";
import { Services } from "@notlegaladvice/domain";

describe("Given a valid document id and a repository that successfully deletes the legal document, When deleteLegalDocument is executed, Then it should succeed and call deleteLegalDocument with the correct id", () => {
  it("should delete the legal document and return undefined", async () => {
    // Arrange
    const docId = "doc1";
    const mockRepository: Services.LegalDocumentRepository['Type'] = ({
      deleteLegalDocument: jest.fn(() => Effect.succeed(undefined))
    } satisfies Partial<Services.LegalDocumentRepository['Type']>) as any;
    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );
    // Act
    const effectUnderTest: Effect.Effect<any, unknown, never> = Effect.gen(function* () {
      const usecase = yield* DeleteLegalDocument;
      return yield* usecase(docId);
    }).pipe(
      Effect.provide(
        Layer.provideMerge(deleteLegalDocumentLive, repositoryLayer)
      )
    ) as any;
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
    } satisfies Partial<Services.LegalDocumentRepository['Type']>) as any;
    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );
    // Act
    const effectUnderTest: Effect.Effect<any, unknown, never> = Effect.gen(function* () {
      const usecase = yield* DeleteLegalDocument;
      return yield* usecase(docId);
    }).pipe(
      Effect.provide(
        Layer.provideMerge(deleteLegalDocumentLive, repositoryLayer)
      )
    ) as any;
    // Assert
    await expect(Effect.runPromise(effectUnderTest))
      .rejects
      .toHaveProperty("message", expect.stringContaining("error"));
  });
});
