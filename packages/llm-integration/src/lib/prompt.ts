/* eslint-disable @typescript-eslint/no-namespace */
import { ChatPromptTemplate } from "@langchain/core/prompts";

export namespace Prompts {
  export interface OCRChainInput {
      base64Image: string;
  }

  export interface SerializationChainInput {
      documentText: string;
  }

  export interface AgentInput {
    ocrAnalysis: string,
    currentDate: string
  }

	export class Templates {
    public static get analyzeDocumentViaOCRText() {
      return (ocrAnalisys: string, currentDate: string) => `
Contenido del documento legal a analizar para el asesoramiento del usuario:
${ocrAnalisys}

Fecha actual: ${currentDate}

Complementa los contenidos del documento legal basado en tu conocimiento en leyes, principalmente en leyes enfocadas a los usuarios finales, personas naturales.
Incluye consecuencias de las leyes de la republica de colombia que menciones.

Extrae los siguientes aspectos del documento legal para iniciar un analisis del caso:
- Partes involucradas (listado)
- Objeto del documento (listado)
- Obligaciones y derechos (listado, debes de mencionar obligatoriamente a cual de las partes involucradas le afecta dicha condicion o derecho)
- Plazos y duración (totalizado, debes de mencionar obligatoriamente a cual de las partes involucradas le afectan dichos plazos, tambien debes de mencionar la duracion de los plazos en años, meses y dias)
- Condiciones económicas (listado, debes de mencionar obligatoriamente a cual de las partes involucradas le afectan dichos condiciones economicas, tambien debes mencionar monto total relacionado a la condicion economica, tambien si aplica menciona que condiciones se deben de cumplir para que la condicion economica aplique)
      `;
    }

    public static get extractOCRTextFromDocument() {
      return ChatPromptTemplate.fromMessages<OCRChainInput>([
          ["human", [
              {
                  type: "text",
                  text: "Carefully analyze and extract the text from the following file, the output shall be in standard markdown syntax and it cannot contain any special character"
              },
              {
                  type: "image_url",
                  image_url: "data:application/pdf;base64,{base64Image}",
              },
          ]],
      ]);
    }

    public static get serializeLegalDocument() {
      return ChatPromptTemplate.fromMessages<SerializationChainInput>([
          ["human", [
              {
                  type: "text",
                  text: "Extract the data given by the text in JSON format, all fields inside the response shall be in the Spanish language: {documentText}"
              },
          ]],
      ]);
    }
  }
}

