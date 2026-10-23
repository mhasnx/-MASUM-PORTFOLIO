insert into public.profiles (
  id,
  slug,
  name,
  professional_title,
  headline,
  subtitle,
  introduction,
  biography,
  professional_interests,
  working_approach,
  social_links,
  phone,
  email,
  location,
  courses,
  is_available,
  is_published
)
values (
  'a78b715a-0934-4a50-8b44-11b3e721ae88',
  'mahmudul-hassan-masum',
  'MD. Mahmudul Hassan',
  'Junior Software Developer / Web Developer',
  'Software, web development, and practical IT.',
  'IT & Networking | Final-year CSE Student',
  'I am a final-year Computer Science and Engineering student interested in software and web development, programming, computer networking, and practical IT solutions. I bring a multidisciplinary academic background and tutoring experience, and am seeking an entry-level opportunity in software or web development, IT support, or network engineering.',
  'My interests include building software and websites, solving practical problems, and learning more about IT and computer networking. Alongside my studies, I tutor secondary-school students and value clear communication, careful preparation, and continuous learning.',
  array[
    'Software and web development',
    'Programming and problem-solving',
    'Computer networking fundamentals',
    'Practical IT solutions'
  ],
  array[
    'Approach technical problems carefully and practically.',
    'Communicate ideas clearly and keep learning.',
    'Adapt explanations to support different learners.'
  ],
  '[
    {"label":"LinkedIn","url":"https://www.linkedin.com/in/mhmasum-ptec02"},
    {"label":"GitHub","url":"https://github.com/mhasnx"}
  ]'::jsonb,
  '01747493376',
  'mahmudulhm73@gmail.com',
  'Uttara, Dhaka, Bangladesh',
  array[
    'Data Structures and Algorithms',
    'Object-Oriented Programming',
    'Database Management Systems',
    'Computer Networking',
    'Software Engineering',
    'Web Development',
    'Artificial Intelligence and Machine Learning fundamentals'
  ],
  false,
  true
)
on conflict do nothing;

insert into public.site_settings (
  id,
  site_title,
  default_description,
  is_published
)
values (
  1,
  'MD. Mahmudul Hassan | Software & Web Developer',
  'Junior software and web developer focused on programming, computer networking, and practical IT solutions.',
  true
)
on conflict do nothing;

with education_seed (
  institution,
  qualification,
  field_of_study,
  description,
  display_order
)
as (
  values
    (
      'Uttara University',
      'BSc',
      'Computer Science and Engineering',
      'Final-year student. Expected completion in 2026; official completion date pending confirmation.',
      1
    ),
    (
      'Islamic Arabic University (IAU), Bangladesh',
      'Fazil (Pass)',
      null,
      'Expected completion in 2026. Affiliated institute, official program details, and completion date require confirmation.',
      2
    ),
    (
      'Kurigram Government College',
      'Higher Secondary Certificate (HSC)',
      null,
      'Completed in 2021 · GPA 5.00',
      3
    ),
    (
      'Kamal Khamer Madrasah',
      'Dakhil (SSC equivalent)',
      null,
      'Completed in 2019 · GPA 5.00',
      4
    )
)
insert into public.education (
  institution,
  qualification,
  field_of_study,
  description,
  is_published,
  display_order
)
select
  education_seed.institution,
  education_seed.qualification,
  education_seed.field_of_study,
  education_seed.description,
  true,
  education_seed.display_order
from education_seed
where not exists (
  select 1
  from public.education existing
  where existing.institution = education_seed.institution
    and existing.qualification = education_seed.qualification
);

insert into public.skill_categories (name, slug, display_order)
values
  ('Data & Digital Practice', 'data-administration', 1),
  ('Digital Marketing & Analytics', 'digital-marketing-analytics', 2),
  ('Programming Languages', 'programming-computer-science', 3),
  ('Frontend Development', 'frontend-development', 4),
  ('Backend Development', 'backend-development', 5),
  ('Databases & Computer Science', 'databases-computer-science', 6),
  ('Tools & Platforms', 'tools-platforms', 7),
  ('IT & Networking', 'it-networking', 8),
  ('Languages', 'languages', 9)
