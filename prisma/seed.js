const { PrismaClient } = require("@prisma/client");
const { fakeBuyers } = require("./fakeBuyers"); // make sure this is JS too

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
    },
  });

  for (const buyer of fakeBuyers) {
    await prisma.buyer.create({
      data: {
        ...buyer,
        ownerId: owner.id,
      },
    });
  }

  console.log("Seeded user and buyers successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
