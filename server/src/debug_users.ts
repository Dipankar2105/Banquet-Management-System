import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true }
    });
    console.log("Users in DB:", JSON.stringify(users, null, 2));

    const branches = await prisma.branch.findMany({
        select: { id: true, name: true }
    });
    console.log("Branches in DB:", JSON.stringify(branches, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
