const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const list = await prisma.partitur.findMany({ take: 1 });
    if (list.length === 0) {
      console.log("No data");
      return;
    }
    const id = list[0].id;
    console.log("Found ID:", id);
    
    // Test update with asal_lagu
    await prisma.partitur.update({
      where: { id },
      data: {
        asal_lagu: "Test",
      }
    });
    console.log("Update SUCCESS for asal_lagu");
  } catch (e) {
    console.error("Update ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
