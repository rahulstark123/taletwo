/**
 * Confession Room encryption, run in the browser. The lock password never leaves the device: a key is
 * derived from it with PBKDF2 (SHA-256) and used with AES-GCM to seal the text and audio. The server only
 * stores ciphertext, so it cannot read a confession. A wrong password fails the authentication check.
 */

/** OWASP guidance for PBKDF2-SHA256. Slows down guessing if the stored data is ever copied. */
const PBKDF2_ITERATIONS = 600_000;
const IV_BYTES = 12;

export const CONFESSION_PASSWORD_MIN = 6;

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** A fresh random salt for one confession, base64. */
export function newSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)));
}

/** Derives the AES-GCM key for one confession from its lock password and salt. */
export async function deriveKey(password: string, saltB64: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: fromBase64(saltB64) as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Seals bytes. The output is the random IV followed by the ciphertext. */
export async function sealBytes(key: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, data as BufferSource));
  const out = new Uint8Array(IV_BYTES + cipher.length);
  out.set(iv, 0);
  out.set(cipher, IV_BYTES);
  return out;
}

/** Opens bytes made by sealBytes. Throws when the key is wrong or the data was changed. */
export async function openBytes(key: CryptoKey, sealed: Uint8Array): Promise<Uint8Array> {
  const iv = sealed.subarray(0, IV_BYTES);
  const cipher = sealed.subarray(IV_BYTES);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, cipher as BufferSource);
  return new Uint8Array(plain);
}

export async function sealText(key: CryptoKey, text: string): Promise<string> {
  return toBase64(await sealBytes(key, new TextEncoder().encode(text)));
}

export async function openText(key: CryptoKey, sealedB64: string): Promise<string> {
  return new TextDecoder().decode(await openBytes(key, fromBase64(sealedB64)));
}
