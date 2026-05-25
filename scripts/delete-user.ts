/**
 * Usage: npx tsx scripts/delete-user.ts <email>
 * Deletes the user with given email and all related data (cascade).
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/delete-user.ts <email>");
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User with email "${email}" not found`);
    process.exit(1);
  }

  await db.user.delete({ where: { email } });
  console.log(`✓ User "${email}" and all related data deleted`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
