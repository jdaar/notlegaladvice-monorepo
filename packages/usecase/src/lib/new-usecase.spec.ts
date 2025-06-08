import { newUsecaseFn } from "./new-usecase";
import { Effect } from "effect";

describe("NewUsecase", () => {
  it("processes input correctly", async () => {
    // Provide a dummy LegalDocumentRepository.
    const dummyRepo = {} as any;
    const input = { data: "test" };
    const result = await Effect.runPromise(
      Effect.provide(newUsecaseFn(input), dummyRepo)
    );
    expect(result).toEqual({ result: "Processed: test" });
  });
});
