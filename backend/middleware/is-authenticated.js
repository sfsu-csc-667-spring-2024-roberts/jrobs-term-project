export default function (request, response, next) {
  if (
    request.session.user !== undefined &&
    request.session.user.id !== undefined
  ) {
    response.locals.user = {
      ...request.session.user,
    };

    next();
  } else {
    response.redirect("/");
  }
}
