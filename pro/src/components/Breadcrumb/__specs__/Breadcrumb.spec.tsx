import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'

import type { Step } from 'components/Breadcrumb'
import { renderWithProviders } from 'utils/renderWithProviders'

import Breadcrumb, { BreadcrumbStyle, BreadcrumbProps } from '../Breadcrumb'

const renderBreadcrumb = (props: BreadcrumbProps) => {
  renderWithProviders(<Breadcrumb {...props} />)
}

const onClick = vi.fn()

describe('Breadcrumb', () => {
  let props: BreadcrumbProps
  let steps: Step[]

  beforeEach(() => {
    steps = [
      {
        id: '1',
        label: 'Informations',
        url: '/informations',
        onClick: onClick,
      },
      {
        id: '2',
        label: 'Stocks & Prix',
        url: '/stocks',
      },
      {
        id: '3',
        label: 'Récapitulatif',
        hash: 'recapitulatif',
      },
      {
        id: '4',
        label: 'Confirmation',
      },
    ]
    props = {
      activeStep: '2',
      steps: steps,
      styleType: BreadcrumbStyle.DEFAULT,
    }
  })

  describe('default breadcrumb', () => {
    beforeEach(() => {
      props.styleType = BreadcrumbStyle.DEFAULT
    })

    it('should render default breadcrumb', async () => {
      renderBreadcrumb(props)

      expect(screen.getByTestId('bc-default')).toBeInTheDocument()

      const listItems = await screen.findAllByRole('listitem')

      expect(listItems).toHaveLength(4)
      expect(listItems[0]).toHaveTextContent('Informations')
      expect(
        await listItems[0].getElementsByClassName('separator')
      ).toHaveLength(1)
      expect(listItems[1]).toHaveTextContent('Stocks & Prix')
      expect(
        await listItems[1].getElementsByClassName('separator')
      ).toHaveLength(1)
      expect(listItems[2]).toHaveTextContent('Récapitulatif')
      expect(
        await listItems[2].getElementsByClassName('separator')
      ).toHaveLength(1)
      expect(listItems[3]).toHaveTextContent('Confirmation')
      expect(
        await listItems[3].getElementsByClassName('separator')
      ).toHaveLength(0)

      expect(
        screen.queryByRole('img', {
          name: 'Une action est requise dans cet onglet',
        })
      ).not.toBeInTheDocument()
    })

    it('should render link or hash when needed', async () => {
      renderBreadcrumb(props)

      const informationLink = await screen
        .getByText('Informations')
        .closest('a')
      expect(informationLink).toHaveAttribute('href', '/informations')

      const StockLink = screen.getByText('Stocks & Prix').closest('a')
      expect(StockLink).toHaveAttribute('href', '/stocks')

      const SummaryLink = screen.getByText('Récapitulatif').closest('a')
      expect(SummaryLink).toHaveAttribute('href', '#recapitulatif')

      const ConfirmationLink = await screen
        .getByText('Confirmation')
        .closest('a')
      expect(ConfirmationLink).toBeNull()
    })

    it('should have right active element when it has url', async () => {
      renderBreadcrumb(props)

      const listItems = await screen.findAllByRole('listitem')

      expect(listItems).toHaveLength(4)
      expect(listItems[0].classList.contains('active')).toBe(false)
      expect(listItems[1].classList.contains('active')).toBe(true)
      expect(listItems[2].classList.contains('active')).toBe(false)
      expect(listItems[3].classList.contains('active')).toBe(false)
    })

    it('should trigger onClick', async () => {
      renderBreadcrumb(props)

      const informationLink = await screen
        .getByText('Informations')
        .closest('a')

      informationLink && (await userEvent.click(informationLink))

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should render error icon if step has warning', async () => {
      props.steps.push({
        id: '5',
        label: 'Informations bancaires',
        hasWarning: true,
      })
      renderBreadcrumb(props)
      expect(screen.getByText('Informations bancaires')).toBeInTheDocument()
      expect(
        screen.getByRole('img', {
          name: 'Une action est requise dans cet onglet',
        })
      ).toBeInTheDocument()
    })

    it('should render error icon if step has url ans has warning', async () => {
      props.steps.pop()
      props.steps.push({
        id: '6',
        label: 'step with url',
        url: 'https://example.com',
        hasWarning: true,
      })
      renderBreadcrumb(props)
      expect(screen.getByText('step with url')).toBeInTheDocument()
      expect(
        screen.getByRole('img', {
          name: 'Une action est requise dans cet onglet',
        })
      ).toBeInTheDocument()
    })

    it('should render error icon if step has hash ans has warning', async () => {
      props.steps.pop()
      props.steps.push({
        id: '7',
        label: 'step with hash',
        hash: 'hash',
        hasWarning: true,
      })
      renderBreadcrumb(props)
      expect(screen.getByText('step with hash')).toBeInTheDocument()
      expect(
        screen.getByRole('img', {
          name: 'Une action est requise dans cet onglet',
        })
      ).toBeInTheDocument()
    })
  })

  describe('tab breadcrumb', () => {
    beforeEach(() => {
      props.styleType = BreadcrumbStyle.TAB
    })

    it('should render tab breadcrumb', async () => {
      renderBreadcrumb(props)

      expect(screen.getByTestId('bc-tab')).toBeInTheDocument()

      const listItems = await screen.findAllByRole('listitem')

      expect(listItems).toHaveLength(4)
      expect(listItems[0]).toHaveTextContent('Informations')
      expect(
        await listItems[0].getElementsByClassName('separator')
      ).toHaveLength(0)
      expect(listItems[1]).toHaveTextContent('Stocks & Prix')
      expect(
        await listItems[1].getElementsByClassName('separator')
      ).toHaveLength(0)
      expect(listItems[2]).toHaveTextContent('Récapitulatif')
      expect(
        await listItems[2].getElementsByClassName('separator')
      ).toHaveLength(0)
      expect(listItems[3]).toHaveTextContent('Confirmation')
      expect(
        await listItems[3].getElementsByClassName('separator')
      ).toHaveLength(0)
    })

    it('should render link or hash when needed', async () => {
      renderBreadcrumb(props)

      const informationLink = await screen
        .getByText('Informations')
        .closest('a')
      expect(informationLink).toHaveAttribute('href', '/informations')

      const StockLink = screen.getByText('Stocks & Prix').closest('a')
      expect(StockLink).toHaveAttribute('href', '/stocks')

      const SummaryLink = screen.getByText('Récapitulatif').closest('a')
      expect(SummaryLink).toHaveAttribute('href', '#recapitulatif')

      const ConfirmationLink = await screen
        .getByText('Confirmation')
        .closest('a')
      expect(ConfirmationLink).toBeNull()
    })

    it('should have right active element when it has url', async () => {
      renderBreadcrumb(props)

      const listItems = await screen.findAllByRole('listitem')

      expect(listItems).toHaveLength(4)
      expect(listItems[0].classList.contains('active')).toBe(false)
      expect(listItems[1].classList.contains('active')).toBe(true)
      expect(listItems[2].classList.contains('active')).toBe(false)
      expect(listItems[3].classList.contains('active')).toBe(false)
    })

    it('should trigger onClick', async () => {
      renderBreadcrumb(props)

      const informationLink = await screen
        .getByText('Informations')
        .closest('a')

      informationLink && (await userEvent.click(informationLink))

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('stepper breadcrumb', () => {
    it('should render stepper breadcrumb', async () => {
      props.styleType = BreadcrumbStyle.STEPPER

      renderBreadcrumb(props)

      expect(screen.getByTestId('stepper')).toBeInTheDocument()
      // see other tests in Stepper tests
    })
  })
})
