ALTER TABLE public.fornecedores ADD COLUMN IF NOT EXISTS codigo_fornecedor text;
CREATE SEQUENCE IF NOT EXISTS public.fornecedores_codigo_seq;
WITH lojas AS (
  SELECT lower(trim(nome_loja)) k, min(id) mid FROM public.fornecedores WHERE nome_loja IS NOT NULL GROUP BY 1
), numeradas AS (
  SELECT k, row_number() OVER (ORDER BY mid) n FROM lojas
)
UPDATE public.fornecedores f SET codigo_fornecedor = 'F' || lpad(n::text, 3, '0')
FROM numeradas WHERE lower(trim(f.nome_loja)) = numeradas.k AND f.codigo_fornecedor IS NULL;
SELECT setval('public.fornecedores_codigo_seq', GREATEST((SELECT count(DISTINCT lower(trim(nome_loja))) FROM public.fornecedores WHERE nome_loja IS NOT NULL), 1));
CREATE INDEX IF NOT EXISTS fornecedores_codigo_idx ON public.fornecedores (codigo_fornecedor);

CREATE OR REPLACE FUNCTION public.set_codigo_fornecedor()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v text;
BEGIN
  IF NEW.codigo_fornecedor IS NULL OR NEW.codigo_fornecedor = '' THEN
    IF NEW.nome_loja IS NOT NULL THEN
      SELECT codigo_fornecedor INTO v FROM public.fornecedores
      WHERE lower(trim(nome_loja)) = lower(trim(NEW.nome_loja)) AND codigo_fornecedor IS NOT NULL LIMIT 1;
    END IF;
    NEW.codigo_fornecedor := COALESCE(v, 'F' || lpad(nextval('public.fornecedores_codigo_seq')::text, 3, '0'));
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_codigo_fornecedor() FROM public, anon, authenticated;
DROP TRIGGER IF EXISTS trg_set_codigo_fornecedor ON public.fornecedores;
CREATE TRIGGER trg_set_codigo_fornecedor BEFORE INSERT ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION public.set_codigo_fornecedor();