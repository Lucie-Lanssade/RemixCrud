import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();


async function seed() {

//On créé un nouvel user (ref au modèle "db.user") dans la database. cet objet "data" contient les propriétés "username" & "passwordHash"
const kody = await db.user.create({
    data: {
      username: "kody",
      // this is a hashed version of "twixrox"
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    },
  });


// On associe les notes au user "kody".Retourne un objet data contenant l'objet note:(name, content & dueDate) + l'authorId correspondant à kody.
// On créé ensuite l'objet "data" dans la db au moment du return
await Promise.all(
    getNotes().map((note) => {
      const data={authorId:kody.id,...note}
      return db.note.create({ data });
    })
  );
}

seed();

function getNotes(){
    return [
        {name:"lessive", content:"lessive blanc, couleur, délicat", dueDate: "2023-06-23T10:20:30.451Z"},
        {name:"gâteau", content:"faire un gâteau au chocolat et le décorer", dueDate: "2023-06-22T10:20:30.451Z"},
        {name:"sport", content:"renfo musculaire, yoga, course, weights", dueDate: "2023-06-21T10:20:30.451Z"},
        {name:"coiffeur", content:"booker coiffeur", dueDate: "23/06/2023"},
        {name:"dentiste", content:"booker dentiste, dder devis onlays", dueDate: "2023-06-23T10:20:30.451Z"},
        {name:"rangement armoire", content:"reorga armoires cuisine, dressing", dueDate: "2023-06-20T10:20:30.451Z"},
        {name:"location", content:"résa voiture bretagne", dueDate: "25/06/2023"},
       
    ]
}
