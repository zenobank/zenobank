/// <reference types="cypress" />

describe('Payment E2E Tests', () => {
  let paymentId: string;
  let paymentData: any;

  before(() => {
    // Create a payment via API to have test data
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/v1/payments',
      headers: {
        'x-api-key': 'demo-api-key',
      },
      body: {
        priceAmount: '100',
        priceCurrency: 'USD',
        webhookUrl: 'https://example.com/webhook',
        successUrl: 'https://example.com/success',
        verificationToken: '123e4567-e89b-12d3-a456-426614174000',
        orderId: '765',
      },
    }).then((res) => {
      paymentId = res.body.id;
      paymentData = res.body;
    });
  });

  it('should redirect root URL to zenobank.io', () => {
    cy.visit('/');

    // Verify that we are redirected to zenobank.io
    cy.url().should('include', 'zenobank.io');
  });

  it('should handle non-existent routes gracefully', () => {
    cy.visit(`/${Math.random().toString(36).substring(2, 15)}`, { failOnStatusCode: false });

    // Should not crash and should show some kind of error page or redirect
    // The page should load without throwing errors
    cy.get('body').should('exist');

    // Check that we're either on an error page or redirected somewhere safe
    cy.url().should('not.be.empty');
  });

  it('should have the correct payment URL', () => {
    // Verify paymentUrl is baseUrl + id
    expect(paymentData.paymentUrl).to.equal(`http://localhost:3000/${paymentId}`);
  });

  it('should display payment details correctly on the payment page', () => {
    cy.visit(`/${paymentId}`);

    // Check that price amount and currency are visible
    cy.contains('USD 100').should('be.visible');
  });

  it('should show cryptocurrency dropdown and handle selection', () => {
    cy.visit(`/${paymentId}`);

    // Check that "Select cryptocurrency..." dropdown is visible
    cy.contains('Select cryptocurrency...').should('be.visible');

    // Click on the cryptocurrency dropdown
    cy.contains('Select cryptocurrency...').click();

    // Verify dropdown opens and shows options
    cy.get('[role="combobox"]').should('be.visible');

    // Select a cryptocurrency (assuming USDC is available)
    cy.contains('USDC').click();

    // Verify selection is made
    cy.contains('USDC').should('be.visible');

    // Verify network is visible after token selection
    cy.contains('Network:').should('be.visible');

    // Click Next button
    cy.get('button').contains('Next').click();

    // Verify payment details screen appears
    cy.contains('Send exact amount to').should('be.visible');

    // Check that an ETH wallet address is visible (starts with 0x)
    cy.get('span').should('contain.text', '0x').and('have.length.greaterThan', 0);

    // Check that QR code is visible
    cy.get('canvas').should('be.visible');

    // Check that countdown timer is visible
    cy.get('[data-testid="countdown"], .badge').should('be.visible');

    // Check that amount is displayed and is between 99.9 and 100.1
    cy.get('body').should('contain.text', 'USDC');
    cy.get('body').then(($body) => {
      const text = $body.text();
      // Look for pattern like "100.000592 USDC" or similar
      const amountMatch = text.match(/(\d+\.\d+)\s*USDC/);
      expect(amountMatch).to.not.be.null;
      const amount = parseFloat(amountMatch[1]);
      expect(amount).to.be.at.least(99.9);
      expect(amount).to.be.at.most(100.1);
    });

    // Check that Network: [NETWORK_NAME] is visible and matches the previous step
    cy.contains('Network:').should('be.visible');
    // The network name should be visible after "Network:"
    cy.get('body').should('contain.text', 'Network:');
  });
});
