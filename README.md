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
