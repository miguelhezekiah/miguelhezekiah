import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin" });
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      nav({ to: "/admin" });
    } catch {
      setErr("Invalid email or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-6">
        <div>
          <div className="label label-muted mb-2">Admin</div>
          <h1 className="display text-3xl">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Admin accounts are provisioned by invitation only.
          </p>
        </div>
        <div className="space-y-3">
          <input
            className="w-full bg-card border border-border px-3 py-2 text-sm"
            type="email"
            placeholder="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full bg-card border border-border px-3 py-2 text-sm"
            type="password"
            placeholder="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && <div className="text-xs text-destructive">{err}</div>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-foreground text-background py-2 text-sm disabled:opacity-50"
        >
          {busy ? "…" : "Sign in"}
        </button>
        <div className="flex justify-end text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Back</Link>
        </div>
      </form>
    </main>
  );
}
