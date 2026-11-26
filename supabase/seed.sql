-- Local-only demo data. All accounts use the password "password123".
-- Applied by `supabase db reset` and the first `supabase start`.

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'admin@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"email":"admin@example.com","email_verified":true,"phone_verified":false,"sub":"11111111-1111-4111-8111-111111111111"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'student@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"email":"student@example.com","email_verified":true,"phone_verified":false,"sub":"22222222-2222-4222-8222-222222222222"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'student2@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"email":"student2@example.com","email_verified":true,"phone_verified":false,"sub":"33333333-3333-4333-8333-333333333333"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    'dddddddd-1111-4111-8111-ddddddddddd1',
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    '{"sub":"11111111-1111-4111-8111-111111111111","email":"admin@example.com","email_verified":true,"phone_verified":false}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    'dddddddd-2222-4222-8222-ddddddddddd2',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    '{"sub":"22222222-2222-4222-8222-222222222222","email":"student@example.com","email_verified":true,"phone_verified":false}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    'dddddddd-3333-4333-8333-ddddddddddd3',
    '33333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    '{"sub":"33333333-3333-4333-8333-333333333333","email":"student2@example.com","email_verified":true,"phone_verified":false}'::jsonb,
    'email',
    now(),
    now(),
    now()
  )
on conflict (id) do nothing;

update public.profiles
set role = 'admin'
where id = '11111111-1111-4111-8111-111111111111';

insert into public.consultations (
  id,
  student_id,
  first_name,
  last_name,
  reason,
  scheduled_at,
  completed,
  status
)
values
  (
    'aaaaaaaa-1111-4111-8111-aaaaaaaaaaa1',
    '22222222-2222-4222-8222-222222222222',
    'Alex',
    'Student',
    'Discuss a mathematics study plan for the next term.',
    now() + interval '2 days',
    false,
    'scheduled'
  ),
  (
    'aaaaaaaa-2222-4222-8222-aaaaaaaaaaa2',
    '22222222-2222-4222-8222-222222222222',
    'Alex',
    'Student',
    'Review the recent physics assessment and next steps.',
    now() + interval '5 days',
    false,
    'scheduled'
  ),
  (
    'aaaaaaaa-3333-4333-8333-aaaaaaaaaaa3',
    '22222222-2222-4222-8222-222222222222',
    'Alex',
    'Student',
    'Career planning follow-up from the previous session.',
    now() - interval '3 days',
    true,
    'scheduled'
  ),
  (
    'aaaaaaaa-4444-4444-8444-aaaaaaaaaaa4',
    '22222222-2222-4222-8222-222222222222',
    'Alex',
    'Student',
    'Practice consultation cancelled by the student.',
    now() + interval '7 days',
    false,
    'cancelled'
  ),
  (
    'bbbbbbbb-1111-4111-8111-bbbbbbbbbbb1',
    '33333333-3333-4333-8333-333333333333',
    'Jamie',
    'Student',
    'University application guidance.',
    now() + interval '3 days',
    false,
    'scheduled'
  )
on conflict (id) do nothing;
