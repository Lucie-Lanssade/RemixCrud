import type {  ActionArgs} from "@remix-run/node";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { Form,Link, useSearchParams,useActionData } from "@remix-run/react";
// On importe searchParams pour gérer les redirections selon les cas (avec useSearchParams.length("redirectTo"))
import {createUserSession, login } from "~/utils/session.server";
//On importe la fonction login qui checke le username et hashed password,on importe aussi la fonction qui créé la session (via un cookie)



// Fonctions servant à tester les inputs, utilisée ensuite dans les fiedsErrror. "validateUrl" est aussi utilisée avec searchParams/"redirectTo" pour rediriger l'utilisateur si l'url est ok
function validateUsername(username: string) {
  if (username.length < 3) {
    return "Usernames must be at least 3 characters long";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "Passwords must be at least 6 characters long";
  }
}

function validateUrl(url: string) {
  const urls = ["/notes", "/", "http://localhost:3000"];
  if (urls.includes(url)) {
    return url;
  }
  return "/notes";
}



//Action permettant d'activer le Form
export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();

//   Récupération des inputs par référence au "name"
  const loginType = form.get("loginType");
  const password = form.get("password");
  const username = form.get("username");
  const redirectTo = validateUrl(
    (form.get("redirectTo") as string) || "/notes"
  );

//Gestion de l'erreur par défaut si type d'input pas ok
  if (
    typeof loginType !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  //Déclaration des fieldErrors avec les fonctions de validations écrites en début de page
  const fields = { loginType, password, username };
  const fieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }


  switch (loginType) {
    case "login": {
    //Login: on appelle la fonction login. Si pas de user, on retourne formError

    const user= await login({username,password});
    console.log("the user is",user)
    if (!user){

      return badRequest({
        fieldErrors: null,
        fields,
        formError: "Username/password combination is incorrect",
      });}

      return createUserSession(user.id, redirectTo);
    //   si tout est ok, on appelle la fonction createUserSession en lui passant le userId et la redirection en argument 
    }
    case "register": {
    // Si le user existe, on le retrouve via son username dans la db, et on indique qu'il existe déjà.
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `User with username ${username} already exists`,
        });
      }
      // create the user
      // create their session and redirect to /jokes
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "Not implemented",
      });
    }
    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "Login type invalid",
      });
    }
  }
};






export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <div >
      <div data-light="">
        <h1>Login</h1>
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend >
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
                // defaultChecked permet de gérer les potentielles erreurs sur l'input radio (le name des différents choix est le même "loginType" mais leur value "login"/"register" est différente).
                // Si login ou register ne sont pas cochés, on coche "login" par défaut. Si login est coché, on coche login
                
              />
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                 defaultChecked={
                  actionData?.fields?.loginType ===
                  "register"
                }
                // Si "register" est coché, on coche register. Indispensable?
              />
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
             defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.username
              )}
              //aria-invalid return TRUE si la condition fieldErrors.username est remplie. Ne rend rien sur le dom mais est indispensable pour des questions d'accessibilité.
              aria-errormessage={
                actionData?.fieldErrors?.username
                  ? "username-error"
                  : undefined
              }
              //On affiche les fieldErrors si on rentre dans la condition "validateUsername()". Aria-errormessage ne s'affiche pas sur l'écran mais est indispensable pour les malvoyants. Pour afficher l'erreur sur l'écran, il faut utiliser un ternary operator qui affiche un nouvel élément avec l'erreur si la condition fieldErrors est remplie
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.password
              )}
              aria-errormessage={
                actionData?.fieldErrors?.password
                  ? "password-error"
                  : undefined
              }

            />
             {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
            {/* conditionnal rendering d'un message d'erreur général (formError) si erreur non gérée par les fieldErrors */}
          </div>
          <button type="submit" >
            Submit
          </button>
        </Form>
      </div>
      <div >
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/notes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}


