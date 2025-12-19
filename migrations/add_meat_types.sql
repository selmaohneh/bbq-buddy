ALTER TABLE sessions 
ADD COLUMN meat_types text[] DEFAULT '{}'::text[];

comment on column sessions.meat_types is 'List of meat types used in the session (e.g., Beef, Pork, Chicken, custom types)';
