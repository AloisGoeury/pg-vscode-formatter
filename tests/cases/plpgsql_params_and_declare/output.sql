CREATE OR REPLACE FUNCTION demo(pId int, name text)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  total int;
BEGIN
  PERFORM 1;
  RETURN 1;
END
$$;
