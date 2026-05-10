import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Project = {
  id: string;
  slug: string;
  title: string;
  year: string;
  category: string;
  role: string;
  location: string;
  summary: string;
  body: string[];
  tags: string[];
  metrics: Array<[string, string]>;
  hero_image_url: string | null;
  gallery_urls: string[];
  sort_order: number;
};

export type Writing = {
  id: string;
  slug: string;
  title: string;
  date: string;
  read_time: string;
  tag: string;
  excerpt: string;
  body: string | null;
  sort_order: number;
};

export type Experience = {
  id: string;
  role: string;
  org: string;
  years: string;
  note: string;
  image_url: string | null;
  sort_order: number;
};

export type NowItem = {
  id: string;
  kind: string;
  title: string;
  author: string | null;
  note: string;
  sort_order: number;
};

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Project[];
    },
    staleTime: 60_000,
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Project) ?? null;
    },
    staleTime: 60_000,
  });
}

export function useWriting() {
  return useQuery({
    queryKey: ["writing"],
    queryFn: async (): Promise<Writing[]> => {
      const { data, error } = await supabase
        .from("writing")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Writing[];
    },
    staleTime: 60_000,
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["writing", slug],
    queryFn: async (): Promise<Writing | null> => {
      const { data, error } = await supabase
        .from("writing")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Writing) ?? null;
    },
    staleTime: 60_000,
  });
}

export function useExperience() {
  return useQuery({
    queryKey: ["experience"],
    queryFn: async (): Promise<Experience[]> => {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Experience[];
    },
    staleTime: 60_000,
  });
}

export function useNowItems() {
  return useQuery({
    queryKey: ["now_items"],
    queryFn: async (): Promise<NowItem[]> => {
      const { data, error } = await supabase
        .from("now_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as NowItem[];
    },
    staleTime: 60_000,
  });
}

// Deterministic dark gradient placeholder per slug — same dimensions as a
// real hero image, swapped out by editing hero_image_url in the admin page.
export function placeholderFor(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const hue2 = (hue + 40) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1200'>
  <defs>
    <radialGradient id='g' cx='30%' cy='30%' r='90%'>
      <stop offset='0%' stop-color='hsl(${hue} 25% 22%)'/>
      <stop offset='60%' stop-color='hsl(${hue2} 18% 11%)'/>
      <stop offset='100%' stop-color='hsl(${hue2} 10% 6%)'/>
    </radialGradient>
    <filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' seed='${h % 99}'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter>
  </defs>
  <rect width='1920' height='1200' fill='url(#g)'/>
  <rect width='1920' height='1200' filter='url(#n)'/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function heroFor(p: { slug: string; hero_image_url: string | null }) {
  return p.hero_image_url || placeholderFor(p.slug);
}

export async function uploadAsset(table: string, slug: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${table}/${slug}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("portfolio-assets")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
  return data.publicUrl;
}
