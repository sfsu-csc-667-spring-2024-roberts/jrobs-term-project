### Setting up migrations

Let's say John and Sally are working on a project in their _separate and distinct_ development environments. John is tasked with setting the users database interactions, and Sally is tasked with setting up the game database interactions. John will create a `users` table in their local database, and Sally will create a `games` table in their local database.

Sally will not have the `users` table, and John will not have the `games` table. Migrations are a tool that allow us to specify changes to the structure of the database (for example, adding a table) _in our codebase_, so that when John pulls the code that Sally wrote, John can run the migrations to automatically add the table that Sally created (and vice versa). Migrations also allow us to make incremental changes to the database structure and, similar to version control with github, we can incrementally revert (rollback) or apply database changes.

Migrations will be managed with the `node-pg-migrate` and `pg` packages:

```
npm install node-pg-migrate pg
```

So that we don't need to remember the commands for migration, add these scripts to [`package.json`](./package.json):

```json
"db:create": "node-pg-migrate create -- ",
"db:migrate": "node-pg-migrate up",
"db:rollback": "node-pg-migrate down"
```

Create a migration to test our connection - this will create a `migrations` folder, and put a file named [`TIMESTAMP_test-migration.js`](/migrations/1712262572600_test-migration.js) into that directory (the timestamp is important; don't change the name of this file!). Since we are using ES6 modules, we _do_ need to change the extension of the file to `cjs` after it is created.

```
npm run db:create test migration
```

You can just copy the contents of the copy in this repository into your migration. Notice that there are two separate functions that are exported - `up` to apply a change to the database (in this case, the creation of a table named `test_table`), and `down` to rollback that change (if we ever need to revert the change).

The migration can be applied with:

```
npm run db:migrate
```

`node-pg-migrate` automatically looks for a `.env` file to find the database connection string, and applies the change. If we connect to our database, we can see that _two_ tables have been created:

```
❯ psql jrobs-term-project
psql (15.2)
Type "help" for help.

jrobs-term-project=# \dt
           List of relations
 Schema |     Name     | Type  | Owner
--------+--------------+-------+-------
 public | pgmigrations | table | jrob
 public | test_table   | table | jrob
(2 rows)
```

The `pgmigrations` table helps `node-pg-migrate` keep track of which migrations have run:

```
❯ psql jrobs-term-project
psql (15.2)
Type "help" for help.

jrobs-term-project=# \dt
           List of relations
 Schema |     Name     | Type  | Owner
--------+--------------+-------+-------
 public | pgmigrations | table | jrob
 public | test_table   | table | jrob
(2 rows)
```

The `test_table` is the table we defined in our migration:

```
jrobs-term-project=# select * from test_table;
 id | created_at | test_string
----+------------+-------------
(0 rows)
```

### Preparing to connect to the database

Ensure that you have the [`postgres`](https://www.postgresql.org/) database server installed locally! This should install some command line tools, like `createdb`, that will allow you to interact with a development copy of your application's database locally.

First, create the database (I usually name it after my app):

```
createdb DATABASE_NAME
```

Create a `.env` file that will be used to store "secrets" - like database passwords - locally. Since each developer on the team will be interacting with their own version of a development database, and since all of these will be distinct from the production database, we need a way to store and use things like database connection strings (which will be different for each developer and the production environment). The `.env` file will hold these values, and we will use the `dotenv` package to load the values stored in the `.env` file into our environment when we start up our development server, and if (when) our project is deployed, we can simply create the same environment variables with their production values on the production server. Note that the `.env` file MUST NOT BE COMMITTED TO GITHUB. It will hold sensitive information (like passwords, authentication info for external services, etc.) so should not be made public. Ensure that `.gitignore` has a line that reads `.env` to prevent this file from getting committed!

In a \*nix shell, you can add your database connection string to your `.env` file like this (this assumes no password, and that the current user is the database user as well):

```
echo DATABASE_URL=postgres://`whoami`@localhost:5432/DATABASE_NAME >> .env
```

Install the `dotenv` package:

```
npm install dotenv
```

Update [`backend/server.js`](/backend/server.js) to load environment variables automatically (I also updated my startup message to tell me which environment I'm running in):

```js
import "dotenv/config";
```

### Quality of life updates

In order to keep code consistently formatted as multiple developers work on the same project, installed some development dependencies to automatically reformat ("prettify") code as it gets committed into the repository. This diff is going to be large because all of the code written to this point will be run through `prettier`.

```
npm install --save-dev husky lint-staged prettier
```

To set up the pre-commit hook to automate code reformatting:

```
npx mrm@2 lint-staged
```

To prettify existing code:

```
npx prettier --write ./frontend
npx prettier --write ./backend
```

### Additional server configuration

Adding the `morgan` package for additional server logging, and the `cookie-parser` package to be able to use cookies (this will be needed for authentication and maintaining user state between requests). Updated [`backend/server.js`](/backend/server.js) to use both of the new packages, as well as to allow json encoded bodies.

```
npm install morgan cookie-parser
```

### Automatically reload site in development

Added two dependencies - `livereload` and `connect-livereload` - and updated [`backend/server.js](/backend/server.js) to use these dependencies in the development environment to automatically reload the website when changes are made to the code. Added [`nodemon.json`](./nodemon.json) to provide a configuration for `nodemon` that would also watch the `.ejs` files in `backend/views`, and to _ignore_ the `backend/static/dist` folder (`livereload` will automatically refresh the page, which will fetch the newly created bundle).

```
npm install --save-dev livereload connect-livereload
```

### Building frontend code

Added the `/frontend` directory, which will store the code that will run in the client. This code will be served as a static file by the server from the `/backend/static/dist` directory. Installed `esbuild` to be able to "bundle" our front-end code into a single file to be served by the server. For funsies, using [typescript](https://www.typescriptlang.org/) in frontend code.

In order to be able to refresh the code as changes are made in the development environment, installed `concurrently` to be able to run multiple processes simultaneously. Scripts in [`package.json`](./package.json) updated to leverage `concurrently` to rebuild the front end code, and to restart the server process when changes are made. Note that `.gitignore` was updated to ignore the files output by esbuild - these would be built with, for example, a postinstall script when the project gets deployed to a production server (which we won't be doing because money). Moved some scripts around in [`package.json`](./package.json) to better organize the development scripts for use with `concurrently`.

The `esbuild.js` file holds the code that tells `esbuild` what to do in the production and development environments - we want production code to be as concise and small as possible (minified), and we want development code to be readable for debugging.

Some other minor refactors:

- Moved all the favicon links into a partial
- Added `dayjs` to test build

```
npm install --save-dev concurrently typescript
npm install dayjs
```

### Template engine

Installed the `ejs` template engine, and updated [`backend/server.js`](/backend/server.js) to be able to "render" templates from the `/backend/views` directory. Added [`backend/views/root.ejs`](/backend/views/root.ejs) as the first view, and updated the root route ([`/backend/routes/root.js`](/backend/routes/root.js)) to use this template.

```
npm install ejs
```

### Serving static assets

Sometimes, we do not need to dynamically generate a response to a client - we just want to send a "static" file. Created `backend/static` directory (and added some favicons to it for testing), and configured the server to serve static files from this directory.

### Introduction to middleware

Create a middleware example in [`backend/middleware/request-time.js`](/backend/middleware/request-time.js), and updated the server to `use` the middleware. This middleware simply prints out the request type and timestamp whenever a request is made to the server (and will be removed in a future commit since it is intended as an example only).

### http-errors

Added the `http-errors` dependency, and configured the server to provide a more meaningful error message if a route is not found. Note that in a production environment, we would want to set the `NODE_ENV` to "production" to prevent the stack trace from being shown to the user (this could create a security risk by unintentionally revealing details of the failing request).

```
npm install http-errors
```

### Automatically reload server process

Added the `nodemon` dependency and a `start:dev` script to [`package.json`](./package.json) to reload the server process whenever a change is made to [`backend/server.js`](/backend/server.js), and any dependency of [`backend/server.js`](/backend/server.js).

```
npm install --save-dev nodemon
```

### Scripts in package.json

Added the `start` script to enable running the server with the command:

```
npm run start
```

### Adding some organization for routes

Created the `backend/routes` directory and moved the route logic from [`backend/server.js`](/backend/server.js) to [`backend/routes/root.js`](/backend/routes/root.js). Set up the root routes in [`backend/server.js`](/backend/server.js) to serve all routes defined in [`backend/routes/root.js`](/backend/routes/root.js) from the root of the site (`/`).

### Adding our first route

Write the basic server setup code in [`backend/server.js`](/backend/server.js) to get a simple route set up. Updated [`package.json`](./package.json) to be able to use ES6.

### Initial project setup

Created a `backend` directory where all of our server side source code will go, and the [`server.js`](/backend/server.js) file where we will write our server configuration code.

Install the express dependency with:

```
npm install express
```
