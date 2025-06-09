import { describe, expect, it } from '@jest/globals';
import { Effect } from "effect";
import { createLegalDocumentFromDocumentLive, createLegalDocumentFromDocument } from "./create-legal-document-from-document";
import { ExecuteLLMExtractionFromDocument } from "./execute-llm-extraction-from-document";
import { CreateLegalDocument } from "./create-legal-document";
import { Prompts } from "@notlegaladvice/llm-integration";
import { DomainEntities } from "@notlegaladvice/domain";

describe("Given a valid OCRChainInput when createLegalDocumentFromDocument is executed then it should create a legal document and return it", () => {
  it("should return the legal document from the OCR extraction and creation process", async () => {
    // Arrange
    const dummyDocument: DomainEntities.LegalDocument = {
      id: "doc1",
      isDisabled: false,
      title: "Test Document",
      terms: [],
      involvedParts: [],
      objectives: [],
      obligations: [],
      rights: [],
      dueDateValidity: "2025-01-01"
    };
    
    const dummyInput: Prompts.OCRChainInput = {
      base64Image: "dummyBase64"
    };

    // Stub ExecuteLLMExtractionFromDocument to return the dummy document.
    const mockExecuteLLMExtractionFromDocument = (input: Prompts.OCRChainInput) => {
      return Effect.succeed(dummyDocument);
    };

    // Stub CreateLegalDocument to simply succeed.
    const mockCreateLegalDocument = (doc: DomainEntities.LegalDocument) => {
      return Effect.succeed(undefined);
    };

    // Provide mock dependencies in the Effect context.
    const effectUnderTest = createLegalDocumentFromDocument(dummyInput)
      .provideService(ExecuteLLMExtractionFromDocument, mockExecuteLLMExtractionFromDocument)
      .provideService(CreateLegalDocument, mockCreateLegalDocument);

    // Act
    const result = await Effect.runPromise(effectUnderTest);

    // Assert
    expect(result).toEqual(dummyDocument);
  });
});
