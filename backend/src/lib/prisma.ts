import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful connection handling
let isConnected = false;

async function connectWithRetry(retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect();
            isConnected = true;
            console.log('✅ Database connected successfully');
            return;
        } catch (error) {
            console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, error);
            if (i < retries - 1) {
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error('⚠️  Database connection failed after all retries. Server will start but DB operations may fail.');
}

// Connect on module load (non-blocking)
connectWithRetry().catch(err => {
    console.error('Failed to connect to database:', err);
});

// Graceful shutdown
process.on('beforeExit', async () => {
    if (isConnected) {
        await prisma.$disconnect();
        console.log('Database disconnected');
    }
});

export default prisma;
