import "server-only"
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { PotwError } from "./server"

export const storageConfigured = process.env.VERCEL_ENV !== "preview" && ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_ORIGINALS_BUCKET", "R2_DISPLAY_BUCKET"].every(k => !!process.env[k])
export const originalsBucket = process.env.R2_ORIGINALS_BUCKET || "iris-potw-originals"
export const displayBucket = process.env.R2_DISPLAY_BUCKET || "iris-potw-display"
let client: S3Client | undefined
function storage() {
  if (!storageConfigured) throw new PotwError("Private photo storage is not configured yet", 503)
  return client ??= new S3Client({ region: "auto", endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! }, requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED" })
}
export async function signedUpload(key: string, bytes: number, contentType: string, expires: number) {
  const url = await getSignedUrl(storage(), new PutObjectCommand({ Bucket: originalsBucket, Key: key, ContentLength: bytes, ContentType: contentType }), { expiresIn: expires, signableHeaders: new Set(["content-length", "content-type"]) })
  const signed = new URL(url).searchParams.get("X-Amz-SignedHeaders") ?? ""
  if (!signed.includes("content-length") || !signed.includes("content-type")) throw new PotwError("Upload signature is not safely constrained", 503)
  return url
}
export async function signedImage(key: string, original = false, seconds = 300) {
  const url = await getSignedUrl(storage(), new GetObjectCommand({ Bucket: original ? originalsBucket : displayBucket, Key: key, ResponseCacheControl: `private, max-age=${Math.min(seconds, 240)}`, ...(original ? { ResponseContentDisposition: 'attachment; filename="iris-original"' } : {}) }), { expiresIn: seconds })
  return { url, expires_at: new Date(Date.now() + seconds * 1000).toISOString() }
}
export async function readUpload(key: string, expectedBytes: number, contentType: string) {
  const head = await storage().send(new HeadObjectCommand({ Bucket: originalsBucket, Key: key }), { abortSignal: AbortSignal.timeout(15000) })
  if (head.ContentLength !== expectedBytes || head.ContentType !== contentType) throw new PotwError("Uploaded file size or type does not match", 400)
  const object = await storage().send(new GetObjectCommand({ Bucket: originalsBucket, Key: key, IfMatch: head.ETag, Range: `bytes=0-${expectedBytes}` }), { abortSignal: AbortSignal.timeout(15000) })
  const bytes = Buffer.from(await object.Body!.transformToByteArray())
  if (bytes.length !== expectedBytes) throw new PotwError("Uploaded file changed or is incomplete", 400)
  return bytes
}
export async function writePhoto(key: string, bytes: Buffer, type: string, original = false) {
  await storage().send(new PutObjectCommand({ Bucket: original ? originalsBucket : displayBucket, Key: key, Body: bytes, ContentType: type, ContentLength: bytes.length, CacheControl: "private, max-age=240", StorageClass: "STANDARD" }), { abortSignal: AbortSignal.timeout(20000) })
}
export async function removeObject(key: string, original = false) {
  await storage().send(new DeleteObjectCommand({ Bucket: original ? originalsBucket : displayBucket, Key: key }), { abortSignal: AbortSignal.timeout(10000) })
}
export function versionKeys(competitionId: string, versionId: string) {
  const prefix = `competitions/${competitionId}/${versionId}`
  return { original_key: `${prefix}/original`, display_key: `${prefix}/display.webp`, thumbnail_key: `${prefix}/thumbnail.webp` }
}
