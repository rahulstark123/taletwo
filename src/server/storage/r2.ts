import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 through its S3-compatible API. Photos are stored privately. The app never hands out
 * bucket addresses: it signs short-lived read links after checking the caller's access.
 *
 * Object keys look like `<S3_STORAGE_PREFIX>/<area>/<path>`, for example
 * `taletwo/memories/12/<memoryId>/<file>.webp` or `taletwo/avatars/<userId>/<file>.webp`.
 */

export type StorageArea = "memories" | "avatars" | "confessions";

const READ_LINK_SECONDS = 60 * 60;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. Add it to .env.local.`);
  return value;
}

let cached: { client: S3Client; bucket: string; prefix: string } | null = null;

function connection() {
  if (cached) return cached;
  cached = {
    client: new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: env("S3_ENDPOINT"),
      forcePathStyle: true,
      credentials: {
        accessKeyId: env("S3_ACCESS_KEY_ID"),
        secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
      },
    }),
    bucket: env("S3_BUCKET_NAME"),
    prefix: (process.env.S3_STORAGE_PREFIX || "taletwo").replace(/^\/+|\/+$/g, ""),
  };
  return cached;
}

function keyFor(area: StorageArea, path: string): string {
  const { prefix } = connection();
  return `${prefix}/${area}/${path}`;
}

/** Stores one already-validated file. The caller decides the path and checks access. */
export async function putPrivateObject(area: StorageArea, path: string, body: Uint8Array, contentType: string): Promise<void> {
  const { client, bucket } = connection();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: keyFor(area, path),
      Body: body,
      ContentType: contentType,
      CacheControl: "private, max-age=3600",
    })
  );
}

/**
 * Read link for one stored photo. With S3_PUBLIC_BASE_URL set, it is the bucket's public address, so
 * anyone holding the link can open the photo. Without it, a short-lived signed link is issued instead.
 */
export async function readUrl(area: StorageArea, path: string): Promise<string> {
  const { client, bucket } = connection();
  const key = keyFor(area, path);
  const publicBase = (process.env.S3_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (publicBase) {
    return `${publicBase}/${key.split("/").map(encodeURIComponent).join("/")}`;
  }
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: READ_LINK_SECONDS });
}

/** Reads one private object's bytes. Used by server routes, so the browser never needs a storage link. */
export async function getPrivateBytes(area: StorageArea, path: string): Promise<Uint8Array> {
  const { client, bucket } = connection();
  const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: keyFor(area, path) }));
  if (!res.Body) throw new Error("Stored object is empty.");
  return res.Body.transformToByteArray();
}

/**
 * Short-lived signed link that never uses the public base address. Used for private material such as
 * confession recordings, which must not be reachable by anyone who guesses the path.
 */
export async function signedReadUrl(area: StorageArea, path: string): Promise<string> {
  const { client, bucket } = connection();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: keyFor(area, path) }), { expiresIn: READ_LINK_SECONDS });
}

/** Deletes objects in batches of up to 1,000 (the S3 limit). Missing keys are ignored. */
export async function deletePrivateObjects(area: StorageArea, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { client, bucket } = connection();
  for (let i = 0; i < paths.length; i += 1000) {
    const batch = paths.slice(i, i + 1000);
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((p) => ({ Key: keyFor(area, p) })), Quiet: true },
      })
    );
  }
}

/** Read-only check that the credentials and bucket work. Used by the setup check, not by pages. */
export async function bucketReachable(): Promise<boolean> {
  const { client, bucket } = connection();
  await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }));
  return true;
}
