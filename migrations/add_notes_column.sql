ALTER TABLE sessions 
ADD COLUMN notes text;

comment on column sessions.notes is 'User notes for the BBQ session';
