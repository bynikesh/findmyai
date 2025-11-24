// ***********************************************
// Custom Cypress Commands
// ***********************************************

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to login
             * @example cy.login('user@example.com', 'password')
             */
            login(email: string, password: string): Chainable<void>;

            /**
             * Custom command to search for tools
             * @example cy.searchTools('video editor')
             */
            searchTools(query: string): Chainable<void>;

            /**
             * Custom command to select a category
             * @example cy.selectCategory('AI Video Editors')
             */
            selectCategory(categoryName: string): Chainable<void>;
        }
    }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.session([email, password], () => {
        cy.visit('/login');
        cy.get('input[type="email"]').type(email);
        cy.get('input[type="password"]').type(password);
        cy.get('button[type="submit"]').click();
        cy.url().should('not.include', '/login');
    });
});

// Search tools command
Cypress.Commands.add('searchTools', (query: string) => {
    cy.visit('/tools');
    cy.get('input[placeholder*="Search"]').type(query);
    cy.wait(500); // Wait for debounce
});

// Select category command
Cypress.Commands.add('selectCategory', (categoryName: string) => {
    cy.get('[data-testid="category-filter"]').click();
    cy.contains(categoryName).click();
});

export { };
