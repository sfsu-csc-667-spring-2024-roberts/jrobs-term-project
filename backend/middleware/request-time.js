export default function (request, response, next) {
  console.log(`${request.method} request received at ${Date.now()}`);

  next();
}
