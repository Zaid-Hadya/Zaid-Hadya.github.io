# CodeBench

A lightweight programming learning platform built with HTML, CSS, and vanilla JavaScript. The SQL course now includes a browser-based SQLite playground powered by SQL.js.

## Current courses

- Introduction to Databases with SQL — six lessons and an interactive playground
- Introduction to Programming in Java — placeholder course page
- Object-Oriented Programming in Java — placeholder course page
- Data Structures and Algorithms — placeholder course page

## Run locally

1. Extract the project folder.
2. Open the folder in VS Code.
3. Start a local server (for example, the VS Code Live Server extension).
4. Open the local URL and select the SQL course.

Use a local server rather than opening `index.html` directly with `file://`. The SQL engine and its WebAssembly file are loaded from cdnjs, so the first load requires an internet connection.

## SQL playground features

- SQL.js / SQLite runs in the browser; query execution does not require a backend.
- Sample `students`, `courses`, and `enrollments` tables are recreated on reset.
- Query editor supports Ctrl/⌘ + Enter and Tab indentation.
- Results are rendered as a table; SQL errors are displayed inline.
- The prototype blocks common data-changing/schema-changing statements to keep the sample data safe for learning.
- Six guided activities cover exploration, SELECT, WHERE, debugging, JOIN, and aggregation.
- Draft SQL and completed activities are saved in the current browser using localStorage.

The editor is a learning sandbox, not a secure database boundary. Do not connect it to production data or treat client-side checks as authoritative grading.

## Shared student accounts and progress: next backend step

GitHub Pages is static hosting and cannot safely issue sessions, store credentials, or accept trusted progress submissions by itself. For shared accounts and cross-device progress, add a small API and a hosted database (for example, Supabase Auth + Postgres, or a separately hosted API).

Suggested data model:

- `profiles`: `id` (same UUID as auth user), `display_name`, `created_at`
- `course_progress`: `user_id`, `course_slug`, `completed_lessons`, `completed_activities`, `updated_at`; unique key `(user_id, course_slug)`
- `activity_attempts`: `id`, `user_id`, `course_slug`, `activity_id`, `passed`, `attempted_at`, optional `duration_seconds`

Suggested API contract:

- `GET /api/me/progress` — return the signed-in student's course progress
- `PUT /api/me/progress/:courseSlug` — upsert lesson/activity completion for the authenticated student
- `POST /api/me/attempts` — record an attempt; the server validates user identity and accepted activity IDs

The browser should send the provider's authenticated session, and the server/database must enforce row-level access so students can only read or modify their own progress. Do not store passwords, service-role keys, or privileged database credentials in frontend files. Local progress is currently a prototype/fallback only; the API above is a design recommendation, not implemented or connected yet.

## Project structure

- `index.html` — homepage and course catalogue
- `courses/` — individual course pages
- `assets/css/` — global, layout, component, and page styles
- `assets/js/` — navigation, catalogue, course, and SQL playground logic
- `assets/images/` — logo and course cover illustrations

## Deployment

The project is suitable for GitHub Pages as a static site. Commit the contents of the `e-learning` folder to the repository root (so `index.html` is at the root), then enable Pages in repository settings. Test the deployed SQL page over HTTPS and confirm the external SQL.js script and WebAssembly asset load successfully.


## Database Lab file structure

- `courses/sql.html` — course overview and browser SQL playground
- `courses/database-lab/lab00.html` — Introduction to Databases and SQL
- `courses/database-lab/lab01.html` — SELECT Statements
- `courses/database-lab/lab02.html` — Filtering with WHERE
- `courses/database-lab/lab03.html` — Sorting and Limiting Results
- `courses/database-lab/lab04.html` — Aggregate Functions and GROUP BY
- `courses/database-lab/lab05.html` — Joining Tables
- `auth.html` — student sign-in and account creation UI
- `supabase/schema.sql` — initial PostgreSQL schema and RLS policies
- `supabase/README.md` — Supabase setup instructions

Each lab page uses shared styles and scripts. Edit the lesson body in its own HTML file; change shared presentation in `assets/css/`. Supabase integration is scaffolded but needs your project URL/key and database setup before it can sync real student data.
