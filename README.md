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
