/* eslint-disable @typescript-eslint/ban-ts-comment */
import { chromium } from 'playwright';
import { Layer } from 'effect';
import { Services } from '@notlegaladvice/domain';

export function playwright(): string {
  return 'playwright';
}

export async function renderPDFToImages(pdfBytes: Uint8Array): Promise<Array<Uint8Array>> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    const base64PDF = Buffer.from(pdfBytes).toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64PDF}`;

    await page.goto(dataUrl);

    const pageCount = await page.evaluate(() => {
      // @ts-ignore - Access PDFViewerApplication from PDF.js which is available in data URL context
      return PDFViewerApplication.pagesCount;
    });

    const images: Uint8Array[] = [];

    for (let i = 0; i < pageCount; i++) {
      await page.evaluate((pageNum: number) => {
        // @ts-ignore - Access PDFViewerApplication from PDF.js
        PDFViewerApplication.page = pageNum;
      }, i + 1);

      await page.waitForTimeout(500);

      const screenshot = await page.screenshot();
      images.push(new Uint8Array(screenshot));
    }

    return images;
  } finally {
    await browser.close();
  }
}

export const PDFRendererLive = Layer.succeed(
  Services.PDFRenderer,
  Services.PDFRenderer.of({
    renderPDFToImages
  })
);
