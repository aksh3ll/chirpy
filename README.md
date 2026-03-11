# Chirpy

## Introduction


## Requirements

- NVM Node version manager
- Node  Javascript language interpreter
- PostgreSQL database server

## Installation
- install NVM
- install Node we will user 21.7.0, NVM will take care of it normally
- run `nvm use`
- run `node --version` expecting v21.7.0
- install PostgreSQL we need a database server, by default locally but you can use a pre-existing one
- as postgres admin, create the chirpy database and set a login/password postgres/postgres user:
```
CREATE DATABASE chirpy;
\c chirpy
ALTER USER chirpy PASSWORD 'chirpy';
```
- you can test your connection with `psql "postgres://chirpy:chirpy@localhost:5432/chirpy"`
- run `npm install` to install node librairies
- update the .env file with a full functionning connection string for your database and generate the keys
- run `npm run generate` to generate the sql scripts for the database
- run `npm run migrate` to execute the sql scripts for the database
- run `npm run server` to run the server
