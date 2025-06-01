import { getLegalDocumentsLive, createLegalDocumentLive, createLegalDocumentFromDocumentLive, executeLLMExtractionFromDocumentLive, disableLegalDocumentLive, deleteLegalDocumentLive } from "@notlegaladvice/usecase"
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
  ).pipe(
    Layer.merge(disableLegalDocumentLive),
    Layer.merge(deleteLegalDocumentLive)
  )
