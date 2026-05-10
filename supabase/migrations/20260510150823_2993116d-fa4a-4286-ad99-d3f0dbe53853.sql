
-- Add image_url to experience
ALTER TABLE public.experience ADD COLUMN IF NOT EXISTS image_url text;

-- Timeline entries table
CREATE TABLE IF NOT EXISTS public.timeline_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  lane text,
  label text NOT NULL,
  start_year integer NOT NULL,
  end_year integer,
  page_ref text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read timeline_entries" ON public.timeline_entries FOR SELECT USING (true);
CREATE POLICY "admin write timeline_entries" ON public.timeline_entries FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Seed entries from reference image
INSERT INTO public.timeline_entries (kind, lane, label, start_year, end_year, page_ref, sort_order) VALUES
  ('project', 'academic', '01. House of Slabs', 2022, 2023, 'p.03', 10),
  ('project', 'academic', '02. Sculpted Earth House', 2023, 2024, 'p.07', 20),
  ('project', 'professional', '03. Internship', 2024, 2025, 'p.11', 30),
  ('project', 'professional', '04. Interiors', 2025, 2026, 'p.12', 40),
  ('project', 'personal', '05. Hangar', 2026, 2026, 'p.13', 50),
  ('project', 'personal', '06. Facade Optimization', 2025, 2025, 'p.15', 60),
  ('skill', null, 'AutoCAD', 2021, null, 'BIM', 100),
  ('skill', null, 'Revit', 2022, null, 'BIM', 110),
  ('skill', null, 'Rhino + Grasshopper', 2023, null, 'Parametric', 120),
  ('skill', null, 'Rhino.Inside.Revit', 2023, null, 'Parametric', 130),
  ('skill', null, 'Rendering Softwares', 2025, null, null, 140),
  ('skill', null, 'C# RhinoCommon', 2026, null, 'Computational', 150),
  ('skill', null, 'Python', 2026, null, 'Computational', 160),
  ('lane_label', null, 'Design Systems & Automation', 2027, null, 'Learning in progress', 200),
  ('lane_label', null, 'LoRA + ControlNet', 2027, null, 'Learning in progress', 210);
