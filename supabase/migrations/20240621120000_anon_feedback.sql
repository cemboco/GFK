create table anon_feedback (
  id bigserial primary key,
  feedback text not null,
  created_at timestamp with time zone default timezone('utc', now())
); 