export default function (request, response, next) {
  // TODO we will eventually connect this to our authentication logic
  if (request.query.showauth) {
    next();
  } else {
    response.redirect("/");
  }
}
