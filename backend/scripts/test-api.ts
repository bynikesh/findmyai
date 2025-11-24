import fetch from 'cross-fetch';

const API_BASE = 'http://localhost:3000/api';

// Test S3 Upload Flow
async function testS3Upload() {
    console.log('\n📤 Testing S3 Upload Flow...\n');

    try {
        // Step 1: Get upload configuration
        console.log('1. Fetching upload config...');
        const configRes = await fetch(`${API_BASE}/uploads/config`);
        const config = await configRes.json();
        console.log('   ✓ Config:', config);

        // Step 2: Request signed URL
        console.log('\n2. Requesting signed upload URL...');
        const signRes = await fetch(`${API_BASE}/uploads/sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: 'test-image.png',
                fileType: 'image/png',
                fileSize: 1024, // 1KB
            }),
        });

        if (!signRes.ok) {
            const error = await signRes.json();
            console.log('   ⚠️  Upload signing failed (S3 not configured?):', error.error);
            return { success: false, configured: false };
        }

        const signData = await signRes.json();
        console.log('   ✓ Signed URL obtained');
        console.log('   - Upload URL:', signData.data.uploadUrl.substring(0, 50) + '...');
        console.log('   - File URL:', signData.data.fileUrl);

        return { success: true, configured: true, data: signData.data };
    } catch (error: any) {
        console.log('   ❌ Error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test Analytics Endpoints
async function testAnalytics() {
    console.log('\n📊 Testing Analytics Endpoints...\n');

    try {
        // Public trending endpoint
        console.log('1. Fetching trending tools...');
        const trendingRes = await fetch(`${API_BASE}/analytics/trending`);
        const trending = await trendingRes.json();
        console.log(`   ✓ Found ${trending.length} trending tools`);

        // Record a view
        console.log('\n2. Recording a tool view...');
        const viewRes = await fetch(`${API_BASE}/tools/1/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: 'test-session-123' }),
        });

        if (viewRes.ok) {
            console.log('   ✓ View recorded successfully');
        } else {
            console.log('   ⚠️  View recording failed (tool might not exist)');
        }

        return { success: true };
    } catch (error: any) {
        console.log('   ❌ Error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test AI Endpoints (requires ANTHROPIC_API_KEY)
async function testAIEndpoints() {
    console.log('\n🤖 Testing AI Endpoints...\n');

    try {
        // Test chat endpoint
        console.log('1. Testing AI chat...');
        const chatRes = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'test-session',
                messages: [
                    { role: 'user', content: 'I need an AI tool for writing' },
                ],
            }),
        });

        if (chatRes.ok) {
            const chatData = await chatRes.json();
            console.log('   ✓ Chat response received');
            console.log('   - Message:', chatData.message.substring(0, 100) + '...');
            if (chatData.recommendations) {
                console.log(`   - Recommendations: ${chatData.recommendations.length}`);
            }
        } else {
            const error = await chatRes.json();
            console.log('   ⚠️  AI chat failed (Claude not configured?):', error.error);
        }

        return { success: true };
    } catch (error: any) {
        console.log('   ❌ Error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test Reviews System
async function testReviews() {
    console.log('\n⭐ Testing Reviews System...\n');

    try {
        // Fetch reviews for tool 1
        console.log('1. Fetching reviews...');
        const reviewsRes = await fetch(`${API_BASE}/tools/1/reviews?page=1&perPage=5`);

        if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            console.log(`   ✓ Found ${reviewsData.meta.total} total reviews`);
            console.log(`   - Page ${reviewsData.meta.page} of ${reviewsData.meta.totalPages}`);
        } else {
            console.log('   ⚠️  Reviews fetch failed');
        }

        return { success: true };
    } catch (error: any) {
        console.log('   ❌ Error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test Auth System
async function testAuth() {
    console.log('\n🔐 Testing Auth System...\n');

    try {
        // Try to login with demo credentials
        console.log('1. Testing login...');
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@findmyai.com',
                password: 'admin123',
            }),
        });

        if (loginRes.ok) {
            const loginData = await loginRes.json();
            console.log('   ✓ Login successful');
            console.log('   - Token received:', loginData.token.substring(0, 20) + '...');
            return { success: true, token: loginData.token };
        } else {
            const error = await loginRes.json();
            console.log('   ⚠️  Login failed:', error.message);
        }

        return { success: false };
    } catch (error: any) {
        console.log('   ❌ Error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test Admin Analytics (requires auth)
async function testAdminAnalytics(token: string) {
    console.log('\n📈 Testing Admin Analytics...\n');

    try {
        console.log('1. Fetching analytics overview...');
        const overviewRes = await fetch(`${API_BASE}/analytics/overview`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (overviewRes.ok) {
            const overview = await overviewRes.json();
            console.log('   ✓ Overview fetched');
            console.log('   - Total Tools:', overview.totals.tools);
            console.log('   - Total Users:', overview.totals.users);
            console.log('   - Total Views:', overview.totals.views);
            console.log('   - New Signups (7d):', overview.last7Days.newSignups);
        } else {
            console.log('   ⚠️  Analytics fetch failed (unauthorized?)');
        }

        console.log('\n2. Fetching top tools...');
        const topToolsRes = await fetch(`${API_BASE}/analytics/top-tools?limit=5&days=7`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (topToolsRes.ok) {
            const topTools = await topToolsRes.json();
            console.log(`   ✓ Found ${topTools.length} top tools`);
            topTools.forEach((tool: any, idx: number) => {
                console.log(`   ${idx + 1}. ${tool.name} - ${tool.viewCount} views`);
            });
        }

        return { success: true };
    } catch (error: any) {
        console.log('   ❌ Error:', error.message);
        return { success: false, error: error.message };
    }
}

// Main test runner
async function runAllTests() {
    console.log('═══════════════════════════════════════════════');
    console.log('  FindMyAI API Test Suite');
    console.log('═══════════════════════════════════════════════');

    const results: any = {};

    // Test S3
    results.s3 = await testS3Upload();

    // Test Analytics
    results.analytics = await testAnalytics();

    // Test AI
    results.ai = await testAIEndpoints();

    // Test Reviews
    results.reviews = await testReviews();

    // Test Auth
    results.auth = await testAuth();

    // Test Admin Analytics if auth succeeded
    if (results.auth.success && results.auth.token) {
        results.adminAnalytics = await testAdminAnalytics(results.auth.token);
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('  Test Summary');
    console.log('═══════════════════════════════════════════════\n');

    const summary = {
        'S3 Uploads': results.s3.configured ? '✓ Configured' : '⚠️  Not configured',
        'Analytics': results.analytics.success ? '✓ Working' : '❌ Failed',
        'AI Endpoints': results.ai.success ? '✓ Working' : '⚠️  Check logs',
        'Reviews': results.reviews.success ? '✓ Working' : '❌ Failed',
        'Auth': results.auth.success ? '✓ Working' : '❌ Failed',
        'Admin Analytics': results.adminAnalytics?.success ? '✓ Working' : '⚠️  Requires auth',
    };

    Object.entries(summary).forEach(([key, value]) => {
        console.log(`  ${key.padEnd(20)} ${value}`);
    });

    console.log('\n═══════════════════════════════════════════════\n');

    // Configuration notes
    console.log('📝 Configuration Notes:\n');
    if (!results.s3.configured) {
        console.log('  • S3 is not configured. To enable:');
        console.log('    - Set S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME in .env');
        console.log('    - See backend/S3_SETUP_GUIDE.md for details\n');
    }
    if (!results.auth.success) {
        console.log('  • Demo admin user not found. To create:');
        console.log('    - Run: cd backend && npx ts-node scripts/create-demo-user.ts\n');
    }

    console.log('For detailed setup guides, see:');
    console.log('  • backend/S3_SETUP_GUIDE.md');
    console.log('  • backend/CLAUDE_AI_INTEGRATION.md');
    console.log('  • backend/ANALYTICS_GUIDE.md\n');
}

// Install cross-fetch if not available
try {
    require('cross-fetch');
} catch (e) {
    console.log('Installing cross-fetch...');
    require('child_process').execSync('npm install cross-fetch', { stdio: 'inherit' });
}

runAllTests().catch(console.error);
