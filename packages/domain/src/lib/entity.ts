export namespace DomainEntities {
  export type EconomicConditionItem = {
    involvedPart: string;
    amount: number;
    currency: string;
    description: string;
    conditions: string[];
  };

  export type Duration = {
    years: number;
    months: number;
    days: number;
  };

  export type InvolvedLaw = {
    name: string;
    description: string;
  };

  export type TermsItem = {
    involvedPart: string;
    duration: Duration;
    description: string;
  };

  export type RightItem = {
    involvedPart: string;
    description: string;
  };

  export type ObligationItem = {
    involvedPart: string;
    description: string;
  };

  export type LegalDocument = {
    id?: string;
    isDisabled: boolean;
    title: string;
    terms: TermsItem[];
    involvedParts: string[];
    objectives: string[];
    obligations: ObligationItem[];
    rights: RightItem[];
    dueDateValidity: string;
    economicConditions: EconomicConditionItem[];
    involvedLaws: InvolvedLaw[];
  };
}

