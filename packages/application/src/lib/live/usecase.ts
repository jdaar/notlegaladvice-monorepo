import { placeholderLive, getLegalDocumentsLive, createLegalDocumentLive, executeLLMExtractionFromDocumentLive } from "@notlegaladvice/usecase"
import { Layer } from "effect"

export const useCaseLive = () =>
  Layer.provideMerge(
    placeholderLive,
    getLegalDocumentsLive.pipe(
      Layer.merge(createLegalDocumentLive)
    ),
  ).pipe(
    Layer.merge(executeLLMExtractionFromDocumentLive)
  )
