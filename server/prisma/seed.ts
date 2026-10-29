import { PrismaClient } from "@prisma/client";
import { challenges, chapters, defenseCards, subjects } from "./seed-data.js";

const prisma = new PrismaClient();

async function main() {
  // Challenges are upserted so re-running the seed adds new ones without losing your attempts.
  for (const c of challenges) {
    const { params, tests, hints, ...rest } = c;
    const data = {
      ...rest,
      starterCode: `function ${c.functionName}(${params}) {\n  // Your code here\n}\n`,
      tests: JSON.stringify(tests),
      hints: JSON.stringify(hints),
    };
    await prisma.challenge.upsert({ where: { slug: c.slug }, update: data, create: data });
  }

  // Study content is only created the first time, so your edits are never overwritten.
  if ((await prisma.subject.count()) === 0) {
    for (const s of subjects) {
      await prisma.subject.create({
        data: {
          name: s.name,
          topics: { create: s.topics.map((name) => ({ name })) },
          cards: { create: s.cards.map(([front, back]) => ({ front, back, deck: "exam" })) },
          questions: { create: s.questions.map(([question, modelAnswer]) => ({ question, modelAnswer })) },
        },
      });
    }
  }

  if ((await prisma.chapter.count()) === 0) {
    await prisma.chapter.createMany({ data: chapters.map((title, i) => ({ title, order: i + 1 })) });
    await prisma.card.createMany({ data: defenseCards.map(([front, back]) => ({ front, back, deck: "defense" })) });
  }

  console.log(`Seeded ${challenges.length} challenges, ${subjects.length} subjects, thesis chapters & defense cards.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
