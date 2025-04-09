export namespace DomainEntities {
	export type LegalAdvice = {
      country: string,
      regulatedByLaw: string,
      description: string,
      contextRequirements: Record<string, {
        valid: boolean,
        description: string
      }>
  }
}

