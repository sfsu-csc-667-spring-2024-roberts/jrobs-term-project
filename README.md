# Term Project Example

## User authentication and sessions

<details>
  <summary>Signing a user in</summary>

### Signing a user in

With users able to register, the sign in logic can now be implemented:

```js
router.post("/login", async (request, response) => {
  const { password, email } = request.body;

  try {
    if (await checkPassword(email, password)) {
      const user = await Users.find(email);
      request.session.user = {
        id: user.id,
        email: user.email,
      };

      response.redirect("/lobby");
    } else {
      throw "User not found";
    }
  } catch (error) {
    // If we were nice, we would add an error message of some sort
    response.redirect("/login");
  }
});
```

Make sure that your sign in form posts to the correct route (my implementation handled this in the last step, in [`backend/routes/auth/form.ejs`](/backend/routes/auth/form.ejs)).

</details>

<details>
  <summary>Logging a user out</summary>

### [Logging a user out](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/40229110e40bc243e5aaa323d55cfec0b15b908a)

If you stop your server and restart it, and browse to the `/lobby` page, you should still be logged in. The browser is sending the cookie that `express-session` created back to the server when it makes a request, and the session information that is stored in the database is getting populated into the `request.session` object. This is convenient, but will prevent use from testing or sign in logic, so we will now implement the logic for signing out. This is fairly straightforward - we simply need to tell `express-session` to remove the session information from the database when the `/auth/logout` route is called in [`backend/routes/auth/index.js`](/backend/routes/auth/index.js) (see the `express-session` docs if you're curious about why some of this code was written):

```js
router.get("/logout", (request, response, next) => {
  request.session.user = null;
  request.session.save((error) => {
    if (error) {
      next(error);
    }

    request.session.regenerate((error) => {
      if (error) {
        next(error);
        response.redirect("/");
      }
    });
  });
});
```

We also need to provide a logout link (I have done so in my html skeleton already in [`backend/routes/layout/navigation.ejs`](/backend/routes/layout/navigation.ejs)):

```html
<a href="/auth/logout">Sign out</a>
```

</details>

<details>
  <summary>Creating a user</summary>

### [Creating a user](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/b25e21f003530d80cd626824e1f579540e63a6f9)

We need one more dependency for user creation - a package that will securely encrypt user passwords:

```
npm install bcrypt
```

We can now hook up the logic for user creation with the registration form. This is going to require some database access logic, which will be created in [`backend/db/users/index.js`](/backend/db/users/index.js):

```js
import db from "../connection.js";

const Sql = {
  INSERT:
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
  EXISTS: "SELECT id FROM users WHERE email=$1",
  // Note that this is ONLY for use in our backend (since it returns the password)
  FIND: "SELECT * FROM users WHERE email=$1 AND password=$2",
};

const create = async (email, password) => db.one(Sql.INSERT, [email, password]);
const exists = async (email) => {
  return null !== (await db.oneOrNone(Sql.EXISTS, [email]));
};
const find = async (email) => {
  const result = await db.oneOrNone(Sql.FIND, [email, password]);

  if (result === null) {
    throw "User with those credentials not found";
  } else {
    return result;
  }
};

export default {
  create,
  exists,
  find,
};
```

Since we will be adding multiple files for database access, create a "manifest file" [`backend/db/index.js`](/backend/db/index.js):

```js
export { default as Users } from "./users/index.js";
```

Moving on to [`backend/routes/auth/index.js`](/backend/routes/auth/index.js) to add the logic for user creation (I accidentally omitted the `post` route in initial setup):

```js
router.post("/register", async (request, response) => {
  const { password, email } = request.body;

  if (await Users.exists(email)) {
    // The user email already exists in our database
    response.redirect("/auth/login");
  } else {
    const encryptedPassword = await encryptPassword(password);

    request.session.user = await Users.create(email, encryptedPassword);
    response.redirect("/lobby");
  }
});
```

To keep my route file concise, I added a module to handle the password related functionality at [`backend/routes/auth/password-handling.js`](/backend/routes/auth/password-handling.js):

```js
import bcrypt from "bcrypt";
import { Users } from "../../db/index.js";

const SALT_ROUNDS = 10;

export async function encryptPassword(clearTextPassword) {
  return await bcrypt.hash(clearTextPassword, SALT_ROUNDS);
}

export async function checkPassword(email, password) {
  try {
    const user = await Users.find(email);

    return await bcrypt.compare(password, user.password);
  } catch (error) {
    return false;
  }
}
```

Finally, we can tell the [authentication form](/backend/routes/auth/form.ejs) that, when registering, the form should post to the `/auth/register` route.

```html
<form class="space-y-6" action="/auth/<%= format %>" method="POST">
  <!-- form content -->
</form>
```

With all of this logic in place, the [`backend/middleware/is-authenticated.js`](/backend/middleware/is-authenticated.js) middleware can be updated to make use of the `request.session` object:

```js
export default function (request, response, next) {
  if (
    request.session.user !== undefined &&
    request.session.user.id !== undefined
  ) {
    next();
  } else {
    response.redirect("/");
  }
}
```

You should now be able to browse to the registration form, enter your information, and submit it. This will add a user to the database, and redirect the user to the lobby page. Checking the database, we see a new record is created in the users table, along with a new entry in the sessions table:

```
jrobs-term-project=# select * from users;
 id |         email          |                           password                           |         created_at
----+------------------------+--------------------------------------------------------------+----------------------------
  1 | roberts.john@gmail.com | $2b$10$WFXJbojVXaWmAHzBplPr3.AP/g9WPssUjKDqcEXHcxkK55bTVKbk2 | 2024-04-05 12:37:14.465868
(1 row)

               sid                |                                                             sess                                                              |       expire
----------------------------------+-------------------------------------------------------------------------------------------------------------------------------+---------------------
 c7_qD9G2g2xIKun3oiwCnkMmRRMrSBTY | {"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"user":{"id":1,"email":"roberts.john@gmail.com"}} |
(4 rows)
```

</details>

<details>
  <summary>The process of creating users</summary>

### The process of creating users

We now have everything in place to be able to create and authenticate users. Whenever a user is authenticated, we will update the session to include their user id (which will allow us to update the [`backend/middleware/is-authenticated.js`](/backend/middleware/is-authenticated.js) middleware to check the session for a user id, rather than the querystring hack that has been used to this point).

#### Registration

User registers with the registration form created in our html/css skeleton, providing their email and password.

1. Ensure the user does not exist (for this sample application, that means checking to see if the email already exists in the users table). If the user exists, redirect to the login form (or provide a message indicating that the email is taken)
2. Encrypt the password for storage - passwords should never be stored as clear text, just in case a bad actor gets access to the database
3. Create an entry in the users table that includes the email and encrypted password
4. Update the session with the new user id
5. Redirect to the lobby page

#### Login

User provides their email and password in the login form.

1. Encrypt the password
2. Check the users table for an entry containing the email and encrypted password
3. If an entry exists, update the session with the user id from that record
4. Redirect to the lobby page

</details>

<details>
  <summary>Session setup</summary>

### [Session setup](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/25caeead7b0447ced255a4ba61b6a944072f7fe0)

We need to configure the `express-session` middleware, and tell our server about it. We can make use of our newly organized `server.js` file and `config` directory, and add a file for session setup [`backend/config/session.js](/backend/config/session.js) (don't forget to update the "manifest file"):

```js
import connectPgSimple from "connect-pg-simple";
import session from "express-session";

let sessionMiddleware = undefined;

export default function getSession() {
  if (sessionMiddleware === undefined) {
    return session({
      store: new (connectPgSimple(session))({ createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return sessionMiddleware;
}
```

In this code, the value of `sessionMiddleware` is being cached within the module so that repeated calls can be made to this function to get the _same_ session middleware. In addition - unlike our other config functions - we are returning the `session` object; we are going to need it later on! Also, a new environment variable named `SESSION_SECRET` is being used by `express-session` to sign the cookie; make sure to add this to your `.env` file!

After making a request to the server, the session middleware initializes the table it will be using for session storage (that is what the `createTableIsMissing` configuration is for in the store setup).

```
jrobs-term-project=# \dt
              List of relations
 Schema |        Name         | Type  | Owner
--------+---------------------+-------+-------
 public | game_cards          | table | jrob
 public | game_users          | table | jrob
 public | games               | table | jrob
 public | pgmigrations        | table | jrob
 public | session             | table | jrob
 public | standard_deck_cards | table | jrob
 public | test_table          | table | jrob
 public | users               | table | jrob
(8 rows)

jrobs-term-project=# select * from session;
               sid                |                                     sess                                     |       expire
----------------------------------+------------------------------------------------------------------------------+---------------------
 dUP56eT-FydoU0xAWALTACJ38s7_7Gtf | {"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}} | 2024-04-06 11:38:33
 HpkqymFa7tgKLGaKTv94Vq58Cjyt_Rap | {"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}} | 2024-04-06 11:38:33
(2 rows)
```

</details>

<details>
  <summary>Installing dependencies</summary>

### [Installing dependencies](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/153f5628d4e40b0fa0575b5fc0aff5d8ac89b367)

Begin by install the required packages:

1. [`express-session`](https://www.npmjs.com/package/express-session) is express middleware that creates a session id, and sends that session id in a cookie to the requesting client. On the server, we will associate some information with this session id (like user id). By default, this information is stored in memory, which is _volatile_ - any time the server restarts, the process' memory will be reclaimed, and we will lose all session data (this will be solved with the next package in this list).

   A cookie is simply an HTTP header whose value is defined by the server - in this case, the value is going to be the session id. Whenever the client makes a request to the server, it will automatically send any cookies that it has received from that domain. The `express-session` middleware will automatically look up any information associated with that session id, and make it available in the `request` object in our routes.

2. `connect-pg-simple` is express middleware that automates the storage of session information in our postgres database, allowing our server to persist session information in a non-volatile (i.e. memory) store.

```
npm install express-session connect-pg-simple
```

</details>

<details>
  <summary>Cleaning up our code</summary>

### [Cleaning up our code](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/12b07b35febe784f2ea15285eb8ae2fc0b38baf3)

Our [`backend/server.js`] file is becoming a little verbose, and now is a good time to refactor the code to make it more readable and organized. To do this, we will create a new directory named `config`, with individual files to handle setup of different concerns. Each of these files will `export` a function that takes the `express` `app` object as a parameter, along with any other information required from the server to handle configuration for a given concern. In addition to configuration, we can also make our route and middleware imports more concise, by adding a "manifest file" that re-exports individual functions from existing modules in their respective directories.

#### Organizing server configuration

Create the file [`backend/config/livereload.js](/backend/config/livereload.js) with this content:

```js
import connectLiveReload from "connect-livereload";
import livereload from "livereload";
import * as path from "path";

export default function liveReload(app, staticFilesPath) {
  if (process.env.NODE_ENV === "development") {
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(staticFilesPath, "dist"));
    liveReloadServer.server.once("connection", () => {
      setTimeout(() => {
        liveReloadServer.refresh("/");
      }, 100);
    });

    app.use(connectLiveReload());
  }
}
```

Create the file [`backend/config/views.js`](/backend/config/views.js) with this content:

```js
import express from "express";

export default function views(app, viewsPath, staticFilesPath) {
  app.set("views", viewsPath);
  app.set("view engine", "ejs");
  app.use(express.static(staticFilesPath));
}
```

In both cases, we have moved the logic from the [`backend/server.js`](/backend/server.js) file into functions, and updated the logic to use parameters passed in to those functions. The "manifest file" [`backend/config/index.js`](/backend/config/index.js) will simply re-export thee functions:

```js
export { default as liveReload } from "./livereload.js";
export { default as views } from "./views.js";
```

Now, in [`backend/server.js`](/backend/server.js), the original logic can be replaced by calls to these functions, that are `import`ed with a concise `import` statement:

```js
import * as configure from "./config/index.js";

/* Other server code - make sure to add these calls in the same place they were previously used in server.js */
configure.liveReload(app, STATIC_PATH);
configure.views(app, VIEW_PATH, STATIC_PATH);
```

#### Organizing middleware

Create the "manifest file" [`index.js`](/backend/middleware/index.js) for the `backend/middleware` directory:

```js
export { default as isAuthenticated } from "./is-authenticated.js";
export { default as menuItemsAuthenticated } from "./menu-items-authenticated.js";
export { default as menuItemsDefault } from "./menu-items-default.js";
```

And update [`backend/server.js`](/backend/server.js):

```js
import * as middleware from "./middleware/index.js";

/* Other server code - make sure to add these calls in the same place they were previously used in server.js */
app.use(middleware.menuItemsDefault);

/* more code */
app.use(middleware.isAuthenticated);
app.use(middleware.menuItemsAuthenticated);
```

#### Organizing routes

Create the "manifest file" [`index.js`](/backend/routes/index.js) for the `backend/routes` directory:

```js
export { default as auth } from "./auth/index.js";
export { default as games } from "./games/index.js";
export { default as home } from "./home/index.js";
export { default as lobby } from "./lobby/index.js";
```

And update [`backend/server.js`](/backend/server.js):

```js
import * as routes from "./routes/index.js";

/* Other server code - make sure to add these calls in the same place they were previously used in server.js */
app.use("/", routes.home);
app.use("/auth", routes.auth);

/* middleware code */
app.use("/lobby", routes.lobby);
app.use("/games", routes.games);
```

</details>

## User interface skeleton

<details>
  <summary>Game page</summary>

### [Game page](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/f93261b808ae40cc19f348906132ed242e216b92)

Html and css for the game page in [`backend/routes/games/games.ejs`](/backend/routes/games/games.ejs). Yet again, no functionality yet!

</details>

<details>
  <summary>Lobby page</summary>

### [Lobby page](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/c41b67a371f715cdfc19e58c08a0a0ab22591230)

Html and css for the lobby page in [`backend/routes/lobby/lobby.ejs`](/backend/routes/lobby/lobby.ejs). Again, no functionality yet!

</details>

<details>
  <summary>Login and register forms</summary>

### [Login and register forms](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/1619d0dede42415c00ba9340cbf6cce9d5ef8ec2)

Nothing much here; a little re-organization and a lot of html and css to create the [`backend/routes/auth/login.ejs`](/backend/routes/auth/login.ejs) and the [`backend/routes/auth/register.ejs`](/backend/routes/auth/register.ejs) forms (which both include the same form from [`backend/routes/auth/form.ejs`](/backend/routes/auth/form.ejs)). No functionality included yet!

</details>

<details>
  <summary>Creating the application skeleton</summary>

### [Creating the application skeleton](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/ee79da1ed2619d4edce5d8bba44a3eac254c9652)

In class or in a milestone, we created wireframes for each of the pages in the game application. In this step, I am creating views for each of those pages _without any dynamic functionality_, so that as I develop the application, the pages are already there. This requires the additiona of some new routes and their correponding views. I suggest splitting the pages between members of your team to distribute the work!

I have chosen to use [tailwindcss](https://tailwindcss.com/) to help with styling; since we are not graphic designers, you are permitted to use front end **CSS** frameworks (but I do strongly encourage you to _understand_ the CSS you are using) like [tailwindcss](https://tailwindcss.com/) or [https://getbootstrap.com/](https://getbootstrap.com/).

For the tailwind setup, I followed the instructions on their [installation page](https://tailwindcss.com/docs/installation).

A few interesting things to highlight in this skeleton:

1. I added middleware that we will eventually use for authentication in [`backend/middleware/is-authenticated.js`](/backend/middleware/is-authenticated.js). If you do the same, you will need to add the querystring `?showauth` to your URL to see pages that require authentication (like [this](http://localhost:3000/games/42?showauth=true)). Those pages are defined in [`backend/server.js`](/backend/server.js) by adding the `is-authenticated` middleware to any routes that we want to protect, like this (more on this when we implement auth):
   ```js
   app.use("/", routesHome);
   app.use("/lobby", middlewareIsAuthenticated, routesLobby);
   ```
2. I reconfigured my view setup so that my views live next to the routes that use them.
3. I added middleware that defines the set of menu items that will be displayed in my navigation. These _could_ be hardcoded in view templates, but I like being able to dynamically decide which menu items to show based on whether or not a user is logged in. I used two middlewares - one that initially defines the menu items to be for unauthenticated users, and one that may eventually define the menu items for authenticated users. In [`backend/server.js](/backend/server.js), the order that middleware is included is important, as it will be evaluated in the order it is found in the file!!

</details>

## Database and migrations setup

<details>
  <summary>Write migrations for initial DB setup</summary>

### [Write migrations for initial DB setup](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/433da6df599d8ec79f62174f92b470d1a8918a7c)

In class or in a milestone, we discussed the creation of a database schema for your individual games. Translate your database schema into migrations. (See examples for my game in the `migrations/` folder)

</details>

<details>
  <summary>Interacting with the database from our code</summary>

### [Interacting with the database from our code](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/4af5231435ecae9e6404690f54df8447345aa5be)

We will use the `pg-promise` package to communicate with our database. No, you may not use models or any ORM (Object Relational Mapping) package - we are not doing anything complex enough to really warrant that, and the requirement to write SQL directly forces students to learn a minimal amount of SQL (and always ask if you can't figure out how to do something in SQL).

```
npm install pg-promise
```

To organize our database related logic, create a `backend/db` directory, and add the file [`backend/db/connection.js`](/backend/db/connection.js) to hold the logic for connecting to the database. Add the code in my copy to your copy of `connection.js` - since we leverage `.env` to set up the environment variable `DATABASE_URL`, this logic is generic.

Finally, to test the database connection, create a new route. Take a look at [`backend/server.js`](/backend/server.js) and [`backend/routes/test.js`](/backend/routes/test.js) for the requisite code, and ask questions in discord if there is any part you do not understand. Do note that `pg-promise` returns _promises_ - code that is being run asynchronously, and will _eventually_ resolve to a result. Because of this, it is critical that we use `await` to wait for the asynchronous response from the database; otherwise surprising, not good things will happen.

Once the necessary code is added, visit [http://localhost:3000/test](http://localhost:3000/test) to see the results, and verify that the database connection was correctly established. You should see something like this:

```json
[
  {
    "id": 1,
    "created_at": "2024-04-04T20:55:01.339Z",
    "test_string": "Hello on Apr 4, 2024 @ 13:55:01"
  },
  {
    "id": 2,
    "created_at": "2024-04-04T20:55:04.416Z",
    "test_string": "Hello on Apr 4, 2024 @ 13:55:04"
  }
]
```

</details>

<details>
  <summary>Setting up migrations</summary>

### [Setting up migrations](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/3a3025358595ecc62fd174c9fb47d7d61c8efedc)

Let's say John and Sally are working on a project in their _separate and distinct_ development environments. John is tasked with setting the users database interactions, and Sally is tasked with setting up the game database interactions. John will create a `users` table in their local database, and Sally will create a `games` table in their local database.

Sally will not have the `users` table, and John will not have the `games` table. Migrations are a tool that allow us to specify changes to the structure of the database (for example, adding a table) _in our codebase_, so that when John pulls the code that Sally wrote, John can run the migrations to automatically add the table that Sally created (and vice versa). Migrations also allow us to make incremental changes to the database structure and, similar to version control with github, we can incrementally revert (rollback) or apply database changes.

Migrations will be managed with the `node-pg-migrate` and `pg` packages:

```
npm install node-pg-migrate pg
```

So that we don't need to remember the commands for migration, add these scripts to [`package.json`](./package.json):

```json
"db:create": "node-pg-migrate create -j=js -- ",
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

</details>

<details>
  <summary>Preparing to connect to the database</summary>

### [Preparing to connect to the database](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/267f62538ccb3b15fe6b2bf880bffc6affe6c9a2)

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

</details>

## Project setup and configuration

<details>
  <summary>Quality of life updates</summary>

### [Quality of life updates](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/53596743a2cc96240ed7572e3cb63b1ccdf176c5)

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

</details>

<details>
  <summary>Additional server configuration</summary>

### [Additional server configuration](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/8ca78d11aff01735aef734b275b914027bd4686d)

Adding the `morgan` package for additional server logging, and the `cookie-parser` package to be able to use cookies (this will be needed for authentication and maintaining user state between requests). Updated [`backend/server.js`](/backend/server.js) to use both of the new packages, as well as to allow json encoded bodies.

```
npm install morgan cookie-parser
```

</details>

<details>
  <summary>Automatically reload site in development</summary>

### [Automatically reload site in development](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/f836d9c378c0ba3d6cff5170cd85cca7568a6299)

Added two dependencies - `livereload` and `connect-livereload` - and updated [`backend/server.js](/backend/server.js) to use these dependencies in the development environment to automatically reload the website when changes are made to the code. Added [`nodemon.json`](./nodemon.json) to provide a configuration for `nodemon` that would also watch the `.ejs` files in `backend/views`, and to _ignore_ the `backend/static/dist` folder (`livereload` will automatically refresh the page, which will fetch the newly created bundle).

```
npm install --save-dev livereload connect-livereload
```

</details>

<details>
  <summary>Building frontend code</summary>

### [Building frontend code](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/67e711c6b870db9c30602e6e38e58e69cf1ec0db)

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

</details>

<details>
  <summary>Template engine</summary>

### [Template engine](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/671b31c53b51b52534e3da51e1b24f94316a4a5d)

Installed the `ejs` template engine, and updated [`backend/server.js`](/backend/server.js) to be able to "render" templates from the `/backend/views` directory. Added [`backend/views/root.ejs`](/backend/views/root.ejs) as the first view, and updated the root route ([`/backend/routes/root.js`](/backend/routes/root.js)) to use this template.

```
npm install ejs
```

</details>

<details>
  <summary>Serving static assets</summary>

### [Serving static assets](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/29e5739d35dd757723214be9144941d0b041b1ec)

Sometimes, we do not need to dynamically generate a response to a client - we just want to send a "static" file. Created `backend/static` directory (and added some favicons to it for testing), and configured the server to serve static files from this directory.

</details>

<details>
  <summary>Introduction to middleware</summary>

### [Introduction to middleware](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/c2081d692c65b81015492345620ae0d068d207ad)

Create a middleware example in [`backend/middleware/request-time.js`](/backend/middleware/request-time.js), and updated the server to `use` the middleware. This middleware simply prints out the request type and timestamp whenever a request is made to the server (and will be removed in a future commit since it is intended as an example only).

</details>

<details>
  <summary>http-errors</summary>

### [http-errors](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/0ec54c5eceb5a019869b85e1ffd5d868fd118e03)

Added the `http-errors` dependency, and configured the server to provide a more meaningful error message if a route is not found. Note that in a production environment, we would want to set the `NODE_ENV` to "production" to prevent the stack trace from being shown to the user (this could create a security risk by unintentionally revealing details of the failing request).

```
npm install http-errors
```

</details>

<details>
  <summary>Automatically reload server process</summary>

### [Automatically reload server process](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/5d6221277ec4d5192ac744daa00fde63cdacc3d2)

Added the `nodemon` dependency and a `start:dev` script to [`package.json`](./package.json) to reload the server process whenever a change is made to [`backend/server.js`](/backend/server.js), and any dependency of [`backend/server.js`](/backend/server.js).

```
npm install --save-dev nodemon
```

</details>

<details>
  <summary>Scripts in package.json</summary>

### [Scripts in package.json](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/c7b44c85f3515b4f666e9e26ca197c82bbf3eba2)

Added the `start` script to enable running the server with the command:

```
npm run start
```

</details>

<details>
  <summary>Adding some organization for routes</summary>

### [Adding some organization for routes](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/375595d17c9440d6b01c1af03969012f53692335)

Created the `backend/routes` directory and moved the route logic from [`backend/server.js`](/backend/server.js) to [`backend/routes/root.js`](/backend/routes/root.js). Set up the root routes in [`backend/server.js`](/backend/server.js) to serve all routes defined in [`backend/routes/root.js`](/backend/routes/root.js) from the root of the site (`/`).

</details>

<details>
  <summary>Adding our first route</summary>

### [Adding our first route](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/375595d17c9440d6b01c1af03969012f53692335)

Write the basic server setup code in [`backend/server.js`](/backend/server.js) to get a simple route set up. Updated [`package.json`](./package.json) to be able to use ES6.

</details>

<details>
  <summary>Initial project setup</summary>

### [Initial project setup](https://github.com/sfsu-csc-667-spring-2024-roberts/jrobs-term-project/commit/cb389932c21e7c5fdad2dd0000c49c2272994d25)

Created a `backend` directory where all of our server side source code will go, and the [`server.js`](/backend/server.js) file where we will write our server configuration code.

Install the express dependency with:

```
npm install express
```

</details>
