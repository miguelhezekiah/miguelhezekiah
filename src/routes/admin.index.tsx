import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uploadAsset } from "@/lib/portfolio";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
});

type Tab = "projects" | "writing" | "experience" | "now" | "timeline";

function AdminPage() {
  const nav = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("projects");

  useEffect(() => {
    let mounted = true;
    const sub = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user?.id ?? null);
      setAuthReady(true);
    });
    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["isAdmin", userId],
    enabled: authReady && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) {
        console.error("admin check failed", error);
        return false;
      }
      return !!data;
    },
  });

  useEffect(() => {
    if (authReady && !userId) nav({ to: "/admin/login" });
  }, [authReady, userId, nav]);

  if (!authReady || (userId && adminLoading)) {
    return <main className="min-h-dvh flex items-center justify-center label label-muted">Loading…</main>;
  }
  if (!userId) {
    return <main className="min-h-dvh flex items-center justify-center label label-muted">Redirecting…</main>;
  }
  if (!isAdmin) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <div className="label label-muted">Not authorized</div>
        <button
          onClick={() => supabase.auth.signOut().then(() => nav({ to: "/admin/login" }))}
          className="label hover:underline"
        >
          Sign out
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-6 py-12 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <div className="label label-muted">Admin</div>
          <h1 className="display text-2xl">Content</h1>
        </div>
        <div className="flex gap-6 label">
          <Link to="/" className="opacity-60 hover:opacity-100">View site</Link>
          <button
            onClick={() => supabase.auth.signOut().then(() => nav({ to: "/admin/login" }))}
            className="opacity-60 hover:opacity-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-6 border-b border-border pb-4 mb-8 label">
        {(["projects", "writing", "experience", "timeline", "now"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "opacity-100 underline underline-offset-4" : "opacity-50 hover:opacity-100"}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "projects" && <ProjectsTab />}
      {tab === "writing" && <WritingTab />}
      {tab === "experience" && <ExperienceTab />}
      {tab === "timeline" && <TimelineTab />}
      {tab === "now" && <NowTab />}
    </main>
  );
}

/* ===================== Generic record editor ===================== */

type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "image" | "list" | "gallery" | "json" | "select";
  options?: string[];
};

