import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all(
    getLoglines().map((logline) => {
      return db.logline.create({ data: logline });
    })
  );
}

seed();

function getLoglines() {
  return [
    {
      name: "Forrest Gump",
      content: `Several historical events from the 20th Century unfold from the perspective of an Alabama man with an IQ of 75, whose only real desire is to reunite with his childhood sweetheart.`,
    },
    {
      name: "The Godfather",
      content: `The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.`,
    },
    {
      name: "Titanic",
      content: `A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.`,
    },
    {
      name: "The Unforgivable",
      content: `After serving a prison sentence for a violent crime, a woman attempts to re-enter society and put her life back together in a world that refuses to forgive her past.`,
    },
    {
      name: "The Help",
      content: `During the civil rights movement of the 1960s, an aspiring author decides to write a book detailing the African American maids’ point of view on the white families for whom they work.`,
    },
    {
      name: "American Beauty",
      content: `A depressed suburban father in a mid-life crisis decides to turn his life around after becoming infatuated with his daughter’s attractive friend.`,
    },
    {
      name: "Moonlight",
      content: `A young African-American man grapples with his identity and sexuality while experiencing the everyday struggles of childhood, adolescence, and burgeoning adulthood.`,
    },
  ];
}