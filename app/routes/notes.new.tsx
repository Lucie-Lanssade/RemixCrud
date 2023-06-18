import { redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { Form } from "@remix-run/react"
//On import action,redirect, la db et le form quand il y a un form/
import { requireUserId } from "~/utils/session.server";
// On importe la fonction requireUserId pour autoriser la création uniquement si la session du user est active

import { useActionData } from "@remix-run/react";
import { badRequest } from "~/utils/request.server";
//on créé une helper function "bad request" dans le dossier "utils"



//On créé des fonctions pour valider chaque input côté client.
function validateNoteContent(content: string) {
  if (content.length < 10) {
    return "The content of your note is too short";
  }
}


function validateNoteName(content: string) {
  if (content.length < 6) {
    return "The name of your note is too short";
  }
}

function validateNoteDueDate(content: string) {
  if (content.length < 10) {
    return 'Please provide a due date in the following format: "YYYY/MM/DD"';
  }
}





export const action = async ({ request }: ActionArgs) => {
    const userId = await requireUserId(request);
    // On initialise notre userId dans l'action pour pouvoir ajouter userId à la création de la note
    const form = await request.formData();
    const content = form.get("content");
    const name = form.get("name");
    const dueDate=form.get('dueDate')
    
    
    
    //type checking des input fields pour TypeScript
    if (
        typeof content !== "string" ||
        typeof name !== "string" ||
        typeof dueDate !== "string"
        ) {
            return badRequest({
                fieldErrors: null,
                fields: null,
                formError: "Form not submitted correctly.",
            });
            
        }
        
        // fieldErrors contient nos 3 fonctions de validation d'input
        const fieldErrors= {
        content:validateNoteContent(content),
        name:validateNoteName(name),
        dueDate:validateNoteDueDate(dueDate)};

         
        //création d'une const regroupant tous les input fields dans un objet "fields"
          const fields = { content, name, dueDate };
        
         if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }
        
        
        
       
        
  //Si les checks sont passés, on créé une nouvelle note contenant les fields définis plus haut
  const note = await db.note.create({ data:{...fields,authorId:userId }});
  // On rajoute la key/value pair authorId:userId aux fields via le spread operator. authoriD est initialisé dans le schéma Prisma/ model "Note"



  //on redirige vers la nouvelle note. On utilise redirect pour éviter d'avoir le message "confirm resubmission" si l'action s'est bien passée
  return redirect(`/notes/${note.id}`);
};




function NewNoteRoute() {
  const actionData = useActionData<typeof action>();
  //On utilise actionData pour pouvoir activer le form et la vérification des données

  return (
    <>
    <p>Add your note here!</p>
    <Form method="post">
        <div>
        <label> Name:
            <input
            defaultValue={actionData?.fields?.name}
            //la default value est récupérée par actionData.
            type="text" name="name"
            //le name permet de récupérer le contenu des inputs
            aria-invalid={Boolean(
                actionData?.fieldErrors?.name)}
            //Initialisation du bolean qui verifie si l'input satisfait aux conditions préféfinies dans fieldErrors
             aria-errormessage={
                actionData?.fieldErrors?.name
                  ? "name-error"
                  : undefined
              }
            //messages d'erreurs (par ordre de spécificité: fiedError > "name-error"> "undefined")
            
        
            />
        </label>
        {actionData?.fieldErrors?.name ? (
            <p
             
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        {/* Affichage du message d'erreur dans un <p si fieldErrors true */}

        <label> Content:
            <input type="textarea" 
             defaultValue={actionData?.fields?.content}
            name="content"
             aria-invalid={Boolean(
                actionData?.fieldErrors?.content)}
             aria-errormessage={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }

            ></input>
        </label> 
         {actionData?.fieldErrors?.content ? (
            <p
             
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}


         <label>Due date:
            <input type="text" name="dueDate"
             defaultValue={actionData?.fields?.dueDate}
             aria-invalid={Boolean(
                actionData?.fieldErrors?.dueDate)}
             aria-errormessage={
                actionData?.fieldErrors?.dueDate
                  ? "date-error"
                  : undefined
              } />


        </label>
          {actionData?.fieldErrors?.dueDate ? (
            <p
             
              id="date-error"
              role="alert"
            >
              {actionData.fieldErrors.dueDate}
            </p>
          ) : null}
        </div>
        <div>
            <button type="submit" className="button">Add</button>
        </div>

    </Form>
    </>
  )
}
export default NewNoteRoute