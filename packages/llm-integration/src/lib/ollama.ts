import { Config, Effect, Layer } from "effect";
import { Services } from "@notlegaladvice/domain";
import { Prompts } from "./prompt.js";

interface OllamaChatMessage {
    role: string;
    content: string;
}
interface OllamaChatResponse {
    model: string;
    created_at: string;
    message: OllamaChatMessage;
    done: boolean;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}

const agentCompletionFunction: (baseUrl: string) => Services.AgentCompletionFunction = (baseUrl) => async (input) => {
    const { ocrAnalysis, currentDate } = input;
    const modelName = 'lightrag:latest'
    const apiUrl = `${baseUrl}/api/chat`;
    const systemPromptText = `Eres un asesor legal en la republica de Colombia`;

    const formattedHumanContent = (JSON.parse(JSON.stringify({
			value: Prompts.Templates.analyzeDocumentViaOCRText(ocrAnalysis, currentDate)
		})) as {value: string}).value;

    const requestBody = {
        model: modelName,
        system: systemPromptText,
        stream: false,
        messages: [
            {
                role: "user",
                content: formattedHumanContent.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"").trim()
            }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Lightrag API request failed with status ${response.status}: ${errorBody}`);
            throw new Error(`Lightrag API request failed with status ${response.status}`);
        }

        const responseData: OllamaChatResponse = (await response.json()) as OllamaChatResponse;
				console.log(responseData)

        if (responseData.message && responseData.message.content) {
            return responseData.message.content;
        } else {
            console.warn("Warning: Unexpected Lightrag API response structure. Full response:", responseData);
            return (responseData as any).content || (responseData as any).message || JSON.stringify(responseData);
        }

    } catch (error) {
        console.error("Error calling Lightrag API:", error);
        if (error instanceof Error) throw error;
        throw new Error(String(error));
    }
}

export const agentCompletionLive = Layer.effect(
  Services.AgentCompletionInstance,
  Effect.gen(function* (){
    const lightragBaseUrl = yield* Config.string("LIGHTRAG_BASE_URL");
    return Services.AgentCompletionInstance.of(agentCompletionFunction(lightragBaseUrl));
  })
);
