import 'dotenv/config';
import { buildApp } from '../app';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import prisma from '../lib/prisma';
import { PrismaClient } from '@prisma/client';

// Mock the prisma module
jest.mock('../lib/prisma', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mockDeep } = require('jest-mock-extended');
    return {
        __esModule: true,
        default: mockDeep(),
    };
});

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('GET /api/tools', () => {
    let app: any;

    beforeAll(async () => {
        app = buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a list of tools', async () => {
        prismaMock.tool.findMany.mockResolvedValue([
            {
                id: 1,
                name: 'Test Tool',
                slug: 'test-tool',
                description: 'Test Description',
                website: 'https://test.com',
                pricing: 'Free',
                platforms: ['Web'],
                models_used: ['GPT-4'],
                logo_url: null,
                screenshots: [],
                verified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any
        ]);
        prismaMock.tool.count.mockResolvedValue(1);

        const response = await app.inject({
            method: 'GET',
            url: '/api/tools',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveLength(1);
        expect(body.data[0].name).toBe('Test Tool');
    });

    it('should filter tools by query', async () => {
        prismaMock.tool.findMany.mockResolvedValue([]);
        prismaMock.tool.count.mockResolvedValue(0);

        const response = await app.inject({
            method: 'GET',
            url: '/api/tools?query=test',
        });

        expect(response.statusCode).toBe(200);
    });
});
