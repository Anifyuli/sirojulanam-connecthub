import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const GARAGE_ENDPOINT = process.env.GARAGE_ENDPOINT;
const GARAGE_REGION = process.env.GARAGE_REGION || "garage";
const GARAGE_ACCESS_KEY_ID = process.env.GARAGE_ACCESS_KEY_ID;
const GARAGE_SECRET_ACCESS_KEY = process.env.GARAGE_SECRET_ACCESS_KEY;
const GARAGE_BUCKET = process.env.GARAGE_BUCKET;

const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === "true" || !GARAGE_ENDPOINT;

if (!USE_LOCAL_STORAGE) {
  if (!GARAGE_ACCESS_KEY_ID) throw new Error("GARAGE_ACCESS_KEY_ID must be defined");
  if (!GARAGE_SECRET_ACCESS_KEY) throw new Error("GARAGE_SECRET_ACCESS_KEY must be defined");
  if (!GARAGE_BUCKET) throw new Error("GARAGE_BUCKET must be defined");
}

const s3Client = USE_LOCAL_STORAGE ? null : new S3Client({
  endpoint: GARAGE_ENDPOINT,
  region: GARAGE_REGION,
  credentials: {
    accessKeyId: GARAGE_ACCESS_KEY_ID!,
    secretAccessKey: GARAGE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

if (USE_LOCAL_STORAGE && !fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  console.log("[STORAGE] Using local storage at:", LOCAL_UPLOAD_DIR);
} else if (USE_LOCAL_STORAGE) {
  console.log("[STORAGE] Using local storage at:", LOCAL_UPLOAD_DIR);
}

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const key = `uploads/${Date.now()}-${filename}`;

  if (USE_LOCAL_STORAGE) {
    const filePath = path.join(LOCAL_UPLOAD_DIR, path.basename(key));
    fs.writeFileSync(filePath, file);
    const url = `/uploads/${path.basename(key)}`;
    return { url, key };
  }

  const command = new PutObjectCommand({
    Bucket: GARAGE_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client!.send(command);

  const url = `/api/storage/${key}`;

  return { url, key };
}

export async function uploadBase64Image(base64Data: string): Promise<UploadResult> {
  const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 image data");
  }

  const mimeType = matches[1];
  const base64Content = matches[2];
  const buffer = Buffer.from(base64Content, "base64");
  const extension = mimeType.split("/")[1];
  const filename = `${uuidv4()}.${extension}`;

  return uploadFile(buffer, filename, mimeType);
}

export async function uploadFromUrl(imageUrl: string): Promise<UploadResult> {
  try {
    const url = new URL(imageUrl);
    const response = await axios.get(url.toString(), {
      responseType: "arraybuffer",
      timeout: 30000,
      maxContentLength: 10 * 1024 * 1024,
    });

    const contentType = (response.headers["content-type"] as string) || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      throw new Error("URL bukan file gambar");
    }

    const extension = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const filename = `${uuidv4()}.${extension}`;
    const buffer = Buffer.from(response.data as ArrayBuffer);

    return uploadFile(buffer, filename, contentType);
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
      throw new Error("Gagal mengunduh gambar, timeout", { cause: error });
    }
    throw error;
  }
}

export async function processHtmlImages(html: string): Promise<{ processedHtml: string; uploadedImages: UploadResult[] }> {
  const base64ImageRegex = /<img[^>]+src="(data:image\/\w+;base64,[^"]+)"[^>]*>/g;
  const matches = Array.from(html.matchAll(base64ImageRegex));
  const uploadedImages: UploadResult[] = [];
  let processedHtml = html;

  for (const match of matches) {
    const fullMatch = match[0];
    const base64Data = match[1];

    try {
      const result = await uploadBase64Image(base64Data);
      uploadedImages.push(result);
      processedHtml = processedHtml.replace(fullMatch, fullMatch.replace(base64Data, result.url));
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  }

  return { processedHtml, uploadedImages };
}

export async function deleteFile(key: string): Promise<void> {
  if (USE_LOCAL_STORAGE) {
    const filePath = path.join(LOCAL_UPLOAD_DIR, path.basename(key));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: GARAGE_BUCKET,
    Key: key,
  });

  await s3Client!.send(command);
}

export function extractS3KeyFromUrl(url: string): string | null {
  if (USE_LOCAL_STORAGE) {
    const match = url.match(/\/uploads\/(.+)/);
    return match ? `uploads/${match[1]}` : null;
  }
  
  const regex = new RegExp(`${GARAGE_BUCKET}/(.+)`);
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function isBase64Image(value: string): boolean {
  return /^data:image\/\w+;base64,/i.test(value);
}

export function isExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isS3Url(value: string): boolean {
  if (USE_LOCAL_STORAGE) {
    return value.startsWith("/uploads/");
  }
  return value.includes(GARAGE_BUCKET || "");
}

export async function processImageUrl(imageUrl: string | undefined): Promise<string> {
  if (!imageUrl) return "";

  if (isBase64Image(imageUrl)) {
    const result = await uploadBase64Image(imageUrl);
    return result.url;
  }

  if (isExternalUrl(imageUrl) && !isS3Url(imageUrl)) {
    const result = await uploadFromUrl(imageUrl);
    return result.url;
  }

  return imageUrl;
}
