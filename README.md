# lis-apps-cattle-move

Part of the Livestock Information Service (LIS), which lets livestock keepers, owners, agents and
delegates record and manage their animals.

The cattle move microsite will let a signed-in keeper record cattle moving on and off a holding. It is
a placeholder for now: one page that shows the signed-in user, the move taxonomy and the hub path,
and it makes no calls to a backend yet. It is a spoke: it has no sign-in of its own and is reached
through the front-office and back-office hubs.

Deployed on the Core Delivery Platform (CDP). See the
[CDP portal service page](https://portal.cdp-int.defra.cloud/services/lis-apps-cattle-move) for
environments, deployments, logs and metrics.

## Architecture

```text
hub (front-office or back-office) → /holdings/<cph>/cattle/move → this app
```

The hubs proxy this app at its registry mount and forward the path unchanged. Assets are served at
`/assets/cattle-move`. The module list is in
[lis-hubs-infra-registry](https://github.com/DEFRA/lis-hubs-infra-registry).

- Authentication: users sign in through the hub. The hub proxy passes the signed-in user's JWT in the
  `x-lis-jwt-assertion` header, which this app verifies with `@defra/lis-hubs-infra-access`.
- Shared packages:
  [lis-hubs-infra-access](https://github.com/DEFRA/lis-hubs-infra-access) (spoke authentication and access decisions),
  [lis-hubs-infra-core](https://github.com/DEFRA/lis-hubs-infra-core) (logging, request context),
  [lis-hubs-infra-registry](https://github.com/DEFRA/lis-hubs-infra-registry) (module paths),
  [lis-infra-ui-services](https://github.com/DEFRA/lis-infra-ui-services) (layout, error pages, shared helpers),
  [lis-species-cattle](https://github.com/DEFRA/lis-species-cattle) (cattle content),
  [lis-taxonomy-move](https://github.com/DEFRA/lis-taxonomy-move) (move taxonomy).

`lis-be4fe-cattle-move` exists in lis-dev (published on port 8088) but this app does not call it yet.

See [HUB-ARCHITECTURE.md](https://github.com/DEFRA/lis-dev/blob/main/HUB-ARCHITECTURE.md) for the
hub and spoke design.

### Routes

| Path                            | Purpose                  |
| ------------------------------- | ------------------------ |
| `/holdings/{cph*3}/cattle/move` | Placeholder home page    |
| `/assets/cattle-move/{param*}`  | Built CSS and JavaScript |
| `/health`                       | Health check             |

## Prerequisites

- Node.js 24 (see `.nvmrc`, use `nvm use`)
- Docker with Docker Compose
- A local clone of [lis-dev](https://github.com/DEFRA/lis-dev) (recommended, see [Running with lis-dev](#running-with-lis-dev-recommended))

## Setup

```bash
nvm use
npm install
cp .env.example .env
```

`.env` is loaded when running standalone, and also by a sideloaded `npm run dev` for variables that
compose does not set. It sets the public local development `HUB_JWT_SECRET` that the lis-dev hubs
use.

Tests use [Vitest](https://vitest.dev/). There are no tools to install beyond `npm install`.

## Running with lis-dev (recommended)

This app only works properly alongside the hubs and the fake identity providers. [lis-dev](https://github.com/DEFRA/lis-dev) runs all of these locally with Docker
Compose and serves them behind local HTTPS hostnames. Follow its README for the one-time setup.

```bash
cd lis-dev
docker compose up -d
```

In compose this app is the `lis-apps-cattle-move` service on port 3204. To work on it, swap its container for a local server with hot reload
while the rest of the stack stays in Docker:

```bash
.bin/sideload up apps/cattle-move
.bin/sideload restore    # when done: back to the container
```

Then open <https://front-office.lis.defra/holdings/22/001/0001/cattle/move> and sign in through
the fake identity provider.

## Running standalone

`npm run dev` runs the server on its own with the values in `.env`. Pages need the
`x-lis-jwt-assertion` header from the hub proxy, so without the hub you are redirected to sign in.

| Script              | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Build frontend assets, then start the server with nodemon |
| `npm run dev:debug` | As `dev`, but waits for a debugger to attach              |
| `npm start`         | Production build and start                                |

### Configuration

Configuration is in `src/config/config.js`. Values marked secret must be set as secrets in the CDP
portal for every deployed environment. The logging, Redis and session cache settings follow the CDP
Node.js frontend template; see the config file for those.

| Variable           | Description                                                             | Default                                                 |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| `PORT`             | Port to bind                                                            | `8085`                                                  |
| `HUB_JWT_SECRET`   | Secret, required. Verifies hub JWTs. Must match the hubs                | none                                                    |
| `HUB_JWT_AUDIENCE` | Hub JWT audience                                                        | `livestock-spokes`                                      |
| `HUB_ORIGINS`      | Hub origins allowed to use this spoke, and the accepted hub JWT issuers | front-office and back-office hubs and their local ports |
| `LOG_HASH_SECRET`  | Secret. Key for hashing sensitive values in logs                        | none                                                    |

## Running tests

```bash
npm test                 # unit tests
npm run test:coverage    # with coverage; fails below 90%
npm run lint             # ESLint and Stylelint
npm run format:check     # Prettier
```

End-to-end journeys are covered by [lis-journey-tests](https://github.com/DEFRA/lis-journey-tests).

## Monitoring

- Health check: `GET /health`
- Logs and metrics: OpenSearch and Grafana dashboards per environment, linked from the
  [CDP portal service page](https://portal.cdp-int.defra.cloud/services/lis-apps-cattle-move)

## Pipelines

Build, versioning and publishing run in GitHub Actions (`.github/workflows`) using the shared
composite actions in [lis-github-actions](https://github.com/DEFRA/lis-github-actions):

- **Pull request to `main`**: validate (format, lint, test), Sonar analysis, version check
- **Push to a `feature/` or `hotfix/` branch**: prerelease build and tag
- **Merge to `main`**: release tag, then publish the container image to CDP

Versions come from git tags (SemVer).

## Branching policy

The repo uses mainline development. Branch from `main` and name the branch
`feature/LREG-<ticket>-<short-kebab-description>` or `hotfix/LREG-<ticket>-<short-kebab-description>`.
`LREG` must be uppercase, because the GitHub ruleset rejects other branch names. Rebase onto `main`
rather than merging `main` in.

## Contributing

- Follow the [Defra software development standards](https://github.com/DEFRA/software-development-standards).
- A pre-commit hook runs the security audit, format check, lint and tests. Run `npm run setup:husky` once to install it.
- Open a pull request against `main` using the PR template. CI must pass and the Sonar quality gate must be green before merge.

## Licence

Licensed under the [Open Government Licence v3](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3).
See [LICENCE](LICENCE).
