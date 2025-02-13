import { screen } from '@testing-library/react'
import React from 'react'

import { collectiveOfferTemplateFactory } from 'utils/collectiveApiFactories'
import { renderWithProviders } from 'utils/renderWithProviders'

import CollectiveOfferDateSection, {
  CollectiveOfferDateSectionProps,
} from '../CollectiveOfferDateSection'

const renderCollectiveOfferDateSection = (
  props: CollectiveOfferDateSectionProps
) => {
  renderWithProviders(<CollectiveOfferDateSection {...props} />)
}

describe('CollectiveOfferDateSection', () => {
  let props: CollectiveOfferDateSectionProps
  it('should show the dates section if there are dates in the offer', () => {
    const offer = collectiveOfferTemplateFactory({
      dates: { start: '2023-10-24T09:14:00', end: '2023-10-24T09:16:00' },
    })

    renderCollectiveOfferDateSection({
      ...props,
      offer,
    })
    expect(screen.getByText('Date et heure')).toBeInTheDocument()
  })

  it('should not show the dates section if there are no dates in the offer', () => {
    const offer = collectiveOfferTemplateFactory({
      dates: undefined,
    })

    renderCollectiveOfferDateSection({
      ...props,
      offer,
    })
    expect(screen.queryByText('Date et heure')).not.toBeInTheDocument()
  })
})
