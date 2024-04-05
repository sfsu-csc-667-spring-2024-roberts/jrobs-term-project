import { createHash } from "crypto";

export default function (request, response, next) {
  if (
    request.session.user !== undefined &&
    request.session.user.id !== undefined
  ) {
    response.locals.user = {
      ...request.session.user,
      hash: createHash("sha256")
        .update(request.session.user.email)
        .digest("hex"),
    };

    next();
  } else {
    response.redirect("/");
  }
}
