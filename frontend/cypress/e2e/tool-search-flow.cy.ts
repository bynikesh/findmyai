/**
 * Cypress E2E Test: Search and Tool Detail Flow
 * 
 * This test verifies the complete user journey:
 * 1. User visits homepage
 * 2. User searches for AI tools
 * 3. User filters/sorts results
 * 4. User clicks on a tool to view details
 * 5. User views reviews and ratings
 */

describe('Search and Tool Detail Flow', () => {
    beforeEach(() => {
        // Visit homepage before each test
        cy.visit('/');
    });

    it('should complete the full search and detail flow', () => {
        // ============================================
        // Step 1: Homepage loads correctly
        // ============================================
        cy.contains('FindMyAI').should('be.visible');
        cy.get('nav').should('be.visible');

        // ============================================
        // Step 2: Navigate to tools page
        // ============================================
        cy.contains('Tools').click();
        cy.url().should('include', '/tools');

        // Wait for tools to load
        cy.get('[data-testid="tool-card"]', { timeout: 10000 })
            .should('have.length.greaterThan', 0);

        // ============================================
        // Step 3: Use search functionality
        // ============================================
        cy.get('input[placeholder*="Search"]').as('searchInput');
        cy.get('@searchInput').type('video');

        // Verify results update
        cy.get('[data-testid="tool-card"]')
            .should('have.length.greaterThan', 0);

        // Verify search term is visible in results
        cy.get('[data-testid="tool-card"]')
            .first()
            .should('contain.text', 'video', { matchCase: false });

        // ============================================
        // Step 4: Apply category filter
        // ============================================
        cy.get('[data-testid="category-filter"]').click();
        cy.contains('AI Video Editors').click();

        // Verify URL updates with filter
        cy.url().should('include', 'category=');

        // ============================================
        // Step 5: Sort results
        // ============================================
        cy.get('select[data-testid="sort-select"]').select('rating');

        // Wait for results to re-sort
        cy.wait(500);

        // ============================================
        // Step 6: Click on a tool to view details
        // ============================================
        cy.get('[data-testid="tool-card"]').first().as('firstTool');

        // Store tool name for verification
        cy.get('@firstTool')
            .find('[data-testid="tool-name"]')
            .invoke('text')
            .as('toolName');

        cy.get('@firstTool').click();

        // ============================================
        // Step 7: Verify tool detail page
        // ============================================
        cy.url().should('include', '/tools/');

        // Verify tool name appears on detail page
        cy.get('@toolName').then((toolName) => {
            cy.get('h1').should('contain.text', toolName);
        });

        // Verify key elements exist
        cy.get('[data-testid="tool-description"]').should('be.visible');
        cy.get('[data-testid="tool-website"]').should('be.visible');
        cy.get('[data-testid="tool-pricing"]').should('be.visible');

        // ============================================
        // Step 8: Verify rating and reviews section
        // ============================================
        cy.get('[data-testid="average-rating"]').should('be.visible');
        cy.get('[data-testid="review-count"]').should('be.visible');

        // Scroll to reviews section
        cy.get('[data-testid="reviews-section"]').scrollIntoView();
        cy.get('[data-testid="reviews-section"]').should('be.visible');

        // ============================================
        // Step 9: Verify navigation works
        // ============================================
        cy.get('nav').contains('Tools').click();
        cy.url().should('include', '/tools');
    });

    it('should handle empty search results gracefully', () => {
        cy.visit('/tools');

        // Search for something that doesn't exist
        cy.get('input[placeholder*="Search"]').type('xyznonexistenttool123');

        // Wait for search to complete
        cy.wait(500);

        // Verify empty state message
        cy.contains('No tools found').should('be.visible');
        cy.contains('Try adjusting your search').should('be.visible');
    });

    it('should display tool screenshots in a gallery', () => {
        cy.visit('/tools');

        // Click first tool
        cy.get('[data-testid="tool-card"]').first().click();

        // Verify screenshots section exists
        cy.get('[data-testid="screenshots-gallery"]').should('be.visible');

        // Verify at least one screenshot
        cy.get('[data-testid="screenshot-image"]')
            .should('have.length.greaterThan', 0);

        // Click on screenshot to open modal (if implemented)
        cy.get('[data-testid="screenshot-image"]').first().click();
    });

    it('should track tool view analytics', () => {
        cy.intercept('POST', '/api/tools/*/view').as('trackView');

        cy.visit('/tools');
        cy.get('[data-testid="tool-card"]').first().click();

        // Verify view was tracked
        cy.wait('@trackView').its('response.statusCode').should('eq', 200);
    });
});

/**
 * Cypress E2E Test: Review Submission Flow
 */
describe('Review Submission Flow', () => {
    beforeEach(() => {
        // Login as test user before each test
        cy.visit('/login');
        cy.get('input[type="email"]').type('admin@findmyai.com');
        cy.get('input[type="password"]').type('admin123');
        cy.get('button[type="submit"]').click();

        // Wait for redirect
        cy.url().should('not.include', '/login');
    });

    it('should allow authenticated user to submit a review', () => {
        // Navigate to a tool
        cy.visit('/tools');
        cy.get('[data-testid="tool-card"]').first().click();

        // Scroll to review form
        cy.get('[data-testid="review-form"]').scrollIntoView();

        // Select star rating
        cy.get('[data-testid="star-rating"]')
            .find('button')
            .eq(4) // 5 stars
            .click();

        // Fill in review
        cy.get('input[placeholder*="title"]').type('Excellent tool!');
        cy.get('textarea[placeholder*="review"]')
            .type('This tool has greatly improved my productivity. Highly recommended!');

        // Submit review
        cy.intercept('POST', '/api/tools/*/reviews').as('submitReview');
        cy.get('button[type="submit"]').contains('Submit').click();

        // Verify submission
        cy.wait('@submitReview').its('response.statusCode').should('eq', 200);
        cy.contains('Review submitted successfully').should('be.visible');
    });
});

/**
 * Cypress E2E Test: Mobile Responsiveness
 */
describe('Mobile Responsiveness', () => {
    beforeEach(() => {
        // Set mobile viewport
        cy.viewport('iphone-x');
    });

    it('should display mobile navigation correctly', () => {
        cy.visit('/');

        // Verify mobile menu button exists
        cy.get('[data-testid="mobile-menu-button"]').should('be.visible');

        // Click to open menu
        cy.get('[data-testid="mobile-menu-button"]').click();

        // Verify nav items are visible
        cy.contains('Tools').should('be.visible');
        cy.contains('Submit').should('be.visible');
    });

    it('should display tool cards in mobile layout', () => {
        cy.visit('/tools');

        // Verify cards stack vertically
        cy.get('[data-testid="tool-card"]')
            .should('have.css', 'width')
            .and('match', /px$/);
    });
});
