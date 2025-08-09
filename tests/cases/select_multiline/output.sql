SELECT
    id
    , name
    , created_at
    , updated_at
    , jsonb_build_object('a', 1, 'b', 2) AS meta
FROM public.users u
-- break
