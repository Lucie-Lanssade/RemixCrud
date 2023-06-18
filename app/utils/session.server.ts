import { db } from "./db.server"
import bcrypt from "bcryptjs"
import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";
// On importe la builtIn method remix pour gérer les cookies

type LoginForm ={password:string, username:string}
// Typage custom de password et username. Si on avait pas créé de type custom, on aurait simplement pu noter dans les arguments de la fonction login : "(
//     {password,username}:{password:string, username:string}"



export  async function login ({password,username}:LoginForm)
// On indique que les arguments {password et username} doivent correspondre au type  LoginForm
{
    const user= await db.user.findUnique(
        {where: {username},}
    );
    if (!user){return null}
//On commence par chercher un username dans la table User.


const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  if (!isCorrectPassword) {
    return null;
  }
//On compare ensuite le password de l'input au password hashé et stocké dans la db 



return { id: user.id, username };
// si tout est ok, on retourne le user.id et l'username


}


const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}
// On initialise un session secret dans le .env . On oublie pas de vérifier que le .env est bien dans le gitIgnore avant de push



const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

// Ici on créé le cookie qui a pour nom RJ_session. 
// "Secure" est set sur "true" pour les environnements de production et pass en false en phase de dev ou sur Safari.
// Le secret est récupéré du .env
// "samesite /lax" rajoute une sécurité contre les attaques CSRF 
// "path" restreint le cookie au chemin définit, ici "/"
// "maxAge": viabilité du cookie:30jours. 
// "httpOnly":mesure de sécurité supplémentaire indiquant que le cookie n'est pas accessible via Javascript, défense contre les attaques XSS




function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}
// La fonction getUserSession va récupérer le cookie header dans la requête et utilise sa valeur pour récupérer la session associée.

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}
// La fonction getUserId appelle la fonction getUserSession() définie plus haut.
// On utilise la méthode get() sur session pour extraire et stocker la valeur associée à la clé "userId" dans la variabe userId
// On retourne l'userId

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
  ) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "string") {
      const searchParams = new URLSearchParams([
        ["redirectTo", redirectTo],
      ]);
      throw redirect(`/login?${searchParams}`);
    }
    return userId;
  }
  // La fonction requireUserId prend la requête et redirige l'utilisateur sur le login si un userId n'a pas été trouvée.
  // Elle sert à protéger les routes
  // On vérifie l'existence d'une session en appellant la fonction getUserSession() définie plus haut. 
  // On store ensuite le userId avec la méthode session.get().
  // Si pas de userId, on redirige sur "/login",
  // sinon on retiyrb l'userId

  
  
  
  
  
  export async function createUserSession(
    userId: string,
    redirectTo: string
  ) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await storage.commitSession(session),
      },
    });
  }
  
  // La fonction createUserSession prend le userId et le redirectTo en isArgumentsObject. Elle redigige l'user trouvé après la création de la session. 
  // On utilise storage définit plus haut et on lui applique .getSession().
  // On stocke ensuite le userId dans la session avec la clé "userId", grâce à session.set()
  // On fait ensuite la redirection en ajoutant un header "Set-Cookie"
  // On obtient ce header en appelant storage.commitSession(session)
