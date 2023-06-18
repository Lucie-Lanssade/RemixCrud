import { json } from "@remix-run/node";


import {Link,Outlet, useLoaderData} from "@remix-run/react"
//Outlet permet de faire des nested routes en partant de "notes"
//LoaderDatapermet de charger les données
//Link remplace "a" dans Remix

import { db } from "~/utils/db.server";
//ne pas oublier d'importer la db pour charger les données via le loader


//le loader va chercher toutes les notes dans la db
export const loader = async () => {
  return json({
    notesListItems: await db.note.findMany(),
  });
};

// Exemple de requête précise
// export const loader = async () => {
//   return json({
//     notesListItems: await db.note.findMany({
//       orderBy: { createdAt: "desc" },
//       select: { id: true, name: true },
//       take: 5,
//     }),
//   });
// };



export default function Notes() {

  const data = useLoaderData<typeof loader>();
  //ne pas oublier la notation <typeof loader> pour TypeScript



  return (
    <div>
      <header>
        <div>
          <h1>
          <Link to="/" title="My notes" aria-label="My notes">
            <img src="../../public/build/_assets/MyNotesLogo.png" alt="My notes logo"/>
          </Link>
          </h1>
         </div>
        
      </header>
   
      
        <main>
         <div>
          <div>
            <Link to=".">Get a random note</Link>
            <p>Here are all the notes in our system</p>
            <ul>
              {data.notesListItems.map(({id,name})=>{
                //contrairement au tuto, on doit rajouter un return sinon erreur TypeScript "impossible de retourner "void"
               return( <li key={id}>
                  <Link to={id}>{name}</Link>
                </li>)
              })}
            </ul>
            <Link to="new">
              Add your note
            </Link>
          </div>
          <div><Outlet/></div>
         </div>

            
        </main>
   
    </div>
  )
}
