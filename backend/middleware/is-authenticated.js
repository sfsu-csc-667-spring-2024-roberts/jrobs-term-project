export default function (request, response, next) {
  // TODO we will eventually connect this to our authentication logic
  console.log(request.query);
  if (request.query.showauth) {
    next();
  } else {
    response.redirect("/");
  }
}
