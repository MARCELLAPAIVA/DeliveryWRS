-- ============================================
-- SEED DATA - Products imported from PDF
-- ============================================

-- Category: AGUA
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'AGUA', '💧', 10, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('AGUA C/ GAS 510ML', 3.00),
  ('AGUA C/GAS 1,5', 6.00),
  ('AGUA DE COCO NOSSO COCO 1L', 8.00),
  ('AGUA S/ GAS 1,5', 4.00),
  ('AGUA S/ GAS 510ML', 2.00),
  ('AGUA TONICA', 6.00),
  ('MALA AGUA C/ GAS 510ML', 18.00),
  ('MALA AGUA S/ GAS 1,5', 15.00),
  ('MALA AGUA S/ GAS 510 ML', 13.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'AGUA';

-- Category: BALAS
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'BALAS', '🍬', 20, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('CHICLETE MENTOS', 3.00),
  ('HALLS', 3.00),
  ('PIRULITO', 0.50),
  ('TRIDENT', 3.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'BALAS';

-- Category: BISCOITO
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'BISCOITO', '🍪', 30, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('AMENDOIN', 1.50),
  ('FOFURA SABORES', 3.00),
  ('TORCIDA SABORES', 3.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'BISCOITO';

-- Category: CACHAÇA
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'CACHAÇA', '🥃', 40, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('51 CACHAÇA', 15.00),
  ('88 CACHAÇA', 25.00),
  ('CABRA MACHO', 12.00),
  ('CANINHA DA ROÇA', 5.00),
  ('DOMECQ', 40.00),
  ('DREHER', 23.00),
  ('MEL ZANGÃO', 12.00),
  ('MENTA', 15.00),
  ('VELHO BARREIRO', 12.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'CACHAÇA';

-- Category: CARVÃO CHURRASCO
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'CARVÃO CHURRASCO', '🔥', 50, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('CARVÃO 3K', 15.00),
  ('CARVAO 5KG', 25.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'CARVÃO CHURRASCO';

-- Category: CERVEJA
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'CERVEJA', '🍺', 60, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('AMSTEL LATÃO', 6.00),
  ('ANTARTICA LATÃO', 6.00),
  ('BRAHMA DUPLO MALTE', 5.50),
  ('BRAHMA LATÃO', 6.00),
  ('BRAHMA ZERO', 5.00),
  ('BUDWISER LATAO', 7.00),
  ('BUDWISER LONG', 7.00),
  ('CORONA LATÃO', 10.00),
  ('CORONA LONG', 8.00),
  ('CRACUDINHA ANTARTICA', 3.50),
  ('CRACUDINHA BRAHMA', 4.00),
  ('EISENBAHN', 6.00),
  ('HEINEKEN LATÃO', 7.00),
  ('HEINEKEN LONG', 8.00),
  ('HEINEKEN LONG ZERO', 8.00),
  ('IMPERIO GOLD', 5.50),
  ('IMPERIO LAGER VERDE', 6.00),
  ('IMPERIO LATÃO', 6.00),
  ('IMPERIO ULTRA 210ML', 5.50),
  ('ITAIPAVA LATÃO', 5.00),
  ('SPATAN LONG', 8.00),
  ('SPTAN LATÃO', 7.00),
  ('STELLA ARTOIS LONG', 8.00),
  ('STELLA PURO GOLD LONG', 8.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'CERVEJA';

-- Category: CHAMPANHE
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'CHAMPANHE', '🍾', 70, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('CASA PERINE', 50.00),
  ('CHANDON', 120.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'CHAMPANHE';

-- Category: CIGARRO
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'CIGARRO', '🚬', 80, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('BLACK CARTÃO / PIX', 22.50),
  ('BLACK DINHEIRO', 20.00),
  ('CAMEL CARTÃO /PIX', 14.50),
  ('CAMEL DINHEIRO', 14.00),
  ('CARLTON CARTÃO/PIX', 16.50),
  ('CARLTON DINHEIRO', 16.00),
  ('LUCKY STRIK CARTÃO/PIX', 14.50),
  ('LUCKY STRIK DINHEIRO', 14.00),
  ('MINISTER CARTÃO/PIX', 11.50),
  ('MINISTER DINHEIRO', 11.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'CIGARRO';

-- Category: COMBOS
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'COMBOS', '🎁', 90, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('COMBO ROCKS+SACO GELO+BALLY', 65.00),
  ('COMBO BALANTINES 10 + 5REDBUL +SACO DE GELO', 200.00),
  ('COMBO BALLA ABACAXI+10 PICOLE+1 BALY+2 COPOS', 100.00),
  ('COMBO BALLANTINES 08 ANOS + 5 RED BULL + SACO GELO', 200.00),
  ('COMBO BEEFEANTER PINK + 5 RED + SACO GELO', 165.00),
  ('COMBO BEEFEATER LONDON + 5 RED BULL + SACO GELO', 150.00),
  ('COMBO BLACK LABEL + 5 RED BULL + SACO GELO', 240.00),
  ('COMBO BUCHANA´S + 5 RED BULL + SACO GELO', 240.00),
  ('COMBO CAVALO BRANCO + 5 RED BULL + SACO GELO', 140.00),
  ('COMBO CHIVAS + 5 RED BULL + SACO GELO', 175.00),
  ('COMBO GIN ROCKS + GELO SACO + BALLY ENTREGAS', 60.00),
  ('COMBO GOLD LABEL + 5 RED BULL + SACO GELO', 350.00),
  ('COMBO JACK FIRE + 5 RED BULL + SACO GELO', 190.00),
  ('COMBO JACK HONEY + 5 RED BULL + SACO GELO', 200.00),
  ('COMBO JACK MAÇA + 5 RED BULL + SACO GELO', 205.00),
  ('COMBO JACK O7 + 5 RED BULL + SACO GELO', 200.00),
  ('COMBO KOVAK + BALY + SACO GELO', 50.00),
  ('COMBO QN + BALY + 4 GELO PICOLE', 40.00),
  ('COMBO QN + BALY + SACO GELO', 48.00),
  ('COMBO RED LABEL + 5 RED BULL + SACO GELO', 150.00),
  ('COMBO REDLABEL PROMOÇÃO 10GELO/10REDBULL', 175.00),
  ('COMBO ROYAL+ 4 GELO PICOLE + ENERGETICO 2L', 40.00),
  ('COMBO ROYAL+BALY+SACO GELO', 48.00),
  ('COMBO SMIRNOFF + BALY + SACO GELO', 70.00),
  ('LEONOFF+ 4 GELO PICOLÉ+ BALLY', 38.00),
  ('OLD PAR + 5 REDBULL + GELO SACO', 230.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'COMBOS';

-- Category: COPÃO
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'COPÃO', '🥤', 100, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('COPÃO CAVALO BRANCO / MSX', 15.00),
  ('COPÃO QN SABORES / BALY', 10.00),
  ('COPÃO RED LABEL / MSX', 15.00),
  ('COPÃO RED LABEL C/ RED BULL', 25.00),
  ('COPÃO ROYAL SABORES', 10.00),
  ('COPÃO VODKA', 10.00),
  ('COPO DE VIDRO', 5.00),
  ('COPO VAREJO', 1.00),
  ('DOSE', 5.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'COPÃO';

-- Category: ENERGETICO
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'ENERGETICO', '⚡', 110, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('BALY 2L SABORES', 15.00),
  ('ENERGETICO FLYING HORSE', 5.00),
  ('MALA RED BULL C/24', 175.00),
  ('MALA ST PIERRE', 135.00),
  ('MALA VRAUU C/24', 120.00),
  ('MINOTAURO 2L', 12.00),
  ('MONSTER LATA', 10.00),
  ('MSX', 15.00),
  ('QN AÇAI C/ GUARANA', 12.00),
  ('RED BULL SABORES', 9.00),
  ('RED BULL TRADICIONAL', 9.00),
  ('ST PIERRE', 6.00),
  ('ST PIERRE VIDRO', 8.00),
  ('VRAUU SABORES', 5.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'ENERGETICO';

-- Category: FOGOS
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'FOGOS', '🎆', 120, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('FOGOS 12X1', 35.00),
  ('FOGOS CAIXA AZUL', 50.00),
  ('FOGOS CAIXA PRETA', 50.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'FOGOS';

-- Category: GELO
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'GELO', '🧊', 130, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('BALDE DE GELO ESCAMA', 5.00),
  ('GELO ESCAMA 1/5 SACO', 10.00),
  ('GELO ESCAMA 20KG', 30.00),
  ('GELO FILTRADO 10KG', 15.00),
  ('GELO FILTRADO 2KG', 7.00),
  ('GELO PICOLE SABORES', 4.00),
  ('GELO SACO SABORES', 14.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'GELO';

-- Category: GIN
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'GIN', '🍸', 140, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('BEEFEATER LONDON BRANCO', 95.00),
  ('BEEFEATER PINK', 110.00),
  ('BOMBAY', 95.00),
  ('GIN ROCKS SABORES', 35.00),
  ('GORDONS BRANCO', 78.00),
  ('GORDONS LIMÃO', 85.00),
  ('GORDONS PINK', 85.00),
  ('LARIOS BRANCO', 65.00),
  ('LARIOS PINK', 80.00),
  ('QN SABORES', 24.00),
  ('TANQUERAY BOSSA NOVA', 120.00),
  ('TANQUERAY ROYALLE', 120.00),
  ('TANQUERAY SEVILLA', 120.00),
  ('TANQUERAY TRADICIONAL', 110.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'GIN';

-- Category: LICOR
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'LICOR', '🍹', 150, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('AMARULA', 120.00),
  ('AMARULA GELADA', 125.00),
  ('APEROL', 50.00),
  ('BALLENA SABORES', 140.00),
  ('BANANINHA', 25.00),
  ('BANANINHA CARIOCA AMARELA', 80.00),
  ('BANANINHA GELADA', 27.00),
  ('CAMPARI', 60.00),
  ('DON LUIZ', 80.00),
  ('DON LUIZ GELADO', 87.00),
  ('LICOR 43 SABORES', 160.00),
  ('LICOR QN PITACHE, MARACUJA', 65.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'LICOR';

-- Category: REFRIGERANTE
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'REFRIGERANTE', '🥤', 160, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('COCA 2L', 11.00),
  ('COCA LATA', 6.00),
  ('COCA RETORNAVEL', 8.00),
  ('COCA ZERO 2L', 11.00),
  ('COCA ZERO LATA', 6.00),
  ('CONVENÇÃO SABORES 2L', 6.00),
  ('FANTA UVA / LARANJA 2L', 10.00),
  ('GUARANA ANTARTICA 1L', 6.00),
  ('GUARANA ANTARTICA 2L', 10.00),
  ('GUARANA ANTARTICA LATA', 6.00),
  ('GUARANA ANTARTICA ZERO 2L', 10.00),
  ('H2O / LIMONETO', 7.00),
  ('H2O DE 1,5', 10.00),
  ('PEPSI 2L', 9.00),
  ('SCHWEPTES LATA', 6.00),
  ('SPRITE 2L', 10.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'REFRIGERANTE';

-- Category: SORVETES
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'SORVETES', '🍦', 170, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('CHAMBINHO NESTLE', 7.90),
  ('GAROTO BATON AO LEITE', 5.90),
  ('PICOLE FINI DENTADURA', 7.90),
  ('PICOLE FINI TUBES MORANGO', 5.90),
  ('PICOLE GAROTO BOMBOM', 9.90),
  ('PICOLE GAROTO CARIBE', 9.90),
  ('PICOLE GAROTO SKIMO', 7.50),
  ('PICOLE KITKAT GOLD', 8.90),
  ('PICOLE MOÇA BRIGADEIRO', 9.90),
  ('SORVETE NESTLE POTE 1,5L FLOCOS E NAPOLITANO', 25.90)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'SORVETES';

-- Category: SUCOS
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'SUCOS', '🧃', 180, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('DEL VALLE 1,5', 7.00),
  ('GATORADE', 7.00),
  ('GUARACAMP', 2.00),
  ('MATTE LEAO NATURAL 1.5', 10.00),
  ('SUCO DA FRUTA SABORES 1L', 7.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'SUCOS';

-- Category: TABACARIA
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'TABACARIA', '💨', 190, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('ABAFADOR GRANDE', 35.00),
  ('ALUGUEL NARGUILE', 40.00),
  ('BORRACHA DA ROCHA, MANGUEIRA E VASO', 5.00),
  ('CHARUTO', 20.00),
  ('CINZEIRO', 12.00),
  ('CONTROLADOR DE CARVÃO', 35.00),
  ('CUIA DE SILICONE', 15.00),
  ('DESFAZEDOR ACRILICO', 10.00),
  ('DESFAZEDOR MARROM', 5.00),
  ('ESSENCIA BABOS LOVE 66', 15.00),
  ('ESSENCIA ZIGGY, ONIX', 15.00),
  ('ESSENCIA ZOMO, NAY, FUSION', 12.00),
  ('FLUIDO LATA MAÇARICO', 25.00),
  ('GARFINHO E FURADOR', 12.00),
  ('GAS DE MAÇARICO PEQUENO', 12.00),
  ('ISQUEIRO BIC PEQUENO', 6.00),
  ('ISQUEIRO LIGHTER', 4.00),
  ('MAÇARICO', 15.00),
  ('MAGUEIRA CONDUITE', 12.00),
  ('MANGUEIRA DE NARGUILE COMPLETO', 15.00),
  ('NARGUILE COMPLETO', 120.00),
  ('PANELINHA MEDIA 110V', 50.00),
  ('PANELINHA PEQUENA 110V', 35.00),
  ('PEGADOR DE CARVÃO', 15.00),
  ('PITEIRA DE NARGUILE', 15.00),
  ('PITEIRA DE PAPEL', 5.00),
  ('RECARGA ALUGUEL NARGUILE', 20.00),
  ('ROCH NARGUILE', 30.00),
  ('SEDA BLUNT PACOTE', 14.00),
  ('SEDA PACOTE', 4.00),
  ('STEM NARGUILE', 25.00),
  ('TABACO AMSTERDAM 25G', 23.00),
  ('TABACO POPPY', 20.00),
  ('TABACO SESH', 15.00),
  ('VASO NARGUILE', 40.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'TABACARIA';

-- Category: TEQUILAS
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'TEQUILAS', '🌵', 200, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('TEQUILA CUERVO OURO', 130.00),
  ('TEQUILA CUERVO OURO GELADA', 133.00),
  ('TEQUILA FUEGO LOUCO', 45.00),
  ('TEQUILERO MORANGO 750ML', 65.00),
  ('TEQUILERO MORANGO GELADA', 67.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'TEQUILAS';

-- Category: VINHO
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'VINHO', '🍷', 210, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('DU GOMES', 7.00),
  ('GALIOTO', 25.00),
  ('GALIOTO GELADO', 27.00),
  ('JURUPINGA', 35.00),
  ('JURUPINGA GELADA', 38.00),
  ('NOSSO CHOOP', 22.00),
  ('NOSSO CHOOP 1,5L', 20.00),
  ('PERGOLA', 25.00),
  ('PERGOLA GELADO', 27.00),
  ('PINK MOON ROSE', 22.00),
  ('PINKMOON 2L', 25.00),
  ('PINKMOON 300ML', 6.00),
  ('PINKMOON 600ML', 10.00),
  ('VANISUL 2L', 22.00),
  ('vanisul vidro', 20.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'VINHO';

-- Category: VODKA
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'VODKA', '🍸', 220, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('GT LATA / SKOL BEATS LATA', 7.00),
  ('GT LONG AZUL', 8.00),
  ('ICE 51 SABORES', 7.00),
  ('ICE SMIRNOFF LATA', 6.00),
  ('ICE WE MIX', 6.00),
  ('KOVAK', 30.00),
  ('KOVAK MAÇA', 30.00),
  ('LEONOFF', 15.00),
  ('MALA GT LONG AZUL', 160.00),
  ('MALA SKOL BEATS LONG', 165.00),
  ('SKOL BEATS LONG', 8.00),
  ('SKY', 35.00),
  ('SMIRNOFF', 40.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'VODKA';

-- Category: WHISKY
INSERT INTO public.categories (id, name, icon, sort_order, active) VALUES
  (uuid_generate_v4(), 'WHISKY', '🥃', 230, true);

INSERT INTO public.products (category_id, name, price, active) 
SELECT c.id, v.name, v.price, true
FROM (VALUES
  ('BALLANTAINES 10 ANOS 1L', 120.00),
  ('BALLANTAINES CARAMELO', 65.00),
  ('BALLANTINES 1L', 80.00),
  ('BALLANTINES SUNSHINR ABACAXI', 65.00),
  ('BLACK LABEL 1L', 185.00),
  ('BUCHANAN´S', 185.00),
  ('CAVALO BRANCO 1L', 85.00),
  ('CHIVAS 1L', 135.00),
  ('DOUBLE BLACK 1L', 235.00),
  ('GOLD LABEL', 255.00),
  ('JACK DANIEL´S 07 PRETO 1L', 145.00),
  ('JACK DANIEL´S FIRE VERMELHO 1L', 145.00),
  ('JACK DANIEL´S HONEY MEL 1L', 145.00),
  ('JACK DANIEL´S MAÇA VERDE 1L', 150.00),
  ('JAMESON 1L', 85.00),
  ('JOHNIE WALKER', 85.00),
  ('OLD PAR 1L', 155.00),
  ('RED LABEL 1L', 95.00),
  ('ROYAL SABORES', 30.00),
  ('ROYAL SALUTE AZUL', 850.00),
  ('ROYAL SALUTE BRANCO', 950.00)
) AS v(name, price)
CROSS JOIN public.categories c WHERE c.name = 'WHISKY';

-- ============================================
-- Default delivery zones
-- ============================================

INSERT INTO public.delivery_zones (neighborhood, fee, active) VALUES
  ('Centro', 3.00, true),
  ('Zona Norte', 5.00, true),
  ('Zona Sul', 6.00, true),
  ('Zona Oeste', 7.00, true),
  ('Zona Leste', 5.00, true),
  ('Bairro 1', 4.00, true),
  ('Bairro 2', 4.00, true),
  ('Bairro 3', 5.00, true),
  ('Bairro 4', 6.00, true),
  ('Bairro 5', 8.00, true);
