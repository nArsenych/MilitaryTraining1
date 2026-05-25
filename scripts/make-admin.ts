/**
 * Usage: npx tsx scripts/make-admin.ts <email>
 * Sets the user with given email to ADMIN role.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/make-admin.ts <email>");
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User with email "${email}" not found`);
    process.exit(1);
  }

  await db.user.update({
    where: { email },
    data: { role: "ADMIN", emailVerified: true, verificationToken: null },
  });
  console.log(`✓ User "${email}" is now ADMIN (email auto-verified)`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
