# Chirpy

Chirpy is a social network similar to Twitter: a basic back-end API for posting short messages, built twice following the boot.dev courses:

- [typescript/](typescript/): Express + Drizzle ORM, from [Learn HTTP Servers in TypeScript](https://www.boot.dev/courses/learn-http-servers-typescript)
- [golang/](golang/): `net/http` + sqlc + goose, from [Learn HTTP Servers in Go](https://www.boot.dev/courses/learn-http-servers-golang)

Both use the same PostgreSQL database and expose the same API.

## Features

- readiness endpoint (`GET /api/healthz`)
- create, update and log in users, with a JWT access token and a refresh token
- create, delete, list (filter by author, sort) and get chirps, with JWT authentication
- refresh and revoke tokens
- metrics and reset admin endpoints
- webhook endpoint protected by an API key

The Go version is a work in progress and doesn't have every feature yet.

## Common: database

Install PostgreSQL (locally or use an existing server). Then, as the postgres admin, create the database and user:

```sql
CREATE DATABASE chirpy;
CREATE USER chirpy PASSWORD 'chirpy';
ALTER DATABASE chirpy OWNER TO chirpy;
```

Test the connection:

```sh
psql "postgres://chirpy:chirpy@localhost:5432/chirpy"
```

Each version expects this connection string in `DB_URL` in its own `.env` file (copy `.env.example`):

```
DB_URL="postgresql://chirpy:chirpy@localhost:5432/chirpy?sslmode=disable"
```

## TypeScript

Requirements: [NVM](https://github.com/nvm-sh/nvm) and Node 24 (see `.nvmrc`).

```sh
cd typescript
nvm install            # later: nvm use
npm install
cp .env.example .env   # set DB_URL, SECRET and POLKA_KEY (openssl rand -base64 64)
npm run generate       # generate SQL migrations from the Drizzle schema
npm run migrate        # apply migrations
npm run server         # build and run the server
npm test               # run tests
```

## Go

Requirements: Go 1.26+, [goose](https://github.com/pressly/goose) and [sqlc](https://sqlc.dev).

```sh
cd golang
cp .env.example .env   # set DB_URL and JWT_SECRET
goose -dir sql/schema postgres "$DB_URL" up   # apply migrations
sqlc generate          # regenerate internal/database from sql/queries
go run .               # run the server
```
