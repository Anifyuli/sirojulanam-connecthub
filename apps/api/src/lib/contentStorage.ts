import { processHtmlImages, deleteFile, extractS3KeyFromUrl } from "./storage.js";

export interface ProcessedContent {
  html: string;
  uploadedImages: Array<{ url: string; key: string }>;
}

export async function processQuillContent(html: string): Promise<ProcessedContent> {
  const { processedHtml, uploadedImages } = await processHtmlImages(html);
  return {
    html: processedHtml,
    uploadedImages,
  };
}

export function extractImageUrls(html: string): string[] {
  const imgRegex = /<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/g;
  const urls: string[] = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

export async function cleanupOldImages(oldHtml: string | null | undefined, newHtml: string): Promise<void> {
  if (!oldHtml) return;

  const oldUrls = extractImageUrls(oldHtml);
  const newUrls = extractImageUrls(newHtml);

  const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));

  for (const url of removedUrls) {
    const key = extractS3KeyFromUrl(url);
    if (key && key.startsWith("uploads/")) {
      try {
        await deleteFile(key);
      } catch (error) {
        console.error(`Failed to delete old image: ${url}`, error);
      }
    }
  }
}
