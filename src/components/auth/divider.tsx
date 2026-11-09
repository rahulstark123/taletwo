/** "or" separator between the form and social sign-in. */
export function Divider() {
  return (
    <div className="flex items-center gap-3 text-ld-caption uppercase tracking-wider text-ld-outline" role="separator">
      <span className="h-px flex-1 bg-ld-outline-variant/60" />
      or
      <span className="h-px flex-1 bg-ld-outline-variant/60" />
    </div>
  );
}