on conflict do nothing;

insert into public.skills (category_id, name, display_order, is_published)
select category.id, skill.name, skill.display_order, true
from (
  values
    ('programming-computer-science', 'C', 1),
    ('programming-computer-science', 'C++', 2),
    ('programming-computer-science', 'C#', 3),
    ('programming-computer-science', 'Python', 4),
    ('programming-computer-science', 'JavaScript', 5),
    ('frontend-development', 'HTML', 1),
    ('frontend-development', 'CSS', 2),
    ('frontend-development', 'JavaScript', 3),
    ('frontend-development', 'React', 4),
    ('backend-development', 'PHP', 1),
    ('databases-computer-science', 'Database Management Systems', 1),
    ('databases-computer-science', 'Data Structures and Algorithms', 2),
    ('databases-computer-science', 'Object-Oriented Programming', 3),
    ('databases-computer-science', 'Software Engineering', 4),
    ('databases-computer-science', 'Artificial Intelligence and Machine Learning fundamentals', 5),
    ('tools-platforms', 'Git/GitHub', 1),
    ('tools-platforms', 'Microsoft Office', 2),
    ('tools-platforms', 'Figma', 3),
    ('it-networking', 'Computer networking fundamentals', 1),
    ('data-administration', 'Data Management', 1),
    ('data-administration', 'Excel', 2),
    ('data-administration', 'SEO', 3),
    ('data-administration', 'Web Analytics', 4),
    ('languages', 'Bangla — Native', 1),
    ('languages', 'English — Fluent', 2),
    ('languages', 'Arabic — Reading and writing', 3)
) as skill(category_slug, name, display_order)
join public.skill_categories as category
  on category.slug = skill.category_slug
on conflict do nothing;

insert into public.research_publications (
  id,
  title,
  description,
  authors,
  venue,
  publication_year,
  doi,
  source_url,
  display_order,
  is_published
)
values (
  'b468f8a4-7ea2-4059-a4b5-2f7e2a027184',
  'Reinforcement Learning for Optimizing Bowling Strategies in One Day Internationals',
  'IEEE 28th International Conference on Computer and Information Technology (ICCIT), 2025.',
  array[
    'Hasibul Hasan Rupok',
    'Md. Safiqul Islam Saikat',
    'Md Shafikul Islam',
    'Md. Riad Hasan',
    'Lutfun Nahar Barsha',
    'Md. Mahmudul Hassan',
    'Nishat Tamanna',
    'Md. Tanzimul Ahsan',
    'Oakimul Sami',
    'Zaki Asif'
  ],
  '2025 28th International Conference on Computer and Information Technology (ICCIT)',
  2025,
  '10.1109/iccit68739.2025.11490554',
  'https://ieeexplore.ieee.org/document/11490554',
  1,
  true
)
on conflict do nothing;

insert into public.experiences (
  id,
  role,
  organization,
  kind,
  description,
  period_label,
  display_order,
  is_published
)
values
  (
    '3ea1d840-c41e-4d9b-a5d5-ff88388e23e4',
    'Private Tutor — Classes 8–10',
    null,
    'teaching',
    'Teach Physics, Chemistry, Mathematics, Biology, and Computer Science. Prepare tailored lessons, explain difficult concepts, track progress, support exam preparation, and adapt to student needs.',
    '2023–Present',
    1,
    true
  ),
  (
    '929f5a85-b510-4070-9b59-47dcad3bc559',
    'Private Tutor — HSC level',
    null,
    'teaching',
    'Teach ICT and core science subjects, with a focus on concept clarification, problem-solving, and exam preparation.',
    '2024–Present',
    2,
    true
  ),
  (
    '20c73195-2ee4-4e90-89a1-0c762e692c60',
    'Cyber Security Club',
    'Uttara University',
    'community',
    'Member / participant',
    null,
    1,
    true
  ),
  (
    '082e4f8b-8ae8-441b-8d0d-38ff678ee015',
    'Science Club',
    'KKFDM',
    'leadership',
    'Former Vice-President',
    null,
    2,
    true
  ),
  (
    '1b058870-579a-41d1-92ca-40e1ecb51dde',
    'Bangladesh Rover Scouts',
    null,
    'community',
    'Rover Mate',
    null,
    3,
    true
  ),
  (
    'f94f25be-661a-4bee-b4d8-3b1b9c926def',
    'Blood Donor Society',
    null,
    'community',
    'Active member',
    null,
    4,
    true
  ),
  (
    '2097896d-82a0-4f13-8c2f-87038a2d3a11',
    'Event coordination',
    null,
    'community',
    'Academic and cultural events',
    null,
    5,
    true
  )
