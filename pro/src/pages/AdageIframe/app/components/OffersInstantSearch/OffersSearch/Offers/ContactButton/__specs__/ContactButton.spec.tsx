import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'

import { AdageFrontRoles } from 'apiClient/adage'
import { apiAdage } from 'apiClient/api'
import { renderWithProviders } from 'utils/renderWithProviders'

import ContactButton, { ContactButtonProps } from '../ContactButton'

const renderContactButton = (props: ContactButtonProps) => {
  return renderWithProviders(<ContactButton {...props} />)
}
vi.mock('apiClient/api', () => ({
  apiAdage: {
    logContactModalButtonClick: vi.fn(),
    logRequestFormPopinDismiss: vi.fn(),
  },
}))

vi.mock('pages/AdageIframe/libs/initAlgoliaAnalytics')

describe('ContactButton', () => {
  const defaultProps = {
    offerId: 1,
    position: 1,
    queryId: 'test',
    userRole: AdageFrontRoles.REDACTOR,
  }

  it('should call tracking on close modal', async () => {
    renderContactButton(defaultProps)

    const contactButton = screen.getByRole('button', { name: 'Contacter' })
    await userEvent.click(contactButton)

    const closeButton = screen.getByRole('button', { name: 'Annuler' })
    await userEvent.click(closeButton)

    expect(apiAdage.logRequestFormPopinDismiss).toBeCalledTimes(1)

    expect(
      screen.queryByText('Contacter le partenaire culturel')
    ).not.toBeInTheDocument()
  })
  it('should display request form on click', async () => {
    renderContactButton(defaultProps)

    const contactButton = screen.getByRole('button', { name: 'Contacter' })
    await userEvent.click(contactButton)

    expect(
      screen.getByText('Contacter le partenaire culturel')
    ).toBeInTheDocument()
  })
})
