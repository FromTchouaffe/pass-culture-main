import { screen } from '@testing-library/react'
import React from 'react'

import { individualOfferFactory } from 'utils/individualApiFactories'
import { renderWithProviders } from 'utils/renderWithProviders'

import { PriceCategoriesSection } from '../PriceCategoriesSection'

describe('StockEventSection', () => {
  it('should render correctly', () => {
    const offer = individualOfferFactory()

    renderWithProviders(<PriceCategoriesSection offer={offer} canBeDuo />)

    expect(screen.getByText(/Tarifs/)).toBeInTheDocument()
    expect(
      screen.getByText(/Accepter les réservations "Duo"/)
    ).toBeInTheDocument()
  })

  it('should render correctly when offer cannot be duo', () => {
    const offer = individualOfferFactory()

    renderWithProviders(
      <PriceCategoriesSection offer={offer} canBeDuo={false} />
    )

    expect(screen.getByText(/Tarifs/)).toBeInTheDocument()
    expect(
      screen.queryByText(/Accepter les réservations "Duo"/)
    ).not.toBeInTheDocument()
  })
})
