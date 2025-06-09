import { Effect, Layer } from "effect";
import { disableLegalDocumentLive, DisableLegalDocument } from "./disable-legal-document";
import { Errors } from "@notlegaladvice/data";
import { Services } from "@notlegaladvice/domain";

describe("Given a valid document id and repository that successfully disables the legal document, When disableLegalDocument is executed, Then it should succeed", () => {
  it("should call markLegalDocumentAsDisabled with correct arguments and succeed", async () => {
    // Arrange
    const id = "doc1";
    const isDisabled = true;
    const mockRepository: Services.LegalDocumentRepository['Type'] = {
      markLegalDocumentAsDisabled: jest.fn(() => Effect.succeed(undefined))
    };
    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* DisableLegalDocument;
      return yield* usecase(id, isDisabled);
    }).pipe(
      Effect.provide(
        Layer.provideMerge(disableLegalDocumentLive, repositoryLayer)
      )
    );

    const result = await Effect.runPromise(effectUnderTest);

    // Assert
    expect(result).toBeUndefined();
    expect(mockRepository.markLegalDocumentAsDisabled).toHaveBeenCalledWith(id, isDisabled);
  });
});

describe("Given a repository that fails when disabling a legal document, When disableLegalDocument is executed, Then it should fail with UnableToDisableLegalDocument", () => {
  it("should fail with UnableToDisableLegalDocument error", async () => {
    // Arrange
    const id = "doc2";
    const isDisabled = false;
    const error = new Error("Repository failure");
    const mockRepository: Services.LegalDocumentRepository['Type'] = {
      markLegalDocumentAsDisabled: jest.fn(() => Effect.fail(error))
    };
    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* DisableLegalDocument;
      return yield* usecase(id, isDisabled);
    }).pipe(
      Effect.provide(
        Layer.provideMerge(disableLegalDocumentLive, repositoryLayer)
      )
    );

    // Assert
    await expect(Effect.runPromise(effectUnderTest))
      .rejects
      .toHaveProperty("message", expect.stringContaining("UNABLE_TO_DISABLE_LEGAL_DOCUMENT"));
  });
});
