import { create } from 'zustand';

type DocumentStore = {
  selectedDocument: Document | null,
  setSelectedDocument: (newDocument: Document) => void
}

export type Document = {
  id: string,
  title: string
}

export const useDocumentStore = create<DocumentStore>(set =>
  ({
    selectedDocument: null,
    setSelectedDocument: (newDocument: Document) => set((state) => ({...state, selectedDocument: newDocument}))
  })
)
