describe( 'Show a page to restricted users', () => {
	before( () => {
		cy.visitAdminPage( 'options-reading.php' );
		cy.get( '#rsa-unblocked-page' ).check();
		cy.saveSettings();

		cy.logout();
	} );

	it( 'Show a general restricted message if a page is not selected', () => {
		cy.visit( '/', {
			failOnStatusCode: false
		} );

		cy
			.get( '.wp-die-message' ).contains( 'This is a restricted site. Please contact the admin.' );
	} );

	it( 'Show the selected page to restricted users', () => {
		cy.visitAdminPage( 'options-reading.php' );
		cy.get( '#rsa_page' ).select( 'Page to redirect' );
		cy.saveSettings();
		cy.logout();
		cy.visit( '/' );
		cy.url().should( 'include', `${ Cypress.config().baseUrl }page-to-redirect` );
	} );

	it( 'Unrestricted user should be able to access the site', () => {
		cy.visitAdminPage( 'options-reading.php' );
		cy
			.get( '#newip' )
			.clear()
			.type( '193.168.20.30' )

		cy
			.get( '#addip' )
			.click();

		cy.wait( 800 )

		cy.saveSettings();
		cy.logout();
		cy.visit( '/' );
		cy.request({
			method: 'GET',
			url: `${ Cypress.config().baseUrl }accessible-page`,
			failOnStatusCode: false,
			headers: {
				'X-Forwarded': '193.168.20.30',
			}
		} ).then( ( response ) => {
			expect( response.status ).to.eq( 200 );
			expect( response.body ).to.contain( 'page-template-default page' );
		} );
	} );
} );
