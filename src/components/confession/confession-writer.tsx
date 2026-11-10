"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Mic, Square, Trash2, X } from "lucide-react";
import { apiCall } from "@/components/onboarding/api-client";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/confession/password-input";
import { CONFESSION_PASSWORD_MIN, deriveKey, newSalt, sealBytes, sealText } from "@/lib/confession-crypto";
import type { ConfessionListItem } from "@/server/services/confessions";

/** Readable file size, for example "180 KB". */
function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TITLE_MAX = 80;
const TEXT_MAX = 5000;
const RECORD_MAX_SECONDS = 600;

interface Recording {
  blob: Blob;
  url: string;
  mime: string;
}

interface UploadShape {
  ok: boolean;
  data?: { path: string };
  error?: { message: string };
}

/**
 * Writes one confession. The text and recording are sealed in the browser with a key from the lock
 * password before anything is sent, so the password and the plain words never reach the server.
 */
export function ConfessionWriter({ partnerName, onClose, onSaved }: { partnerName: string; onClose: () => void; onSaved: (item: ConfessionListItem) => void }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [shared, setShared] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audio, setAudio] = useState<Recording | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop the microphone and drop the preview if the writer closes mid-way.
  useEffect(() => {
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  // Count the recording time while the recorder runs.
  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  function stopRecording() {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    autoStopRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecording(false);
  }

  async function startRecording() {
    setRecordError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setRecordError("Voice notes are not supported in this browser. You can still write the confession.");
      return;
    }
    try {
      // Mono speech with noise suppression keeps the recording small without hurting clarity.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
      // 24 kbps Opus is clear for voice and makes about 180 KB per minute, so ten minutes stays under 2 MB.
      const recorder = new MediaRecorder(stream, { ...(preferred ? { mimeType: preferred } : {}), audioBitsPerSecond: 24_000 });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        setAudio({ blob, url, mime });
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      autoStopRef.current = setTimeout(() => stopRecording(), RECORD_MAX_SECONDS * 1000);
      setElapsed(0);
      setAudio(null);
      setRecording(true);
    } catch {
      setRecordError("We could not use your microphone. Check the browser permission and try again.");
    }
  }

  function discardRecording() {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudio(null);
  }

  const cleanTitle = title.trim();
  const cleanText = text.trim();
  const hasContent = cleanText.length > 0 || audio !== null;
  const passwordOk = password.length >= CONFESSION_PASSWORD_MIN && password === confirm;
  const canSave = cleanTitle.length > 0 && hasContent && passwordOk && !recording && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const salt = newSalt();
      const key = await deriveKey(password, salt);
      const sealed = await sealText(key, JSON.stringify({ title: cleanTitle, text: cleanText, audioMime: audio?.mime ?? null }));

      let audioPath: string | undefined;
      if (audio) {
        const encrypted = await sealBytes(key, new Uint8Array(await audio.blob.arrayBuffer()));
        const upload = await fetch("/api/confessions/audio", {
          method: "POST",
          headers: { "content-type": "application/octet-stream" },
          body: encrypted as unknown as BodyInit,
          credentials: "same-origin",
        });
        const json = (await upload.json()) as UploadShape;
        if (!json.ok || !json.data) {
          setError(json.error?.message ?? "The recording could not be saved. Please try again.");
          return;
        }
        audioPath = json.data.path;
      }

      const res = await apiCall<{ confession: { id: string } }>("/api/confessions", {
        method: "POST",
        body: { shared, salt, sealed, audioPath, label: cleanTitle },
      });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      onSaved({ id: res.data.confession.id, authorName: "You", isMine: true, shared, hasAudio: audioPath !== undefined, label: cleanTitle || null,createdAt: new Date().toISOString() });
    } catch {
      setError("Something went wrong while locking your confession. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close without saving" onClick={() => !saving && onClose()} className="absolute inset-0 bg-ld-on-surface/30 backdrop-blur-[2px]" />
      <div role="dialog" aria-modal="true" aria-labelledby="writer-title" className="relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-ld-surface shadow-xl sm:rounded-3xl">
        <header className="flex items-start justify-between gap-3 border-b border-ld-on-surface/10 px-6 py-4">
          <div>
            <h2 id="writer-title" className="font-display text-ld-title-lg text-ld-on-surface">Write a confession</h2>
            <p className="text-ld-caption text-ld-on-surface-variant">Write it, record it, or both. Then lock it with a password.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-full text-ld-on-surface-variant hover:bg-ld-on-surface/5 disabled:opacity-50">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <label className="block space-y-1.5">
            <span className="text-ld-label-md text-ld-on-surface">Card title, required (shown without unlocking, so keep it non-sensitive)</span>
            <input value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder="Something I never said out loud" className="h-11 w-full rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 text-ld-body-md text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none" />
          </label>

          <label className="block space-y-1.5">
            <span className="flex items-center justify-between text-ld-label-md text-ld-on-surface">
              Your words
              <span className="text-ld-caption tabular-nums text-ld-on-surface-variant">{text.length} / {TEXT_MAX}</span>
            </span>
            <textarea value={text} maxLength={TEXT_MAX} rows={6} onChange={(e) => setText(e.target.value)} placeholder="Write what is on your heart…" className="w-full resize-none rounded-xl border border-ld-outline-variant bg-ld-surface-container-lowest px-4 py-3 font-display text-ld-body-md leading-relaxed text-ld-on-surface placeholder:text-ld-outline focus:border-ld-primary focus:outline-none" />
          </label>

          <div className="space-y-3 rounded-2xl bg-ld-surface-container p-4">
            <p className="text-ld-label-md text-ld-on-surface">Voice note (optional)</p>
            <div className="flex flex-wrap items-center gap-3">
              {!recording ? (
                <button type="button" onClick={startRecording} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-full bg-ld-surface-container-lowest px-4 text-ld-label-sm text-ld-on-surface shadow-sm disabled:opacity-50">
                  <Mic className="size-4 text-ld-primary" aria-hidden="true" />
                  {audio ? "Record again" : "Start recording"}
                </button>
              ) : (
                <button type="button" onClick={stopRecording} className="inline-flex h-10 items-center gap-2 rounded-full bg-ld-error px-4 text-ld-label-sm text-white">
                  <Square className="size-3.5 fill-current" aria-hidden="true" />
                  Stop · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                </button>
              )}
              {audio && !recording && (
                <>
                  <audio controls src={audio.url} className="h-10 max-w-full" />
                  <span className="text-ld-caption tabular-nums text-ld-on-surface-variant">{formatSize(audio.blob.size)}</span>
                  <button type="button" onClick={discardRecording} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-ld-label-sm text-ld-on-surface-variant hover:bg-ld-surface-container-high">
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </>
              )}
            </div>
            <p className="text-ld-caption text-ld-on-surface-variant">Up to ten minutes. The recording is locked with the same password.</p>
            {recordError && <p role="alert" className="text-ld-caption text-ld-error">{recordError}</p>}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-ld-label-md text-ld-on-surface">Who can see it</legend>
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
              {[
                { value: false, label: "Keep it private", hint: "Only you can see it" },
                { value: true, label: `Share with ${partnerName}`, hint: "They can open it with the password" },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  role="radio"
                  aria-checked={shared === option.value}
                  onClick={() => setShared(option.value)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors",
                    shared === option.value ? "border-ld-primary bg-ld-secondary-container/40" : "border-ld-outline-variant hover:bg-ld-surface-container-low"
                  )}
                >
                  <span className="text-ld-label-sm font-semibold text-ld-on-surface">{option.label}</span>
                  <span className="text-[11px] text-ld-on-surface-variant">{option.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-3 rounded-2xl bg-ld-surface-container-low p-4">
            <p className="flex items-center gap-2 text-ld-label-md text-ld-on-surface">
              <Lock className="size-4 text-ld-primary" aria-hidden="true" />
              Lock password
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 6 characters" ariaLabel="Lock password" />
              <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" placeholder="Type it again" ariaLabel="Confirm lock password" />
            </div>
            <p className="text-ld-caption text-ld-on-surface-variant">
              {confirm.length > 0 && password !== confirm
                ? "The two passwords do not match yet."
                : "Keep this password safe. We cannot recover it, and without it the confession cannot be opened."}
            </p>
          </div>

          {error && <p role="alert" className="rounded-xl bg-ld-error-container px-4 py-2 text-ld-caption text-ld-on-error-container">{error}</p>}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ld-on-surface/10 px-6 py-4">
          <span className="hidden text-ld-caption text-ld-on-surface-variant sm:inline">Sealed on this device before it is saved.</span>
          <button type="button" onClick={save} disabled={!canSave} className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-ld-primary px-6 text-ld-label-md text-ld-on-primary shadow-[0_8px_20px_rgba(201,126,139,0.28)] transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-50">
            <Lock className="size-4" aria-hidden="true" />
            {saving ? "Locking…" : "Lock and save"}
          </button>
        </footer>
      </div>
    </div>
  );
}
