import app from "./app";

const PORT = process.env.PORT || 5001;

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDb() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Prisma connected to Supabase PostgreSQL");
  } catch (error) {
    console.error("❌ Prisma connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDb();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