function RecordEditor<T extends { id: string; [k: string]: any }>(props: {
  table: string;
  fields: Field[];
  rows: T[];
  defaults: Partial<T>;
  slugKey?: keyof T;
  imageKey?: keyof T;
  queryKey: string;
}) {
  const { table, fields, rows, defaults, slugKey, imageKey, queryKey } = props;
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [busy, setBusy] = useState(false);

  function startNew() {
    setEditing({ ...defaults, sort_order: rows.length + 1 } as Partial<T>);
  }
  async function save() {
    if (!editing) return;
    setBusy(true);
    const row: any = { ...editing };
    for (const f of fields) {
      if (f.type === "json" && typeof row[f.key] === "string") {
        try { row[f.key] = JSON.parse(row[f.key] || "[]"); } catch { row[f.key] = []; }
      }
    }
    if ("metrics" in row && typeof row.metrics === "string") {
      try { row.metrics = JSON.parse(row.metrics); } catch { row.metrics = []; }
    }
    if (row.id) {
      const { id, ...rest } = row;
      const { error } = await supabase.from(table as any).update(rest).eq("id", id);
      if (error) alert(error.message);
    } else {
      const { id: _omit, ...rest } = row;
      const { error } = await supabase.from(table as any).insert(rest);
      if (error) alert(error.message);
    }
    setBusy(false);
    setEditing(null);
    qc.invalidateQueries({ queryKey: [queryKey] });
  }
  async function remove(id: string) {
    if (!confirm("Delete this row?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) alert(error.message);
    qc.invalidateQueries({ queryKey: [queryKey] });
  }
  async function onUpload(file: File) {
    if (!editing || !slugKey) return;
    const slug = String(editing[slugKey] ?? `tmp-${Date.now()}`);
    setBusy(true);
    try {
      const url = await uploadAsset(table, slug, file);
      setEditing({ ...editing, [imageKey ?? "hero_image_url"]: url } as Partial<T>);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="label label-muted">{rows.length} rows</div>
        <button onClick={startNew} className="label border border-border px-3 py-1 hover:bg-card">
          + New
        </button>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-3 gap-4">
            <button
              onClick={() => setEditing(r)}
              className="text-left flex-1 hover:opacity-70"
            >
              <div className="text-sm">{r.title ?? r.role ?? r.kind ?? r.id}</div>
              <div className="label label-muted">
                {r.year ?? r.org ?? r.date ?? ""} {r.category ? `· ${r.category}` : ""}
              </div>
            </button>
            <button onClick={() => remove(r.id)} className="label opacity-50 hover:text-destructive">
              ✕
            </button>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/95 overflow-y-auto" onClick={() => setEditing(null)}>
          <div
            className="max-w-2xl mx-auto my-12 p-8 bg-card border border-border space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="display text-xl">{editing.id ? "Edit" : "New"}</h2>
              <button onClick={() => setEditing(null)} className="label opacity-60 hover:opacity-100">✕</button>
            </div>

            {fields.map((f) => {
              const val = (editing as any)[f.key] ?? "";
              if (f.type === "image") {
                return (
                  <div key={f.key} className="space-y-2">
                    <label className="label label-muted">{f.label}</label>
                    {val && (
                      <img src={val} alt="" className="h-32 w-auto object-cover border border-border" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                      className="text-xs"
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      className="w-full bg-background border border-border px-3 py-2 text-sm"
                      placeholder="or paste URL"
                    />
                  </div>
                );
              }
              if (f.type === "textarea") {
                return (
                  <div key={f.key} className="space-y-2">
                    <label className="label label-muted">{f.label}</label>
                    <textarea
                      value={val}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      rows={4}
                      className="w-full bg-background border border-border px-3 py-2 text-sm"
                    />
                  </div>
                );
              }
              if (f.type === "list") {
                const arr = Array.isArray(val) ? val.join(", ") : val;
                return (
                  <div key={f.key} className="space-y-2">
                    <label className="label label-muted">{f.label} (comma-separated)</label>
                    <input
                      value={arr}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [f.key]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full bg-background border border-border px-3 py-2 text-sm"
                    />
                  </div>
                );
              }
              return (
                <div key={f.key} className="space-y-2">
                  <label className="label label-muted">{f.label}</label>
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    value={val}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className="w-full bg-background border border-border px-3 py-2 text-sm"
                  />
                </div>
              );
            })}

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setEditing(null)} className="label px-3 py-2">Cancel</button>
              <button
                onClick={save}
                disabled={busy}
                className="label bg-foreground text-background px-3 py-2 disabled:opacity-50"
              >
                {busy ? "…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Tabs ===================== */

function useTable<T>(table: string, key: string) {
  return useQuery({
    queryKey: [key],
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

function ProjectsTab() {
  const { data = [] } = useTable<any>("projects", "projects");
  return (
    <RecordEditor
      table="projects"
      queryKey="projects"
      slugKey="slug"
      imageKey="hero_image_url"
      rows={data}
      defaults={{
        slug: "", title: "", year: "", category: "", role: "", location: "",
        summary: "", body: [], tags: [], metrics: [], hero_image_url: null,
        gallery_urls: [], sort_order: 0,
      }}
      fields={[
        { key: "slug", label: "Slug" },
        { key: "title", label: "Title" },
        { key: "year", label: "Year" },
        { key: "category", label: "Category" },
        { key: "role", label: "Role" },
        { key: "location", label: "Location" },
        { key: "summary", label: "Summary", type: "textarea" },
        { key: "body", label: "Body paragraphs", type: "list" },
        { key: "tags", label: "Tags", type: "list" },
        { key: "hero_image_url", label: "Hero image", type: "image" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}

function WritingTab() {
  const { data = [] } = useTable<any>("writing", "writing");
  return (
    <RecordEditor
      table="writing"
      queryKey="writing"
      slugKey="slug"
      rows={data}
      defaults={{ slug:"", title:"", date:"", read_time:"", tag:"", excerpt:"", body:"", sort_order:0 }}
      fields={[
        { key: "slug", label: "Slug" },
        { key: "title", label: "Title" },
        { key: "date", label: "Date" },
        { key: "read_time", label: "Read time" },
        { key: "tag", label: "Tag" },
        { key: "excerpt", label: "Excerpt", type: "textarea" },
        { key: "body", label: "Body", type: "textarea" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}

function ExperienceTab() {
  const { data = [] } = useTable<any>("experience", "experience");
  return (
    <RecordEditor
      table="experience"
      queryKey="experience"
      imageKey="image_url"
      rows={data}
      defaults={{ role:"", org:"", years:"", note:"", image_url:null, sort_order:0 }}
      fields={[
        { key: "role", label: "Role" },
        { key: "org", label: "Org" },
        { key: "years", label: "Years" },
        { key: "note", label: "Note", type: "textarea" },
        { key: "image_url", label: "Image", type: "image" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}

function TimelineTab() {
  const { data = [] } = useTable<any>("timeline_entries", "timeline_entries");
  return (
    <RecordEditor
      table="timeline_entries"
      queryKey="timeline_entries"
      rows={data}
      defaults={{ kind:"project", lane:"academic", label:"", start_year:2024, end_year:null, page_ref:"", sort_order:0 }}
      fields={[
        { key: "kind", label: "Kind (project / skill / lane_label)" },
        { key: "lane", label: "Lane (academic / professional / personal)" },
        { key: "label", label: "Label" },
        { key: "start_year", label: "Start year", type: "number" },
        { key: "end_year", label: "End year (blank = present)", type: "number" },
        { key: "page_ref", label: "Page ref / category" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}

function NowTab() {
  const { data = [] } = useTable<any>("now_items", "now_items");
  return (
    <RecordEditor
      table="now_items"
      queryKey="now_items"
      rows={data}
      defaults={{ kind:"", title:"", author:"", note:"", sort_order:0 }}
      fields={[
        { key: "kind", label: "Kind (reading/building/…)" },
        { key: "title", label: "Title" },
        { key: "author", label: "Author" },
        { key: "note", label: "Note", type: "textarea" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}
