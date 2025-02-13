import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { api } from 'apiClient/api'
import { Events } from 'core/FirebaseEvents/constants'
import * as useAnalytics from 'hooks/useAnalytics'
import { renderWithProviders } from 'utils/renderWithProviders'

import Header from '../Header'

const mockLogEvent = vi.fn()
vi.mock('apiClient/api', () => ({
  api: { signout: vi.fn(), listOfferersNames: vi.fn() },
}))

const defaultStore = {
  user: {
    currentUser: {
      isAdmin: false,
      email: 'test@toto.com',
    },
    initialized: true,
  },
}

const renderHeader = (storeOverrides = defaultStore) =>
  renderWithProviders(<Header />, {
    storeOverrides,
    initialRouterEntries: ['/accueil'],
  })

describe('navigation menu', () => {
  describe('when clicking on Home icon', () => {
    it('should redirect to /accueil when user is not admin', () => {
      renderHeader()

      expect(screen.getByText('Accueil').closest('a')).toHaveAttribute(
        'href',
        '/accueil'
      )
    })
  })

  describe('trackers should have been called 1 time with pathname', () => {
    beforeEach(() => {
      vi.spyOn(useAnalytics, 'default').mockImplementation(() => ({
        logEvent: mockLogEvent,
        setLogEvent: vi.fn(),
      }))
    })

    it('when clicking on Pro', async () => {
      renderHeader()

      await userEvent.click(
        screen.getByRole('img', {
          name: 'Pass Culture pro, l’espace des acteurs culturels',
        })
      )

      expect(mockLogEvent).toHaveBeenCalledTimes(1)
      expect(mockLogEvent).toHaveBeenNthCalledWith(1, Events.CLICKED_PRO, {
        from: '/accueil',
      })
    })

    it('when clicking on Home', async () => {
      renderHeader()

      await userEvent.click(screen.getByText('Accueil'))

      expect(mockLogEvent).toHaveBeenCalledTimes(1)
      expect(mockLogEvent).toHaveBeenNthCalledWith(1, Events.CLICKED_HOME, {
        from: '/accueil',
      })
    })

    it('when clicking on Ticket', async () => {
      renderHeader()

      await userEvent.click(screen.getByText('Guichet'))

      expect(mockLogEvent).toHaveBeenCalledTimes(1)
      expect(mockLogEvent).toHaveBeenNthCalledWith(1, Events.CLICKED_TICKET, {
        from: '/accueil',
      })
    })

    it('when clicking on Offers', async () => {
      renderHeader()

      await userEvent.click(screen.getByText('Offres'))

      expect(mockLogEvent).toHaveBeenCalledTimes(1)
      expect(mockLogEvent).toHaveBeenNthCalledWith(1, Events.CLICKED_OFFER, {
        from: '/accueil',
      })
    })

    it('when clicking on Bookings', async () => {
      renderHeader()

      await userEvent.click(screen.getByText('Réservations'))

      expect(mockLogEvent).toHaveBeenCalledTimes(1)
      expect(mockLogEvent).toHaveBeenNthCalledWith(1, Events.CLICKED_BOOKING, {
        from: '/accueil',
      })
    })

    it('when clicking on Reimbursement', async () => {
      renderHeader()

      await userEvent.click(screen.getByText('Remboursements'))

      expect(mockLogEvent).toHaveBeenCalledTimes(1)
      expect(mockLogEvent).toHaveBeenNthCalledWith(
        1,
        Events.CLICKED_REIMBURSEMENT,
        { from: '/accueil' }
      )
    })

    it('when clicking on Stats', async () => {
      const overrideStore = {
        ...defaultStore,
        features: {
          list: [{ isActive: true, nameKey: 'ENABLE_OFFERER_STATS' }],
        },
      }
      vi.spyOn(api, 'listOfferersNames').mockResolvedValue({
        offerersNames: [{ id: 123, name: 'AE' }],
      })

      renderHeader(overrideStore)

      await userEvent.click(screen.getAllByRole('link')[6])

      expect(mockLogEvent).toHaveBeenCalledTimes(1)
      expect(mockLogEvent).toHaveBeenNthCalledWith(1, Events.CLICKED_STATS, {
        from: '/accueil',
      })
    })

    it('when "Remboursement" become "Gestion financière"', () => {
      const overrideStore = {
        ...defaultStore,
        features: {
          list: [{ isActive: true, nameKey: 'WIP_ENABLE_FINANCE_INCIDENT' }],
        },
      }

      renderHeader(overrideStore)

      expect(screen.getByText('Gestion financière')).toBeInTheDocument()
      expect(screen.queryByText('Remboursement')).not.toBeInTheDocument()
    })

    it('when clicking on Logout', async () => {
      renderHeader()
      vi.spyOn(api, 'signout').mockResolvedValue()

      await userEvent.click(screen.getByRole('button'))

      expect(mockLogEvent).toHaveBeenCalledTimes(1)
      expect(mockLogEvent).toHaveBeenNthCalledWith(1, Events.CLICKED_LOGOUT, {
        from: '/accueil',
      })
    })
  })
})
