ALTER TABLE sessions 
ADD COLUMN grill_types text[] DEFAULT '{}'::text[];

comment on column sessions.grill_types is 'List of grill types used in the session (e.g., Coal, Gas, custom types)';
