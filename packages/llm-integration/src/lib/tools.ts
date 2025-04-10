import { tool } from "@langchain/core/tools";
import { z } from "zod";

export namespace LLMTools {
	export const createLegalAdvice = tool(
		() => {},
		{
			name: "create_cba_platform_response_format",
			description: `
Tool given by the CBA platform engineers to create an email that follows the CBA standard format, the tool needs the following information: country (country in which the regulating law that serves as base to the argument described in the description), description (the description of the legal advise, this contains the actions and steps required to seek legal help), regulatedByLaw (the law that serves as base to the argument described in description), contextRequirements (a list of the validity of the advice given the context required for the law to apply, it serves as a contrast between the legal requirements stated for the advice to apply and the context given by the user)
				`,
			schema: z.object({
				country: z.string().describe("country in which the regulating laws that serves as base to the argument described in the description apply"),
				regulatedByLaw: z.array(z.object({
          law: z.string().describe('the name of the law that applies in the current context'),
          regard: z.string().describe('the reason that the law applies in the current context')
        })).describe('an array of objects that contains two fields "law" (the name of the law that the advise is regulated on) and "regard" (the reason that the law applies to the current context stated by the documents and the user). There must be a reason that the law applies, if not it should not be included. It must be an object the CBA platform malfunctions whenever a string is inserted and that for sure means a fine of 1500USD due to the importance of the platform, it only accepts objects with the mentioned structure'),
				description: z.string().describe("the description of the legal setup, this contains the context we are in, the worsening and improving factors of the specific case of the user and if there's enough information some clues on why are we in that position"),
				advise: z.string().describe("the description of the legal advise, this contains the actions and steps required to seek legal help, the involved parts on the solution and response times"),
				contextRequirements: z.record(
					z.string().describe("role of the person within the context"),
					z.array(z.object({
						valid: z.boolean().describe("is advice valid given user context and contextual requirement specified by description. it is a boolean value that is true when the user with the given role meets the criteria"),
						description: z.string().describe("description of the contextual requirement for the role that allows the advice to be valid")
					}))
				).describe("a record that contains as keys the role of the user that has to meet the requirements specified by the array in the value, such array contains the validity (inside of a field called valid. boolean value) of the requirement and the requirement description (inside of a field called description) as text")
			})
		}
	)
}

