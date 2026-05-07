import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Creating Super Admin...");

    // Create organization
    const organization = await prisma.organization.create({
        data: {
            name: "Irish Expert",
        },
    });

    console.log("✅ Organization created");

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Create super admin
    const admin = await prisma.user.create({
        data: {
            name: "Super Admin",
            email: "admin@irishexpert.com",
            password: hashedPassword,
            role: "super_admin",

            organization: {
                connect: {
                    id: organization.id,
                },
            },
        },
    });

    console.log("✅ Super admin created");

    console.log({
        organization: organization.name,
        admin: {
            email: admin.email,
            password: "Admin@123",
            role: admin.role,
        },
    });
}

main()
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });