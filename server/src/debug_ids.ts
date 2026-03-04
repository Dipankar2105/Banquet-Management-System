import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const owner = await prisma.user.findFirst({
        where: { role: "OWNER" },
        select: { id: true, email: true }
    });
    console.log("OWNER_ID:" + owner?.id);
    console.log("OWNER_EMAIL:" + owner?.email);

    const branch = await prisma.branch.findFirst({
        select: { id: true }
    });
    console.log("BRANCH_ID:" + branch?.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
