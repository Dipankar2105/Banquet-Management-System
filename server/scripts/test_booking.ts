import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    try {
        const conflicts = await prisma.$queryRaw`
            SELECT id FROM bookings
            WHERE "hallId" = '123'
              AND status != 'CANCELLED'
            FOR UPDATE
        `;
        console.log("Success:", conflicts);
    } catch (e) {
        console.error("Error:", e);
    }
}
main().finally(() => process?.exit?.(0));
