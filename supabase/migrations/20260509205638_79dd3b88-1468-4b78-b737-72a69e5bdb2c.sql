
-- 1. admins table
CREATE TABLE public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins readable to admins"
ON public.admins FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 2. is_admin helper
CREATE OR REPLACE FUNCTION public.is_admin(_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = _uid);
$$;

-- 3. now_items table
CREATE TABLE public.now_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  note TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.now_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read now_items"
ON public.now_items FOR SELECT USING (true);

CREATE POLICY "admin write now_items"
ON public.now_items FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.now_items (kind, title, author, note, sort_order) VALUES
('reading','On Growth and Form','D''Arcy Wentworth Thompson','Re-reading. Still finds new things every chapter.',1),
('building','Bone Bridge — phase II',NULL,'Tuning the deck microstructure for vibration. Sample 14 of 22.',2),
('watching','Erosion patterns, North Sea',NULL,'Daily satellite tile, looking for a feature for a coastal pavilion.',3),
('listening','Field recordings — Ravenna mosaics',NULL,'Reverb studies for a sacred-space proposal.',4),
('thinking','Stochastic vs deterministic generation',NULL,'Working through whether the seed should ever be visible to the client.',5);

-- 4. admin write RLS on existing tables
CREATE POLICY "admin write projects" ON public.projects FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin write writing" ON public.writing FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin write experience" ON public.experience FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 5. storage RLS for portfolio-assets
CREATE POLICY "admin upload portfolio-assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio-assets' AND public.is_admin(auth.uid()));

CREATE POLICY "admin update portfolio-assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'portfolio-assets' AND public.is_admin(auth.uid()));

CREATE POLICY "admin delete portfolio-assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'portfolio-assets' AND public.is_admin(auth.uid()));

-- 6. trigger: first signup auto-promoted to admin
CREATE OR REPLACE FUNCTION public.promote_first_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins) THEN
    INSERT INTO public.admins (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_promote
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.promote_first_user();
