// ──────────────────────────────────────────────────────────────
// Seed script — creates a demo owner, branch, hall, and sample data
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    console.log("🌱 Seeding database for Prasad Food Divine...");
    const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);

    // ── Branch ──
    const branch = await prisma.branch.upsert({
        where: { id: "branch-main" },
        update: {},
        create: {
            id: "branch-main",
            name: "Grand Banquet — Main Branch",
            address: "123 Event Street",
            city: "Mumbai",
            phone: "+91-9876543210",
            email: "main@grandbanquet.com",
        },
    });

    // ── Owner user (link to Supabase auth later) ──
    const owner = await prisma.user.upsert({
        where: { id: "user-owner" },
        update: {},
        create: {
            id: "user-owner",
            authId: "supabase-auth-uid-placeholder",
            email: "owner@grandbanquet.com",
            passwordHash,
            name: "Raj Patel",
            phone: "+91-9876543210",
            role: "OWNER",
            branchId: null, // Owners see all branches
        },
    });

    // ── Branch Manager ──
    const manager = await prisma.user.upsert({
        where: { id: "user-manager" },
        update: {},
        create: {
            id: "user-manager",
            authId: "supabase-auth-uid-manager",
            email: "manager@grandbanquet.com",
            passwordHash,
            name: "Priya Sharma",
            phone: "+91-9876543211",
            role: "BRANCH_MANAGER",
            branchId: branch.id,
        },
    });

    // ── Halls ──
    await prisma.hall.upsert({
        where: { id: "hall-crystal" },
        update: {},
        create: {
            id: "hall-crystal",
            name: "Crystal Hall",
            capacity: 500,
            pricePerEvent: 150000,
            amenities: ["AC", "Stage", "Parking", "Bridal Room"],
            branchId: branch.id,
        },
    });

    await prisma.hall.upsert({
        where: { id: "hall-garden" },
        update: {},
        create: {
            id: "hall-garden",
            name: "Garden Terrace",
            capacity: 300,
            pricePerEvent: 100000,
            amenities: ["Open Air", "Fountain", "Parking"],
            branchId: branch.id,
        },
    });

    // ── Sample inventory items ──
    const rice = await prisma.inventoryItem.upsert({
        where: { id: "inv-rice" },
        update: {},
        create: {
            id: "inv-rice",
            name: "Basmati Rice",
            category: "Grain",
            unit: "kg",
            currentStock: 500,
            minStockLevel: 50,
            costPerUnit: 80,
            branchId: branch.id,
        },
    });

    const paneer = await prisma.inventoryItem.upsert({
        where: { id: "inv-paneer" },
        update: {},
        create: {
            id: "inv-paneer",
            name: "Paneer",
            category: "Dairy",
            unit: "kg",
            currentStock: 200,
            minStockLevel: 20,
            costPerUnit: 320,
            branchId: branch.id,
        },
    });

    // ── Sample menu items with ingredients ──
    await prisma.menuItem.upsert({
        where: { id: "menu-biryani" },
        update: {},
        create: {
            id: "menu-biryani",
            name: "Veg Biryani",
            category: "Main Course",
            pricePerPlate: 250,
            isVeg: true,
            branchId: branch.id,
            ingredients: {
                create: [
                    {
                        quantityPerServing: 0.15, // 150g rice per plate
                        unit: "kg",
                        inventoryItemId: rice.id,
                    },
                ],
            },
        },
    });

    await prisma.menuItem.upsert({
        where: { id: "menu-paneer" },
        update: {},
        create: {
            id: "menu-paneer",
            name: "Paneer Butter Masala",
            category: "Main Course",
            pricePerPlate: 300,
            isVeg: true,
            branchId: branch.id,
            ingredients: {
                create: [
                    {
                        quantityPerServing: 0.1, // 100g paneer per plate
                        unit: "kg",
                        inventoryItemId: paneer.id,
                    },
                ],
            },
        },
    });

    // ── Sample vendor ──
    await prisma.vendor.upsert({
        where: { id: "vendor-decor" },
        update: {},
        create: {
            id: "vendor-decor",
            name: "Royal Decorators",
            service: "Decoration",
            phone: "+91-9876543299",
            email: "royal@decorators.com",
            branchId: branch.id,
        },
    });

    // ── Sample Leads ──
    console.log("📝 Seeding Leads...");
    const lead1 = await prisma.lead.upsert({
        where: { id: "lead-sample-1" },
        update: {},
        create: {
            id: "lead-sample-1",
            customerName: "Amit Verma",
            customerPhone: "+91-9988776655",
            customerEmail: "amit@example.com",
            eventType: "Wedding",
            eventDate: new Date("2026-06-15"),
            guestCount: 200,
            status: "VISIT",
            source: "Website",
            branchId: branch.id,
            assignedToId: manager.id,
            createdById: manager.id,
        },
    });

    const lead2 = await prisma.lead.upsert({
        where: { id: "lead-sample-2" },
        update: {},
        create: {
            id: "lead-sample-2",
            customerName: "Sanjay Gupta",
            customerPhone: "+91-9988776644",
            customerEmail: "sanjay@example.com",
            eventType: "Corporate Meeting",
            eventDate: new Date("2026-04-20"),
            guestCount: 50,
            status: "ADVANCE",
            source: "Referral",
            branchId: branch.id,
            assignedToId: manager.id,
            createdById: manager.id,
        },
    });

    // ── Sample Bookings ──
    console.log("📅 Seeding Bookings...");
    const booking1 = await prisma.booking.upsert({
        where: { id: "booking-sample-1" },
        update: {},
        create: {
            id: "booking-sample-1",
            bookingNumber: "BK-2026-001",
            startDate: new Date("2026-04-20"),
            endDate: new Date("2026-04-20"),
            startTime: "10:00",
            endTime: "16:00",
            guestCount: 50,
            status: "CONFIRMED",
            totalAmount: 100000,
            advanceAmount: 20000,
            balanceAmount: 80000,
            branchId: branch.id,
            hallId: "hall-crystal",
            leadId: lead2.id,
            createdById: manager.id,
        },
    });

    // ── Sample Invoice & Payment ──
    console.log("🧾 Seeding Invoices & Payments...");
    const invoice1 = await prisma.invoice.upsert({
        where: { id: "inv-sample-1" },
        update: {},
        create: {
            id: "inv-sample-1",
            invoiceNumber: "INV-2026-001",
            subtotal: 84745.76,
            taxRate: 18,
            taxAmount: 15254.24,
            totalAmount: 100000,
            paidAmount: 20000,
            dueDate: new Date("2026-04-10"),
            status: "PARTIALLY_PAID",
            branchId: branch.id,
            bookingId: booking1.id,
        },
    });

    await prisma.payment.upsert({
        where: { id: "pay-sample-1" },
        update: {},
        create: {
            id: "pay-sample-1",
            amount: 20000,
            method: "UPI",
            type: "ADVANCE",
            invoiceId: invoice1.id,
            receivedById: manager.id,
        },
    });

    console.log("✅ Seed complete!");
    console.log(`   Branch: ${branch.name}`);
    console.log(`   Owner:  ${owner.name}`);
    console.log(`   Manager: ${manager.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
