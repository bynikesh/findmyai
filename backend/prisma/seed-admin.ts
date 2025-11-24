import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@findmyai.com';
    const password = 'admin';
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            passwordHash,
        },
        create: {
            email,
            passwordHash,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });

    console.log('Admin user seeded:', admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
