export default function (request, response, next) {
  const isLoginPage = request.path.includes("login");
  const isRegisterPage = request.path.includes("register");

  response.locals.menuItems = [
    { name: "Home", url: "/", current: !(isLoginPage || isRegisterPage) },
    {
      name: "Login",
      url: "/auth/login",
      current: isLoginPage,
    },
    {
      name: "Register",
      url: "/auth/register",
      current: isRegisterPage,
    },
  ];

  next();
}
