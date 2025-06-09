import { Effect, Layer } from "effect";
import { createLegalDocumentLive, CreateLegalDocument } from "./create-legal-document";
import { Errors } from "@notlegaladvice/data";
import { DomainEntities, Services } from "@notlegaladvice/domain";
import { satisfies } from "effect/Function";

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

    const mockRepository: Services.LegalDocumentRepository['Type'] = ({
      createLegalDocument: jest.fn((_) => Effect.succeed(dummyDoc)),
    } satisfies Partial<Services.LegalDocumentRepository['Type']>) as any;

    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* CreateLegalDocument;
      return yield* usecase(dummyDoc);
    }).pipe(Effect.provide(
      Layer.provideMerge(
        createLegalDocumentLive,
        repositoryLayer
      )
    ));

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

    const mockRepository: Services.LegalDocumentRepository['Type'] = {
      createLegalDocument: jest.fn((_) => Effect.fail(error))
    } as any as Services.LegalDocumentRepository['Type'];

    const repositoryLayer = Layer.succeed(
      Services.LegalDocumentRepository,
      Services.LegalDocumentRepository.of(mockRepository)
    );

    // Act
    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* CreateLegalDocument;
      return yield* usecase(dummyDoc);
    }).pipe(Effect.provide(
      Layer.provideMerge(createLegalDocumentLive, repositoryLayer)
    ));

    // Assert
    await expect(Effect.runPromise(effectUnderTest)).rejects.toEqual(
      new Errors.UnableToCreateLegalDocument({ cause: error })
    );
  });
});
