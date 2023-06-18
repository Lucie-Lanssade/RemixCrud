import type { LoaderArgs } from "@remix-run/node";
//typage du Loader pour typescript
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
//ne pas oublier d'importer json, le loader et la db

//On cherche une note unique via "params" et on indique que l'id doit correspondre à "params.noteId".
export const loader = async ({ params }: LoaderArgs) => {
  const note = await db.note.findUnique({
    where: { id: params.noteId },
  });
  if (!note) {
    throw new Error("Note not found");
  }

  return json({ note });
};





function SingleNote() {
  const data = useLoaderData<typeof loader>();


  return (
    <div className="bg-slate-400">
        <p> {data.note.name}</p>
        <p>{data.note.dueDate.slice(0,-14)}</p>
        <p>{data.note.content}</p>
         <Link to=".">{data.note.name}Permalink</Link>
    </div>
  )
}
export default SingleNote