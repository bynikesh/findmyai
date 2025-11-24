import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@findmyai.com';
    const password = 'admin123';
    const name = 'Admin User';

    // Check if user already exists
    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        console.log(`User ${email} already exists!`);
        return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            name,
            role: 'ADMIN',
        },
    });

    console.log('✅ Demo admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('');
    console.log('User details:', user);
}

main()
    .catch((e) => {
        console.error('Error creating demo user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
