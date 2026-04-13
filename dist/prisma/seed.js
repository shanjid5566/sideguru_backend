"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connectionString = `${process.env.DATABASE_URL || ""}`;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const getRelativeDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
};
async function main() {
    console.log("🌱 Starting database seeding...\n");
    console.log("📍 Creating countries...");
    const usa = await prisma.country.upsert({
        where: { name: "United States" },
        update: {},
        create: {
            name: "United States",
        },
    });
    const canada = await prisma.country.upsert({
        where: { name: "Canada" },
        update: {},
        create: {
            name: "Canada",
        },
    });
    const uk = await prisma.country.upsert({
        where: { name: "United Kingdom" },
        update: {},
        create: {
            name: "United Kingdom",
        },
    });
    console.log("✅ Countries created");
    console.log("\n📍 Creating regions...");
    const california = await prisma.region.upsert({
        where: { name_countryId: { name: "California", countryId: usa.id } },
        update: {},
        create: {
            name: "California",
            countryId: usa.id,
        },
    });
    const newYork = await prisma.region.upsert({
        where: { name_countryId: { name: "New York", countryId: usa.id } },
        update: {},
        create: {
            name: "New York",
            countryId: usa.id,
        },
    });
    const texas = await prisma.region.upsert({
        where: { name_countryId: { name: "Texas", countryId: usa.id } },
        update: {},
        create: {
            name: "Texas",
            countryId: usa.id,
        },
    });
    const ontario = await prisma.region.upsert({
        where: { name_countryId: { name: "Ontario", countryId: canada.id } },
        update: {},
        create: {
            name: "Ontario",
            countryId: canada.id,
        },
    });
    const london = await prisma.region.upsert({
        where: { name_countryId: { name: "London", countryId: uk.id } },
        update: {},
        create: {
            name: "London",
            countryId: uk.id,
        },
    });
    console.log("✅ Regions created");
    console.log("\n💳 Creating pricing plans...");
    await prisma.pricingPlan.upsert({
        where: { id: "introductory-plan-seed" },
        update: {
            title: "First 3 months introductory price",
            price: 0.99,
            duration: 30,
            isActive: true,
        },
        create: {
            id: "introductory-plan-seed",
            title: "First 3 months introductory price",
            price: 0.99,
            duration: 30,
            isActive: true,
        },
    });
    await prisma.pricingPlan.upsert({
        where: { id: "standard-plan-seed" },
        update: {
            title: "Standard Price",
            price: 2.99,
            duration: 30,
            isActive: true,
        },
        create: {
            id: "standard-plan-seed",
            title: "Standard Price",
            price: 2.99,
            duration: 30,
            isActive: true,
        },
    });
    console.log("✅ Pricing plans created");
    console.log("\n👤 Creating admin user...");
    const adminPassword = await bcryptjs_1.default.hash("Admin@123", 10);
    await prisma.user.upsert({
        where: { email: "admin@sidegurus.com" },
        update: {
            fullName: "Admin User",
            password: adminPassword,
            phoneNumber: "+1-555-0001",
            role: "ADMIN",
            profileImage: null,
            isEmailVerified: true,
        },
        create: {
            fullName: "Admin User",
            email: "admin@sidegurus.com",
            password: adminPassword,
            phoneNumber: "+1-555-0001",
            role: "ADMIN",
            profileImage: null,
            isEmailVerified: true,
        },
    });
    console.log("✅ Admin user created");
    console.log("   Email: admin@sidegurus.com");
    console.log("   Password: Admin@123");
    console.log("\n👥 Creating demo users...");
    const userPassword = await bcryptjs_1.default.hash("User@123", 10);
    const demoUsers = [
        { fullName: "John Doe", email: "john.doe@example.com", phoneNumber: "+1-555-1001" },
        { fullName: "Jane Smith", email: "jane.smith@example.com", phoneNumber: "+1-555-1002" },
        { fullName: "Kevin", email: "kevin@example.com", phoneNumber: "+1-202-555-0118" },
        { fullName: "Abdur Rahman", email: "abdurrahman21266057@gmail.com", phoneNumber: "+1-202-555-0134" },
    ];
    const createdUsers = [];
    for (const demoUser of demoUsers) {
        const user = await prisma.user.upsert({
            where: { email: demoUser.email },
            update: {
                fullName: demoUser.fullName,
                password: userPassword,
                phoneNumber: demoUser.phoneNumber,
                role: "USER",
                profileImage: null,
                isEmailVerified: true,
            },
            create: {
                ...demoUser,
                password: userPassword,
                role: "USER",
                profileImage: null,
                isEmailVerified: true,
            },
        });
        createdUsers.push(user);
    }
    const [user1, user2, user3, user4] = createdUsers;
    console.log("✅ Demo users created");
    console.log("   User 1 - Email: john.doe@example.com | Password: User@123");
    console.log("   User 2 - Email: jane.smith@example.com | Password: User@123");
    console.log("   User 3 - Email: kevin@example.com | Password: User@123");
    console.log("   User 4 - Email: abdurrahman21266057@gmail.com | Password: User@123");
    console.log("\n📂 Creating categories and subcategories...");
    const categorySeedData = [
        {
            name: "Home Improvement & Repair Services",
            type: "SERVICE",
            image: "/uploads/categories/images/9c1cc24b620b26174a291fc8b5f732b47625e139.jpg",
            subcategories: ["Plumbing", "Electrical Work", "Painting", "Kitchen Remodeling / Bathroom Remodeling", "Other"],
        },
        {
            name: "Business & Professional Services",
            type: "SERVICE",
            image: "/uploads/categories/images/a23a72933e4847daa1bb6f60ed025816e5e4b586.jpg",
            subcategories: ["Business Consultant", "SEO & Digital Marketing Services", "Graphic Design", "Other"],
        },
        {
            name: "Event Services",
            type: "SERVICE",
            image: "/uploads/categories/images/event-management-service.jpg",
            subcategories: ["Photographer", "Videographer", "Wedding Planner", "Other"],
        },
        {
            name: "Health & Wellness",
            type: "SERVICE",
            image: "/uploads/categories/images/Discover_a_transformative_approach_to_health_and.webp",
            subcategories: ["Personal Trainer", "Yoga Instructor", "Other"],
        },
        {
            name: "Pet Services",
            type: "SERVICE",
            image: "/uploads/categories/images/j-balla-photography-F57xLufncj8-unsplash.jpg",
            subcategories: ["Dog Walker", "Pet Groomer", "Other"],
        },
    ];
    const eventCategoriesData = [
        { name: "Weddings", type: "EVENT", image: "/uploads/categories/images/1774928653612-download-3-.jpg" },
        { name: "Birthday Parties", type: "EVENT", image: "/uploads/events/images/1774929558172-download.jpg" },
        { name: "Corporate Events", type: "EVENT", image: "/uploads/categories/images/consultant-running-a-small-workshop-with-a-team-of-employees-scaled.jpg" },
        { name: "Conferences", type: "EVENT", image: "/uploads/events/images/1774929558172-download-1-.jpg" },
        { name: "concerts", type: "EVENT", image: "/uploads/categories/images/event-management-service.jpg" },
    ];
    for (const catData of categorySeedData) {
        const category = await prisma.category.upsert({
            where: { name: catData.name },
            update: { image: catData.image },
            create: {
                name: catData.name,
                type: catData.type,
                image: catData.image,
            },
        });
        await prisma.subCategory.deleteMany({ where: { categoryId: category.id } });
        for (const subName of catData.subcategories) {
            await prisma.subCategory.create({
                data: {
                    name: subName,
                    categoryId: category.id,
                },
            });
        }
    }
    console.log("✅ Categories and subcategories created");
    for (const eventCat of eventCategoriesData) {
        await prisma.category.upsert({
            where: { name: eventCat.name },
            update: { image: eventCat.image },
            create: {
                name: eventCat.name,
                type: eventCat.type,
                image: eventCat.image,
            },
        });
    }
    console.log("✅ Event categories created");
    console.log("\n🧪 Creating demo service listings...");
    const eventServicesCategory = await prisma.category.findFirst({
        where: { name: "Event Services", type: "SERVICE" },
    });
    const videographerSubCategory = eventServicesCategory
        ? await prisma.subCategory.findFirst({
            where: { categoryId: eventServicesCategory.id, name: "Videographer" },
        })
        : null;
    if (eventServicesCategory && videographerSubCategory) {
        const activePublishedAt = getRelativeDate(-10);
        const activeExpiresAt = getRelativeDate(20);
        const expiredPublishedAt = getRelativeDate(-40);
        const expiredExpiresAt = getRelativeDate(-10);
        await prisma.listing.upsert({
            where: { id: "seed-service-active-listing" },
            update: {
                title: "Seed Active Videographer",
                description: "Demo approved service listing that is still active for frontend testing.",
                price: 299,
                listingType: "SERVICE",
                status: "APPROVED",
                countryId: usa.id,
                regionId: california.id,
                address: "123 Sunset Blvd, Los Angeles, CA",
                contactEmail: "john.doe@example.com",
                contactPhone: "+1-555-1001",
                facebookUrl: null,
                instagramUrl: "https://instagram.com/seedvideographer",
                mainImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                serviceImages: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"],
                gallery: [
                    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
                    "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
                ],
                userId: user1.id,
                categoryId: eventServicesCategory.id,
                subCategoryId: videographerSubCategory.id,
                publishedAt: activePublishedAt,
                expiresAt: activeExpiresAt,
                deletedAt: null,
            },
            create: {
                id: "seed-service-active-listing",
                title: "Seed Active Videographer",
                description: "Demo approved service listing that is still active for frontend testing.",
                price: 299,
                listingType: "SERVICE",
                status: "APPROVED",
                countryId: usa.id,
                regionId: california.id,
                address: "123 Sunset Blvd, Los Angeles, CA",
                contactEmail: "john.doe@example.com",
                contactPhone: "+1-555-1001",
                facebookUrl: null,
                instagramUrl: "https://instagram.com/seedvideographer",
                mainImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                serviceImages: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"],
                gallery: [
                    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
                    "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
                ],
                userId: user1.id,
                categoryId: eventServicesCategory.id,
                subCategoryId: videographerSubCategory.id,
                publishedAt: activePublishedAt,
                expiresAt: activeExpiresAt,
            },
        });
        await prisma.payment.upsert({
            where: { stripeSessionId: "seed-payment-active-listing" },
            update: {
                amount: 2.99,
                status: "SUCCESS",
                listingId: "seed-service-active-listing",
                userId: user1.id,
            },
            create: {
                stripeSessionId: "seed-payment-active-listing",
                amount: 2.99,
                status: "SUCCESS",
                listingId: "seed-service-active-listing",
                userId: user1.id,
            },
        });
        await prisma.subscription.upsert({
            where: { listingId: "seed-service-active-listing" },
            update: {
                planType: "Standard Price",
                startDate: activePublishedAt,
                endDate: activeExpiresAt,
                isActive: true,
            },
            create: {
                listingId: "seed-service-active-listing",
                planType: "Standard Price",
                startDate: activePublishedAt,
                endDate: activeExpiresAt,
                isActive: true,
            },
        });
        await prisma.listing.upsert({
            where: { id: "seed-service-expired-listing" },
            update: {
                title: "Seed Expired Videographer",
                description: "Demo expired service listing for renewal flow testing.",
                price: 199,
                listingType: "SERVICE",
                status: "EXPIRED",
                countryId: usa.id,
                regionId: newYork.id,
                address: "456 Broadway, New York, NY",
                contactEmail: "abdurrahman21266057@gmail.com",
                contactPhone: "+1-202-555-0134",
                facebookUrl: null,
                instagramUrl: "https://instagram.com/expiredvideographer",
                mainImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
                serviceImages: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32"],
                gallery: [
                    "https://images.unsplash.com/photo-1505236858219-8359eb29e329",
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
                ],
                userId: user4.id,
                categoryId: eventServicesCategory.id,
                subCategoryId: videographerSubCategory.id,
                publishedAt: expiredPublishedAt,
                expiresAt: expiredExpiresAt,
                deletedAt: null,
            },
            create: {
                id: "seed-service-expired-listing",
                title: "Seed Expired Videographer",
                description: "Demo expired service listing for renewal flow testing.",
                price: 199,
                listingType: "SERVICE",
                status: "EXPIRED",
                countryId: usa.id,
                regionId: newYork.id,
                address: "456 Broadway, New York, NY",
                contactEmail: "abdurrahman21266057@gmail.com",
                contactPhone: "+1-202-555-0134",
                facebookUrl: null,
                instagramUrl: "https://instagram.com/expiredvideographer",
                mainImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
                serviceImages: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32"],
                gallery: [
                    "https://images.unsplash.com/photo-1505236858219-8359eb29e329",
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
                ],
                userId: user4.id,
                categoryId: eventServicesCategory.id,
                subCategoryId: videographerSubCategory.id,
                publishedAt: expiredPublishedAt,
                expiresAt: expiredExpiresAt,
            },
        });
        await prisma.payment.upsert({
            where: { stripeSessionId: "seed-payment-expired-listing" },
            update: {
                amount: 2.99,
                status: "SUCCESS",
                listingId: "seed-service-expired-listing",
                userId: user4.id,
            },
            create: {
                stripeSessionId: "seed-payment-expired-listing",
                amount: 2.99,
                status: "SUCCESS",
                listingId: "seed-service-expired-listing",
                userId: user4.id,
            },
        });
        await prisma.subscription.upsert({
            where: { listingId: "seed-service-expired-listing" },
            update: {
                planType: "Standard Price",
                startDate: expiredPublishedAt,
                endDate: expiredExpiresAt,
                isActive: false,
            },
            create: {
                listingId: "seed-service-expired-listing",
                planType: "Standard Price",
                startDate: expiredPublishedAt,
                endDate: expiredExpiresAt,
                isActive: false,
            },
        });
        console.log("✅ Demo service listings created");
    }
    console.log("\n🧪 Creating demo expired event listing...");
    const weddingsEventCategory = await prisma.category.findFirst({
        where: { name: "Weddings", type: "EVENT" },
    });
    if (weddingsEventCategory) {
        const eventPublishedAt = getRelativeDate(-45);
        const eventStartDate = getRelativeDate(-30);
        const eventEndDate = getRelativeDate(-29);
        const eventExpiresAt = getRelativeDate(-10);
        await prisma.listing.upsert({
            where: { id: "seed-event-expired-listing" },
            update: {
                title: "Seed Expired Wedding Event",
                description: "Demo expired event listing linked to requested email for event renewal flow testing.",
                price: 399,
                listingType: "EVENT",
                status: "EXPIRED",
                countryId: usa.id,
                regionId: california.id,
                address: "789 Ocean View Ave, Santa Monica, CA",
                contactEmail: "abdurrahman21266057@gmail.com",
                contactPhone: "+1-202-555-0134",
                facebookUrl: null,
                instagramUrl: "https://instagram.com/expiredeventseed",
                startDate: eventStartDate,
                endDate: eventEndDate,
                mainImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
                serviceImages: ["https://images.unsplash.com/photo-1519741497674-611481863552"],
                gallery: [
                    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
                    "https://images.unsplash.com/photo-1472653431158-6364773b2a56",
                ],
                userId: user4.id,
                categoryId: weddingsEventCategory.id,
                subCategoryId: null,
                publishedAt: eventPublishedAt,
                expiresAt: eventExpiresAt,
                deletedAt: null,
            },
            create: {
                id: "seed-event-expired-listing",
                title: "Seed Expired Wedding Event",
                description: "Demo expired event listing linked to requested email for event renewal flow testing.",
                price: 399,
                listingType: "EVENT",
                status: "EXPIRED",
                countryId: usa.id,
                regionId: california.id,
                address: "789 Ocean View Ave, Santa Monica, CA",
                contactEmail: "abdurrahman21266057@gmail.com",
                contactPhone: "+1-202-555-0134",
                facebookUrl: null,
                instagramUrl: "https://instagram.com/expiredeventseed",
                startDate: eventStartDate,
                endDate: eventEndDate,
                mainImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
                serviceImages: ["https://images.unsplash.com/photo-1519741497674-611481863552"],
                gallery: [
                    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
                    "https://images.unsplash.com/photo-1472653431158-6364773b2a56",
                ],
                userId: user4.id,
                categoryId: weddingsEventCategory.id,
                publishedAt: eventPublishedAt,
                expiresAt: eventExpiresAt,
            },
        });
    }
    console.log("\n✨ Database seeding completed successfully!\n");
}
main()
    .catch((error) => {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