on conflict do nothing;

insert into public.projects (
  title,
  slug,
  summary,
  description,
  category,
  tools,
  source_url,
  featured,
  status,
  display_order
)
values
  (
    'Personal Portfolio Website',
    'personal-portfolio-website',
    'A personal portfolio site built with HTML, CSS, and JavaScript.',
    'A static personal web portfolio built with HTML, CSS, and JavaScript. The repository is now named basicdv; its public page contains experience and impact claims that need owner review, so no live-demo link is shown.',
    'Web Development',
    array['HTML', 'CSS', 'JavaScript'],
    'https://github.com/mhasnx/basicdv',
    true,
    'published',
    1
  ),
  (
    'Lost and Found Database System',
    'lost-and-found-database-system',
    'A PHP-based missing-and-found persons site with report forms and database-backed record listings.',
    'The public repository contains missing- and found-person report forms, record detail pages, and PHP queries that list stored records. A live deployment has not been verified.',
    'Web Development',
    array['PHP', 'HTML', 'CSS', 'SQL'],
    'https://github.com/mhasnx/lost-and-found-database-',
    true,
    'published',
    2
  ),
  (
    'ShieldLayer WAF',
    'shieldlayer-waf',
    'A PHP MVC web-application firewall project with tenant, role, scanning, rate-limit, and dashboard components.',
    'The public repository contains PHP MVC routing and controllers, tenant and role middleware, security-scanning and rate-limit services, and a database-backed application structure. Security effectiveness and production readiness have not been independently verified.',
    'Software Development',
    array['PHP', 'MySQL/MariaDB', 'Composer', 'Docker'],
    'https://github.com/mhasnx/shieldlayer-waf',
    true,
    'published',
    3
  )
on conflict (slug) do nothing;

insert into public.projects (
  title,
  slug,
  summary,
  description,
  category,
  tools,
  external_url,
  featured,
  status,
  display_order
)
values (
  'KrishiBazaar',
  'krishibazaar',
  'A digital agriculture marketplace interface for browsing crop listings by category and region.',
  'A localized marketplace interface with crop search, category and Bangladesh division browsing, farmer and origin details, and a shopping cart. Checkout and backend behavior have not been independently verified.',
  'Web Development',
  array['Next.js', 'React', 'Tailwind CSS'],
  'https://krishibazaar-frontend.vercel.app',
  true,
  'published',
  4
)
on conflict (slug) do nothing;

insert into public.services (
  title,
  slug,
  description,
  display_order,
  is_published
)
values
  (
    'Data Entry & Data Cleaning',
    'data-entry-data-cleaning',
    'Organize and clean information with care, keeping accuracy at the center of the process.',
    1,
    true
  ),
  (
    'SEO & Website Optimization',
    'seo-website-optimization',
    'Practical support for search visibility and considered website improvements.',
    2,
    true
  ),
  (
    'Web Analytics Setup and Reporting',
    'web-analytics-reporting',
    'Make website activity easier to understand through useful analytics and reporting.',
    3,
    true
  ),
  (
    'Virtual Assistance & Administrative Support',
    'virtual-assistance-administrative-support',
    'Dependable assistance with organization and day-to-day administrative tasks.',
    4,
    true
  ),
  (
    'Spreadsheet Organization and Data Validation',
    'spreadsheet-organization-data-validation',
    'Structure spreadsheets and check information for consistency and accuracy.',
    5,
    true
  ),
  (
    'Programming and Small Technical Solutions',
    'programming-small-technical-solutions',
    'Explore practical programming and small technical tasks with a clear, focused approach.',
    6,
    true
  )
on conflict do nothing;
