"use client";

import { LoadingModal } from "@/components/shared/loading-modal";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Link as LinkIcon, Share2, Users } from "lucide-react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { apiCall } from "@/components/onboarding/api-client";

export interface WorkspaceView {
  id: number;
  name: string;
  members: { userId: string; displayName: string; initial: string }[];
  isFull: boolean;
}

interface InviteView {
  code: string;
  link: string;
  expiresAt: string;
}

const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ld-primary px-5 text-ld-label-md text-ld-on-primary transition-colors hover:bg-ld-on-primary-fixed-variant disabled:opacity-60";
const buttonQuiet =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ld-surface-container px-4 text-ld-label-sm text-ld-on-surface transition-colors hover:bg-ld-surface-container-high disabled:opacity-60";

export function ConnectStep({
  initialWorkspace,
  initialCode,
  mySpaceCode,
}: {
  initialWorkspace: WorkspaceView | null;
  initialCode: string | null;
  mySpaceCode: string;
}) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceView | null>(initialWorkspace);
  const [invite, setInvite] = useState<InviteView | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [joinCode, setJoinCode] = useState(initialCode ?? "");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function createWorkspace() {
    setBusy("create");
    setMessage(null);
    const result = await apiCall<{ workspace: WorkspaceView }>("/api/workspaces", { method: "POST" });
    setBusy(null);
    if (!result.ok) return setMessage({ tone: "error", text: result.error.message });
    setWorkspace(result.data.workspace);
  }

  async function createInvite() {
    setBusy("invite");
    setMessage(null);
    const result = await apiCall<{ invitation: InviteView }>("/api/workspaces/current/invitations", { method: "POST" });
    setBusy(null);
    if (!result.ok) return setMessage({ tone: "error", text: result.error.message });
    setInvite(result.data.invitation);
  }

  async function joinWorkspace() {
    setBusy("join");
    setMessage(null);
    const result = await apiCall<{ workspace: WorkspaceView }>("/api/invitations/accept", {
      method: "POST",
      body: { code: joinCode },
    });
    setBusy(null);
    if (!result.ok) return setMessage({ tone: "error", text: result.error.message });
    router.push("/onboarding/complete");
  }

  async function copy(text: string, what: "code" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      setMessage({ tone: "error", text: "Copying is not available here. Please select the text and copy it." });
    }
  }

  async function share() {
    if (!invite || typeof navigator.share !== "function") return;
    try {
      await navigator.share({ title: "Join my TaleTwo space", text: `Use this code to join me on TaleTwo: ${invite.code}`, url: invite.link });
    } catch {
      // The user closed the share sheet. Nothing to report.
    }
  }

  const expires = invite ? new Date(invite.expiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : null;

  return (
    <div className="space-y-6">
      <LoadingModal open={busy !== null} label="Setting up your workspace" />
      {message && <AuthNotice tone={message.tone}>{message.text}</AuthNotice>}

      {/* Your permanent space code: your partner can enter it any time to join your space */}
      <section aria-labelledby="ob-mycode" className="rounded-2xl bg-ld-surface-container-lowest p-5 space-y-3 ring-1 ring-ld-outline-variant/50">
        <div className="space-y-1">
          <h2 id="ob-mycode" className="font-display text-ld-headline-md text-ld-on-surface">Your space code</h2>
          <p className="text-ld-body-sm text-ld-on-surface-variant">
            Share this 6-character code with your partner. It does not expire. You can change it in Settings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-2xl tracking-[0.25em] text-ld-on-surface" aria-label={`Your space code ${mySpaceCode.split("").join(" ")}`}>
            {mySpaceCode}
          </p>
          <button type="button" className={buttonQuiet} onClick={() => copy(mySpaceCode, "code")}>
            <Copy className="size-4" aria-hidden="true" />
            {copied === "code" ? "Copied" : "Copy code"}
          </button>
        </div>
      </section>

      {/* Option A: create a workspace and invite the partner */}
      <section aria-labelledby="ob-create" className="rounded-2xl bg-ld-surface-container-low p-5 space-y-4">
        <div className="space-y-1">
          <h2 id="ob-create" className="font-display text-ld-headline-md text-ld-on-surface">Start a new space</h2>
          <p className="text-ld-body-sm text-ld-on-surface-variant">
            Create your workspace, then share an invite code with your partner.
          </p>
        </div>

        {!workspace ? (
          <button type="button" onClick={createWorkspace} disabled={busy !== null} className={buttonPrimary}>
            {busy === "create" ? "Creating…" : "Create my workspace"}
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-ld-body-sm text-ld-on-surface">
              Your workspace is <span className="font-semibold">#{workspace.id}</span>.
              {workspace.isFull ? " Both of you are connected." : " Waiting for your partner to join."}
            </p>

            {!workspace.isFull && !invite && (
              <button type="button" onClick={createInvite} disabled={busy !== null} className={buttonQuiet}>
                <LinkIcon className="size-4" aria-hidden="true" />
                {busy === "invite" ? "Creating invite…" : "Create an invite for my partner"}
              </button>
            )}

            {invite && (
              <div className="space-y-3 rounded-xl bg-ld-surface-container-lowest p-4">
                <p className="text-ld-caption text-ld-on-surface-variant">
                  Invite code (valid until {expires}). Share it once; a new code replaces it.
                </p>
                <p className="font-mono text-2xl tracking-[0.2em] text-ld-on-surface" aria-label={`Invite code ${invite.code.split("").join(" ")}`}>
                  {invite.code}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={buttonQuiet} onClick={() => copy(invite.code, "code")}>
                    <Copy className="size-4" aria-hidden="true" />
                    {copied === "code" ? "Copied" : "Copy code"}
                  </button>
                  <button type="button" className={buttonQuiet} onClick={() => copy(invite.link, "link")}>
                    <LinkIcon className="size-4" aria-hidden="true" />
                    {copied === "link" ? "Copied" : "Copy link"}
                  </button>
                  {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                    <button type="button" className={buttonQuiet} onClick={share}>
                      <Share2 className="size-4" aria-hidden="true" />
                      Share
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Option B: join a partner's workspace */}
      <section aria-labelledby="ob-join" className="rounded-2xl bg-ld-surface-container-low p-5 space-y-4">
        <div className="space-y-1">
          <h2 id="ob-join" className="font-display text-ld-headline-md text-ld-on-surface">Join your partner</h2>
          <p className="text-ld-body-sm text-ld-on-surface-variant">Enter your partner&apos;s 6-character space code, or the invite code they shared.</p>
        </div>
        <form
          method="post"
          noValidate
          aria-label="Join with an invite code"
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (joinCode.trim().length < 6) {
              setMessage({ tone: "error", text: "Please enter the full invite code." });
              return;
            }
            joinWorkspace();
          }}
        >
          <label htmlFor="ob-code" className="sr-only">Invite code</label>
          <input
            id="ob-code"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="e.g. 7KQ2MA"
            className="h-12 w-full rounded-xl border border-ld-outline-variant bg-ld-surface px-4 font-mono text-ld-body-md tracking-[0.15em] text-ld-on-surface placeholder:tracking-normal placeholder:text-ld-outline focus:border-ld-primary focus:outline-none focus:ring-2 focus:ring-ld-primary/25"
          />
          <button type="submit" disabled={busy !== null} className={buttonPrimary}>
            <Users className="size-4" aria-hidden="true" />
            {busy === "join" ? "Joining…" : "Join"}
          </button>
        </form>
      </section>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => router.push("/onboarding/profile")} className="text-ld-label-md text-ld-on-surface-variant hover:text-ld-on-surface">
          Back
        </button>
        <button
          type="button"
          disabled={!workspace || busy !== null}
          onClick={() => router.push("/onboarding/complete")}
          className={buttonPrimary}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
