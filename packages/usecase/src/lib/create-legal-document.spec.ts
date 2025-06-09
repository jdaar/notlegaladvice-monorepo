import { Effect, Layer } from "effect";
import { createLegalDocumentLive, CreateLegalDocument } from "./create-legal-document";
import { Errors } from "@notlegaladvice/data";
import { DomainEntities, Services } from "@notlegaladvice/domain";

describe("Given a valid legal document and repository that successfully creates the document, When createLegalDocument is executed, Then it should return the legal document", () => {
  it("should succeed and return the legal document", async () => {
    // Arrange
    const dummyDoc: DomainEntities.LegalDocument = {
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
    };

    const mockRepository = {
      createLegalDocument: jest.fn(() => Effect.succeed(dummyDoc))
    };

    const repositoryLayer = Layer.succeed(Services.LegalDocumentRepository, mockRepository);

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* CreateLegalDocument;
      return yield* usecase(dummyDoc);
    }).pipe(Effect.provide(repositoryLayer));

    const result = await Effect.runPromise(effectUnderTest);

    // Assert
    expect(result).toEqual(dummyDoc);
    expect(mockRepository.createLegalDocument).toHaveBeenCalledWith(dummyDoc);
  });
});

describe("Given a repository that fails to create a legal document, When createLegalDocument is executed, Then it should fail with UnableToCreateLegalDocument", () => {
  it("should fail with UnableToCreateLegalDocument error", async () => {
    // Arrange
    const dummyDoc: DomainEntities.LegalDocument = {
      id: "doc2",
      isDisabled: false,
      title: "Failed Document",
      terms: [],
      involvedParts: [],
      objectives: [],
      obligations: [],
      rights: [],
      dueDateValidity: "2025-02-02",
      economicConditions: [],
      involvedLaws: []
    };

    const error = new Error("Repository failure");

    const mockRepository = {
      createLegalDocument: jest.fn(() => Effect.fail(error))
    };

    const repositoryLayer = Layer.succeed(Services.LegalDocumentRepository, mockRepository);

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* CreateLegalDocument;
      return yield* usecase(dummyDoc);
    }).pipe(Effect.provide(repositoryLayer));

    // Assert
    await expect(Effect.runPromise(effectUnderTest)).rejects.toEqual(
      new Errors.UnableToCreateLegalDocument({ cause: error })
    );
  });
});
