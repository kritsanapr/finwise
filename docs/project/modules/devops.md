# Module: DevOps

## Purpose

Provide a reproducible local environment, automated testing, and reliable deployment pipelines.

## Current State

- Standard Next.js scripts in `package.json` (`dev`, `build`, `lint`)
- Drizzle migration scripts (`db:generate`, `db:migrate`, `db:push`, `db:seed`)
- Docker and GitHub Actions are mentioned in `specs/requirements.md` but not implemented

## Responsibilities

- Dockerized local development environment
- CI/CD workflows for lint, typecheck, test, build, and deploy
- Preview deployments for pull requests
- Controlled database migration jobs in CI/CD
- Monitoring and logging hygiene

## Boundaries

- Does not contain application business logic
- Must keep secrets out of code and logs
- Migration jobs must run against the direct Postgres connection, not the pooler

## Related Files

- `package.json`
- `Dockerfile` (to be created)
- `docker-compose.yml` (to be created)
- `.github/workflows/` (to be created)
- `lib/db/migrate.ts`

## Linked PBIs

- PBI 4.2 — Dockerized Local Development
- PBI 4.3 — CI/CD & Deployment Automation

## Open Questions

- What is the target hosting platform (Vercel, self-hosted, etc.)?
- Should migration jobs be manual gates or automated in CI/CD?
