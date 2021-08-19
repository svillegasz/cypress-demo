/// <reference types="cypress" />

context('Demoblaze store', () => {
  before(() => {
    cy.setCookie('tokenp_', 'Y3lwcmVzczE2Mjk5Mjg=')  
    Cypress.Cookies.preserveOnce('tokenp_')
  })

  context('Dashboard', () => {
    before(() => {
      cy.visit('https://www.demoblaze.com/')
    })
  
    it('should display the products prices', () => {
      cy.intercept('GET', '**/entries', { fixture: 'entries.json' }).as('getEntries')
  
      cy.wait('@getEntries')
  
      cy.get('.card-block h5')
      .then($prices => Cypress._.map($prices, 'innerText'))
      .should('have.length', 3)
      .should('have.members', ['$360', '$790', '$790'])
    })
  })

  context('Single product view', () => {
    before(() => {
      cy.visit('https://www.demoblaze.com/prod.html?idp_=1')
          
      cy.intercept('POST', '**/view', { fixture: 'view.json' }).as('getView')
      cy.intercept('POST', '**/check', { fixture: 'user.json' }).as('getUser')
  
      cy.wait('@getView')
      cy.wait('@getUser')
    })
  
    it('should display a single product name', () => {
      cy.get('.name')
        .should('have.text', 'Samsung galaxy s6')
    })

    it('should be able to add a product to the cart', () => {
      cy.intercept('POST', '**/addtocart').as('addToCart')

      cy.get('.btn-success').click()
      cy.wait('@addToCart')
        .its('request')
        .its('body')
        .should($body => {
          expect($body).to.have.property('id')
          expect($body).to.have.property('prod_id', 1)
          expect($body).to.have.property('cookie', 'Y3lwcmVzczE2Mjk5Mjg=')
        })
    })
  })
})
