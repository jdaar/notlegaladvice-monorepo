import { Context, Effect, Layer } from "effect";
import { Services } from "@notlegaladvice/domain";
import { Errors } from "@notlegaladvice/data";

export class ConvertPDFToImageArray extends Context.Tag("ConvertPDFToImageArray")<
  ConvertPDFToImageArray,
  (
    pdfBytes: Uint8Array
  ) => Effect.Effect<
    Array<Uint8Array>,
    Errors.UnableToConvertPDFToImage,
    Services.PDFRenderer
  >
>() {}

function convertPDFToImageArray(pdfBytes: Uint8Array) {
  return Effect.gen(function* () {
    const pdfRenderer = yield* Services.PDFRenderer;
    
    const images = yield* Effect.tryPromise({
      try: () => pdfRenderer.renderPDFToImages(pdfBytes),
      catch: (error) => new Errors.UnableToConvertPDFToImage({
        cause: error instanceof Error ? error : new Error('Failed to convert PDF to images')
      })
    })
    .pipe(
      Effect.tap(() => Effect.log("PDF converted to images array successfully")),
      Effect.withSpan("pdf_to_images_conversion"),
      Effect.catchAll(error => Effect.fail(new Errors.UnableToConvertPDFToImage({cause: error})))
    );
    
    return images;
  });
}

export const convertPDFToImageArrayLive = Layer.succeed(
  ConvertPDFToImageArray,
  ConvertPDFToImageArray.of(convertPDFToImageArray)
);