import sharp from "sharp"
import exifr from "exifr"
import { createHash } from "node:crypto"
import { MAX_UPLOAD_BYTES } from "./types"

const AI_MARKERS = /midjourney|stable[ _-]?diffusion|comfyui|automatic1111|dall[ -]?e|adobe firefly|generative fill|trainedalgorithmicmedia|gpt.image/i
export async function processPhoto(bytes: Buffer, contentType: string) {
  if (bytes.length === 0 || bytes.length > MAX_UPLOAD_BYTES) throw new Error("Photo must be no larger than 5 MiB")
  const magic = bytes[0] === 0xff && bytes[1] === 0xd8 ? "jpeg" : bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png" : bytes.toString("ascii",0,4)==="RIFF" && bytes.toString("ascii",8,12)==="WEBP" ? "webp" : null
  const expected = contentType === "image/jpeg" ? "jpeg" : contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : null
  if (!magic || magic !== expected) throw new Error("Choose a genuine JPEG, PNG, or WebP photograph")
  const image = sharp(bytes, { limitInputPixels: 48000000, failOn: "warning" })
  const metadata = await image.metadata()
  if (metadata.format !== magic || (metadata.pages ?? 1) > 1 || !metadata.width || !metadata.height) throw new Error("Animated or invalid photographs are not supported")
  // Decode the complete source before accepting it, including pixels outside derivatives.
  await image.clone().timeout({ seconds: 15 }).stats()
  let ai_evidence: string[] = []
  try {
    const tags = await exifr.parse(bytes, { gps: false, xmp: true, iptc: true, icc: false })
    const text = JSON.stringify(tags ?? {}).slice(0, 1000000)
    const marker = text.match(AI_MARKERS)?.[0]
    if (marker) ai_evidence = [`Possible AI-generation marker: ${marker}`]
  } catch { /* Valid images can have metadata the parser does not understand. */ }
  const display = await image.clone().rotate().resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).timeout({ seconds: 15 }).toBuffer()
  const thumbnail = await image.clone().rotate().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).timeout({ seconds: 10 }).toBuffer()
  return { display, thumbnail, width: metadata.width, height: metadata.height, sha256: createHash("sha256").update(bytes).digest("hex"), ai_evidence }
}
