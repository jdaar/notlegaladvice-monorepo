import { tool } from "@langchain/core/tools";
import { z } from "zod";

export namespace LLMTools {
	export const getFullLawText = tool(
		({law}) => {
			console.log(law)
			return "";
		},
		{
			name: "extract_full_law_text",
			description: `
Tool to get a law's full text against a legal library
				`,
			schema: z.object({
				law: z.string().describe("the name of the law in the format 'Law {LAW NUMBER} of {LAW YEAR}'"),
			})
		}
	)

	export const createLegalAdvice = tool(
		() => {},
		{
			name: "create_cba_platform_response_format",
			description: `
Tool given by the CBA platform engineers to create an email that follows the CBA standard format, the tool needs the following information: country (country in which the regulating law that serves as base to the argument described in the description), description (the description of the legal advise, this contains the actions and steps required to seek legal help), regulatedByLaw (the law that serves as base to the argument described in description), contextRequirements (a list of the validity of the advice given the context required for the law to apply, it serves as a contrast between the legal requirements stated for the advice to apply and the context given by the user)
				`,
			schema: z.object({
				country: z.string().describe("country in which the regulating law that serves as base to the argument described in the description"),
				regulatedByLaw: z.string(),
				description: z.string().describe("the description of the legal advise, this contains the actions and steps required to seek legal help"),
				contextRequirements: z.record(
					z.string().describe("id of the contextual requirement"),
					z.object({
						valid: z.boolean().describe("is advice valid given user context and contextual requirement specified by description"),
						description: z.string().describe("contextual requirement for the advice to be valid")
					})
				)
			})
		}
	)
}

