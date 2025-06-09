import { Effect, Layer } from "effect";
import { getLegalDocumentsLive, GetLegalDocuments } from "./get-legal-documents";
import { Services } from "@notlegaladvice/domain";
import { Errors } from "@notlegaladvice/data";

describe("Given a repository that successfully returns legal documents, When getLegalDocuments is executed, Then it should return the array of legal documents", () => {
  it("should succeed and return the legal documents", async () => {
    // Arrange
    const dummyDocs = [{
      id: "doc1",
      isDisabled: false,
      title: "Test Document",
      terms: [],
      involvedParts: [],
      objectives: [],
      obligations: [],
      rights: [],
      dueDateValidity: "2025-01-01",
      economicConditions: [],
      involvedLaws: []
    }];

    const mockRepository: Services.LegalDocumentRepository['Type'] = {
      getLegalDocuments: jest.fn(() => Effect.succeed(dummyDocs))
    };
    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* GetLegalDocuments;
      return yield* usecase();
    }).pipe(
      Effect.provide(
        Layer.provideMerge(getLegalDocumentsLive, repositoryLayer)
      )
    );

    const result = await Effect.runPromise(effectUnderTest);

    // Assert
    expect(result).toEqual(dummyDocs);
    expect(mockRepository.getLegalDocuments).toHaveBeenCalled();
  });
});

describe("Given a repository that fails to return legal documents, When getLegalDocuments is executed, Then it should fail with UnableToCreateLegalDocument error", () => {
  it("should fail with an error message containing 'error'", async () => {
    // Arrange
    const error = new Error("Repository failure");
    const mockRepository: Services.LegalDocumentRepository['Type'] = {
      getLegalDocuments: jest.fn(() => Effect.fail(error))
    };
    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* GetLegalDocuments;
      return yield* usecase();
    }).pipe(
      Effect.provide(
        Layer.provideMerge(getLegalDocumentsLive, repositoryLayer)
      )
    );

    // Assert
    await expect(Effect.runPromise(effectUnderTest))
      .rejects
      .toHaveProperty("message", expect.stringContaining("error"));
  });
});
