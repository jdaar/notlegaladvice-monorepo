import { Context, Effect, Layer } from "effect";
import { Services } from "@notlegaladvice/domain";
import { Errors } from "@notlegaladvice/data";

type NewUsecaseSignature = (input: { data: string }) => Effect.Effect<
  { result: string },
  Errors.UnexpectedError,
  Services.LegalDocumentRepository
>;

export class NewUsecase extends Context.Tag("NewUsecase")<
  NewUsecase,
  NewUsecaseSignature
>() {}

const newUsecase: NewUsecaseSignature = (input) => {
  return Effect.gen(function* () {
    // Example business logic: process the input data and return a result.
    const result = { result: `Processed: ${input.data}` };
    return result;
  });
};

export const newUsecaseLive = Layer.succeed(
  NewUsecase,
  NewUsecase.of(newUsecase)
);
export const newUsecaseFn = newUsecase;
