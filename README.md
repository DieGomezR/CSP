# KidSchedule

KidSchedule is the challenge project for rebuilding the product behind [kidschedule.com](https://kidschedule.com/) as a real Laravel application.

The current foundation uses:

- PHP 8.3+
- Laravel 12
- Inertia + React + TypeScript
- Pest
- PostgreSQL-oriented configuration
- Anthropic and Stripe environment placeholders

## Product Direction

The platform is being built around a shared `workspace` model so the same backend can support:

- family calendars
- co-parenting workflows
- teams and clubs
- PTA portals

The first delivery focus is the family and co-parenting experience. Teams and PTA will reuse the same primitives instead of becoming separate apps.

## Current Domain Foundation

The repository already includes initial tables and models for:

- `workspaces`
- `workspace_members`
- `children`

These are the first core primitives for tenancy, roles, and child-specific scheduling.

## Local Development

The scaffold-generated `.env` still works with local SQLite so the project can boot immediately on a fresh machine.

The `.env.example` has already been shifted toward the intended production architecture:

- `DB_CONNECTION=pgsql`
- Anthropic API placeholders
- Stripe placeholders

To run locally:

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
docker-compose up -d db
php artisan migrate
php artisan serve --no-reload
npm run dev
```

If you already have the project installed and only want to boot it day to day:

```bash
docker-compose up -d db
php artisan serve --no-reload
npm run dev
```

Local development now uses:

- `http://127.0.0.1:8000` for Laravel via `php artisan serve`
- `127.0.0.1:54329` for PostgreSQL

Useful Docker commands:

```bash
docker-compose up -d db
docker-compose down
```

Important local note:

- the project now targets `PHP 8.3+`
- Docker is only being used for PostgreSQL in local development
- Laravel and Vite should run directly on the host with `php artisan serve --no-reload` and `npm run dev`
- if port `8000` is busy, stop old `php artisan serve` processes before starting a new one
- if you want queued emails and notifications to process locally, run `php artisan queue:listen --tries=1` in a third terminal

## Stripe Billing Setup

The full Stripe test-mode setup for this project is documented in:

- [`docs/stripe-test-mode-setup.md`](C:/Users/Desarrollador-Diego/Documents/csp/docs/stripe-test-mode-setup.md)

If you prefer SQLite during local development, update `.env` accordingly before running migrations.

## Initial Roadmap

1. Workspaces, onboarding, children, and calendar foundation
2. Co-parenting features: custody, messaging, expenses, change requests
3. AI import, tone analysis, exports, billing
4. Team and PTA extensions, QA, deploy, and demo data
