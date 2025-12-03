import 'dotenv/config';
import { buildApp } from '../app';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import prisma from '../lib/prisma';
import { PrismaClient } from '@prisma/client';

// Mock the prisma module
jest.mock('../lib/prisma', () => {
    const { mockDeep } = require('jest-mock-extended');
    return {
        __esModule: true,
        default: mockDeep(),
    };
});

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('GET /api/tools/:id/reviews', () => {
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

    it('should pass correct skip value (0) to prisma when page is 0', async () => {
        // If page=0, it should be treated as page=1.
        // pageNum = 1.
        // skip = 0.

        prismaMock.review.findMany.mockResolvedValue([]);
        prismaMock.review.count.mockResolvedValue(0);

        const response = await app.inject({
            method: 'GET',
            url: '/api/tools/1/reviews?page=0',
        });

        expect(prismaMock.review.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 0
            })
        );
        expect(response.statusCode).toBe(200);
    });

    it('should pass correct skip value (0) to prisma when page is negative', async () => {
        // If page=-1, it should be treated as page=1.
        // skip = 0.

        prismaMock.review.findMany.mockResolvedValue([]);
        prismaMock.review.count.mockResolvedValue(0);

        const response = await app.inject({
            method: 'GET',
            url: '/api/tools/1/reviews?page=-1',
        });

        expect(prismaMock.review.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 0
            })
        );
        expect(response.statusCode).toBe(200);
    });

    it('should pass correct skip value (0) to prisma when page is not a number', async () => {
        // If page='abc', it should be treated as page=1.
        // skip = 0.

        prismaMock.review.findMany.mockResolvedValue([]);
        prismaMock.review.count.mockResolvedValue(0);

        const response = await app.inject({
            method: 'GET',
            url: '/api/tools/1/reviews?page=abc',
        });

        expect(prismaMock.review.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 0
            })
        );
        expect(response.statusCode).toBe(200);
    });
});
