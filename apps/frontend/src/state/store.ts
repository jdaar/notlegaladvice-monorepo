import { DomainEntities } from '@notlegaladvice/domain';
import { create } from 'zustand';

type DocumentStore = {
  documents: Array<DomainEntities.LegalDocument> | null,
  setDocuments: (newDocuments: Array<DomainEntities.LegalDocument>) => void
  selectedDocument: DomainEntities.LegalDocument | null,
  setSelectedDocument: (newDocument: DomainEntities.LegalDocument) => void
}

export const useDocumentStore = create<DocumentStore>(set =>
  ({
    documents: [],
    setDocuments: (newDocuments: Array<DomainEntities.LegalDocument>) => set((state) => ({...state, documents: newDocuments})),
    selectedDocument: null,
    setSelectedDocument: (newDocument: DomainEntities.LegalDocument) => set((state) => ({...state, selectedDocument: newDocument}))
  })
)
