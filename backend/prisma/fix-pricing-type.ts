import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPricingTypeData() {
    console.log('🔄 Starting pricing_type data migration...\n');

    try {
        // First, let's see how many tools need fixing
        // We use raw SQL because Prisma can't query malformed data
        const result = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "Tool" WHERE pricing_type IS NOT NULL
        `;

        console.log(`📊 Total tools with pricing_type: ${result[0].count}`);

        // Fix the data using raw SQL
        // This converts any scalar text values to proper PostgreSQL text arrays
        const updateResult = await prisma.$executeRaw`
            UPDATE "Tool" 
            SET pricing_type = CASE 
                WHEN pricing_type::text = 'Free' THEN ARRAY['Free']::text[]
                WHEN pricing_type::text = 'Paid' THEN ARRAY['Paid']::text[]
                WHEN pricing_type::text = 'Freemium' THEN ARRAY['Freemium']::text[]
                WHEN pricing_type::text = 'Trial' THEN ARRAY['Trial']::text[]
                WHEN pricing_type::text = 'API' THEN ARRAY['API']::text[]
                WHEN pricing_type::text = 'Lifetime' THEN ARRAY['Lifetime']::text[]
                WHEN pricing_type::text = 'Open Source' THEN ARRAY['Open Source']::text[]
                WHEN pricing_type::text = 'One-time' THEN ARRAY['One-time']::text[]
                ELSE pricing_type
            END
            WHERE pricing_type IS NOT NULL
        `;

        console.log(`✅ Updated ${updateResult} tools`);

        // Verify the fix by trying to fetch tools
        const tools = await prisma.tool.findMany({
            take: 5,
            select: {
                name: true,
                pricing_type: true,
            },
        });

        console.log('\n📋 Sample tools after migration:');
        tools.forEach(tool => {
            console.log(`  - ${tool.name}: ${JSON.stringify(tool.pricing_type)}`);
        });

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);

        // Try an alternative approach if the above fails
        console.log('\n🔄 Trying alternative fix...');
        try {
            // This approach handles the case where the column might already be an array
            // but some values are malformed
            await prisma.$executeRaw`
                UPDATE "Tool" 
                SET pricing_type = ARRAY['Free']::text[]
                WHERE pricing_type IS NULL OR array_length(pricing_type, 1) IS NULL
            `;
            console.log('✅ Alternative fix applied!');
        } catch (altError) {
            console.error('❌ Alternative fix also failed:', altError);
        }
    } finally {
        await prisma.$disconnect();
    }
}

fixPricingTypeData();
