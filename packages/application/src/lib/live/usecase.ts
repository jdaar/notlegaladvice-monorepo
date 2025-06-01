import { getLegalDocumentsLive, createLegalDocumentLive, createLegalDocumentFromDocumentLive, executeLLMExtractionFromDocumentLive } from "@notlegaladvice/usecase"
import { Layer } from "effect"

export const useCaseLive = () =>
  Layer.provideMerge(
    createLegalDocumentFromDocumentLive,
    Layer.provideMerge(
      executeLLMExtractionFromDocumentLive,
      getLegalDocumentsLive.pipe(
        Layer.merge(createLegalDocumentLive)
      ),
    )
  );
