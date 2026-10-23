import "server-only";

import { uploadMetadataSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_UPLOAD_MAX_BYTES } from "@/lib/admin/upload-policy";

export const PORTFOLIO_MEDIA_BUCKET = "portfolio-media";
export const RESUME_BUCKET = "resume-documents";

type UploadBucket =
  | typeof PORTFOLIO_MEDIA_BUCKET
  | typeof RESUME_BUCKET;

function isUploadBucket(bucket: string): bucket is UploadBucket {
  return bucket === PORTFOLIO_MEDIA_BUCKET || bucket === RESUME_BUCKET;
}

async function matchesFileSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));

  switch (file.type) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return (
        bytes[0] === 0x89 &&
        ascii(1, 4) === "PNG" &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "image/webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case "image/avif":
      return (
        ascii(4, 8) === "ftyp" &&
        (ascii(8, 12) === "avif" || ascii(8, 12) === "avis")
      );
    case "application/pdf":
      return ascii(0, 5) === "%PDF-";
    default:
      return false;
  }
}

const uploadRules: Record<
  UploadBucket,
  { maxSize: number; mimeTypes: Set<string> }
> = {
  [PORTFOLIO_MEDIA_BUCKET]: {
    maxSize: ADMIN_UPLOAD_MAX_BYTES,
    mimeTypes: new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  },
  [RESUME_BUCKET]: {
    maxSize: ADMIN_UPLOAD_MAX_BYTES,
    mimeTypes: new Set(["application/pdf"]),
  },
} as const;

export async function uploadAdminAsset(
  bucket: string,
  storagePath: string,
  file: File,
): Promise<void> {
  const metadata = uploadMetadataSchema.parse({
    storage_bucket: bucket,
    storage_path: storagePath,
    media_type: file.type,
    alt_text: null,
    is_published: false,
  });
  const safeBucket = metadata.storage_bucket;

  if (!isUploadBucket(safeBucket)) {
    throw new Error("The requested storage bucket is not allowed.");
  }

  const rules = uploadRules[safeBucket];

  if (file.size < 1 || file.size > rules.maxSize) {
    throw new Error("The file size is outside the permitted range.");
  }
  if (
    safeBucket === RESUME_BUCKET &&
    !metadata.storage_path.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error("Resume files must use a PDF filename.");
  }

  if (!rules.mimeTypes.has(metadata.media_type)) {
    throw new Error("The file type is not allowed in this storage bucket.");
  }

  await requireAdmin();

  if (!(await matchesFileSignature(file))) {
    throw new Error("The file contents do not match the declared file type.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage
    .from(safeBucket)
    .upload(metadata.storage_path, file, {
      contentType: metadata.media_type,
      upsert: false,
    });

  if (error) {
    console.error("Unable to upload administrator media.", error);
    throw new Error("The asset could not be uploaded.");
  }

  const metadataInsert =
    safeBucket === PORTFOLIO_MEDIA_BUCKET
      ? await supabase.from("media_assets").insert({
          storage_bucket: safeBucket,
          storage_path: metadata.storage_path,
          media_type: metadata.media_type,
          alt_text: metadata.alt_text,
          is_published: false,
        })
      : await supabase.from("resume_assets").insert({
          storage_bucket: safeBucket,
          storage_path: metadata.storage_path,
          file_name:
            metadata.storage_path.slice(
              metadata.storage_path.lastIndexOf("/") + 1,
            ),
          display_order: 0,
          is_published: false,
        });

  if (metadataInsert.error) {
    const { error: cleanupError } = await supabase.storage
      .from(safeBucket)
      .remove([metadata.storage_path]);

    console.error(
      "Unable to register uploaded media metadata.",
      metadataInsert.error,
    );
    if (cleanupError) {
      console.error("Unable to remove the unregistered storage object.", cleanupError);
    }
    throw new Error("The uploaded asset could not be registered.");
  }
}

export async function createPublishedAssetUrl(
  bucket: string,
  storagePath: string,
  expiresInSeconds = 300,
): Promise<string> {
  if (!isUploadBucket(bucket)) {
    throw new Error("The requested storage bucket is not allowed.");
  }

  if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1) {
    throw new Error("The signed URL lifetime must be a positive integer.");
  }

  const supabase = await createSupabaseServerClient();
  const metadataResult =
    bucket === PORTFOLIO_MEDIA_BUCKET
      ? await supabase
          .from("media_assets")
          .select("storage_path")
          .eq("storage_path", storagePath)
          .eq("is_published", true)
          .maybeSingle()
      : await supabase
          .from("resume_assets")
          .select("storage_path")
          .eq("storage_path", storagePath)
          .eq("is_published", true)
          .maybeSingle();

  if (metadataResult.error) {
    console.error("Unable to verify published asset metadata.", metadataResult.error);
    throw new Error("The requested published asset could not be verified.");
  }
  if (!metadataResult.data) {
    throw new Error("The requested asset is not published.");
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) {
    console.error("Unable to create a published asset URL.", error);
    throw new Error("The published asset could not be loaded.");
  }

  return data.signedUrl;
}
