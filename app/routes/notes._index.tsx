import { json } from "@remix-run/node"
import {Link, useLoaderData } from "@remix-run/react"
import { db } from "~/utils/db.server"


//Pour obtenir une note random, on crée un randomNumber qu'on passe dans notre requête puis on ne prend qu'une valeur.
export const loader=async () => {
const count= await db.note.count()

const randomRowNumber=Math.floor(Math.random()*count);

const [randomNote]= await db.note.findMany(
  {
    skip: randomRowNumber,
    take:1
  }
)

return json({randomNote})
  
}




function NotesIndexRoute() {
const data=useLoaderData <typeof loader>()
  return (
    <div>
        <p> Here's a random note:</p>
        <p>{data.randomNote.content}</p>
        <Link to={data.randomNote.id}>
           "{data.randomNote.name}" Permalink
        </Link>
    </div>
  )
}
export default NotesIndexRoute