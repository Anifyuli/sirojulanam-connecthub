import express from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const router = express.Router();

const GARAGE_ENDPOINT = process.env.GARAGE_ENDPOINT;
const GARAGE_REGION = process.env.GARAGE_REGION || "garage";
const GARAGE_ACCESS_KEY_ID = process.env.GARAGE_ACCESS_KEY_ID;
const GARAGE_SECRET_ACCESS_KEY = process.env.GARAGE_SECRET_ACCESS_KEY;
const GARAGE_BUCKET = process.env.GARAGE_BUCKET;

const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === "true" || !GARAGE_ENDPOINT;
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const s3Client = USE_LOCAL_STORAGE ? null : new S3Client({
  endpoint: GARAGE_ENDPOINT,
  region: GARAGE_REGION,
  credentials: {
    accessKeyId: GARAGE_ACCESS_KEY_ID!,
    secretAccessKey: GARAGE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

router.get("/*", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const params = req.params as Record<string, string>;
    const key = params["0"] || Object.values(params)[0];

    if (USE_LOCAL_STORAGE) {
      const filePath = path.join(LOCAL_UPLOAD_DIR, path.basename(key));
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const command = new GetObjectCommand({
      Bucket: GARAGE_BUCKET,
      Key: key,
    });

    const response = await s3Client!.send(command);
    
    res.set("Content-Type", response.ContentType || "application/octet-stream");
    res.set("Cache-Control", "public, max-age=31536000");
    
    const stream = response.Body;
    if (stream) {
      const chunks: Uint8Array[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const chunk of stream as any) {
        chunks.push(chunk as Uint8Array);
      }
      const buffer = Buffer.concat(chunks);
      res.set("Content-Length", String(buffer.length));
      res.send(buffer);
    } else {
      res.status(500).json({ success: false, message: "Empty response" });
    }
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    console.error("Storage proxy error:", error);
    next(error);
  }
});

export default router;
