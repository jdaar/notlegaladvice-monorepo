import { Effect, Layer } from "effect";
import { executeLLMExtractionFromDocumentLive, ExecuteLLMExtractionFromDocument } from "./execute-llm-extraction-from-document";
import { Errors } from "@notlegaladvice/data";
import { DomainEntities, Services } from "@notlegaladvice/domain";
import { Prompts, LLMChains } from "@notlegaladvice/llm-integration";

// Create dummy layers for dependencies
const dummyOCRAgentInstance = "dummyModel";
const dummyAgentCompletionInstance = "dummyCall";

// Create a dummy legal document for testing
const dummyLegalDoc: DomainEntities.LegalDocument = {
  id: "doc1",
  isDisabled: false,
  title: "Test Legal Document",
  terms: [],
  involvedParts: [],
  objectives: [],
  obligations: [],
  rights: [],
  dueDateValidity: "2025-01-01",
  economicConditions: [],
  involvedLaws: []
};

describe("Given a valid OCRChainInput when executeLLMExtractionFromDocument is executed then it should return the legal document", () => {
  it("arranges a valid input and mocks successful extraction, acts by invoking the use case, and asserts that the legal document is returned", async () => {
    // Arrange
    const validInput: Prompts.OCRChainInput = { base64Image: "validBase64String" };

    // Mock the pipeline to return a sequence object with a successful invoke method.
    const mockSequence = {
      invoke: jest.fn(() => Promise.resolve(dummyLegalDoc))
    };
    const fullPipelineSpy = jest.spyOn(LLMChains, "fullPipeline").mockReturnValue(mockSequence as any);

    // Provide dummy implementations for dependencies
    const dependencyLayer = Layer.provideMerge(
      Layer.succeed(Services.OCRAgentInstance, dummyOCRAgentInstance),
      Layer.succeed(Services.AgentCompletionInstance, dummyAgentCompletionInstance)
    );

    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* ExecuteLLMExtractionFromDocument;
      return yield* usecase(validInput);
    }).pipe(
      Effect.provide(
        Layer.provideMerge(executeLLMExtractionFromDocumentLive, dependencyLayer)
      )
    );

    // Act
    const result = await Effect.runPromise(effectUnderTest);

    // Assert
    expect(result).toEqual(dummyLegalDoc);
    expect(mockSequence.invoke).toHaveBeenCalledWith(validInput);
    fullPipelineSpy.mockRestore();
  });
});

describe("Given an error occurs during sequence.invoke when executeLLMExtractionFromDocument is executed then it should fail with UnableToExecuteLLMExtractionPipeline", () => {
  it("arranges an input that causes invoke to fail, acts by invoking the use case, and asserts that the proper error is thrown", async () => {
    // Arrange
    const validInput: Prompts.OCRChainInput = { base64Image: "errorBase64String" };
    const errorMessage = "error";
    const mockSequence = {
      invoke: jest.fn(() => Promise.reject(new Error(errorMessage)))
    };
    const fullPipelineSpy = jest.spyOn(LLMChains, "fullPipeline").mockReturnValue(mockSequence as any);

    // Provide dummy implementations for dependencies
    const dependencyLayer = Layer.provideMerge(
      Layer.succeed(Services.OCRAgentInstance, dummyOCRAgentInstance),
      Layer.succeed(Services.AgentCompletionInstance, dummyAgentCompletionInstance)
    );

    const effectUnderTest = Effect.gen(function* () {
      const usecase = yield* ExecuteLLMExtractionFromDocument;
      return yield* usecase(validInput);
    }).pipe(
      Effect.provide(
        Layer.provideMerge(executeLLMExtractionFromDocumentLive, dependencyLayer)
      )
    );

    // Act & Assert
    await expect(Effect.runPromise(effectUnderTest))
      .rejects
      .toMatchObject({ message: expect.stringContaining(errorMessage) });
    fullPipelineSpy.mockRestore();
  });
});
