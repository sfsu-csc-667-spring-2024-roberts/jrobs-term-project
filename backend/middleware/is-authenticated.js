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
