-- =====================================================================
-- 04_storage_e_admin.sql — Storage bucket + Promoção de admin
-- Rode após 03_seed.
-- =====================================================================

-- Bucket público para imagens de produtos/categorias/loja
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas: leitura pública, upload/update/delete só para admin
DROP POLICY IF EXISTS "produtos_public_read" ON storage.objects;
CREATE POLICY "produtos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'produtos');

DROP POLICY IF EXISTS "produtos_admin_insert" ON storage.objects;
CREATE POLICY "produtos_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'produtos' AND public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "produtos_admin_update" ON storage.objects;
CREATE POLICY "produtos_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'produtos' AND public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "produtos_admin_delete" ON storage.objects;
CREATE POLICY "produtos_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'produtos' AND public.has_role(auth.uid(),'admin'));

-- =====================================================================
-- COMO PROMOVER UM USUÁRIO A ADMIN
-- =====================================================================
-- 1) Crie sua conta normalmente pelo site (/index.html)
-- 2) No SQL Editor do Supabase, descubra seu user_id:
--      SELECT id, email FROM auth.users WHERE email = 'SEU_EMAIL@AQUI.com';
-- 3) Insira a role admin (substitua o UUID):
--
--      INSERT INTO user_roles (user_id, role) VALUES
--        ('00000000-0000-0000-0000-000000000000', 'admin')
--      ON CONFLICT DO NOTHING;
--
-- 4) Pronto. Agora /admin.html vai liberar acesso para esse usuário.
-- =====================================================================

-- Bairros de exemplo (edite/remova como quiser)
INSERT INTO delivery_zones (bairro, taxa) VALUES
  ('Centro', 5.00),
  ('Copacabana', 8.00),
  ('Ipanema', 10.00),
  ('Tijuca', 7.00),
  ('Botafogo', 8.00),
  ('Barra da Tijuca', 15.00)
ON CONFLICT (bairro) DO NOTHING;
