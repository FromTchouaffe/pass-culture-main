import '@testing-library/jest-dom'
import 'react-router-dom'

import * as useNotification from 'components/hooks/useNotification'
import * as yup from 'yup'

import CollectiveOfferVisibility, {
  CollectiveOfferVisibilityProps,
} from '../CollectiveOfferVisibility'
import { render, screen, waitFor } from '@testing-library/react'

import { Formik } from 'formik'
import { MemoryRouter } from 'react-router'
import { Mode } from 'core/OfferEducational'
import { Provider } from 'react-redux'
import React from 'react'
import { configureTestStore } from 'store/testUtils'
import userEvent from '@testing-library/user-event'

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    offerId: 'BQ',
  }),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}))

export const renderVisibilityStep = (props: CollectiveOfferVisibilityProps) => {
  const validationSchema = yup.object().shape({
    visibility: yup.string(),
  })
  render(
    <Provider store={configureTestStore()}>
      <MemoryRouter>
        <Formik
          initialValues={{}}
          onSubmit={jest.fn()}
          validationSchema={validationSchema}
        >
          <CollectiveOfferVisibility {...props} />
        </Formik>
      </MemoryRouter>
    </Provider>
  )
}

describe('CollectiveOfferVisibility', () => {
  let props: CollectiveOfferVisibilityProps

  beforeEach(() => {
    props = {
      getInstitutions: jest.fn().mockResolvedValue({
        isOk: true,
        message: null,
        payload: {
          institutions: [
            {
              id: 12,
              name: 'Institution 1',
              postalCode: '91190',
              city: 'Gif-sur-Yvette',
            },
            {
              id: 24,
              name: 'Institution 2',
              postalCode: '75005',
              city: 'Paris',
            },
            {
              id: 42,
              name: 'Institution 3',
              postalCode: '33000',
              city: 'Bordeaux',
            },
          ],
        },
      }),
      mode: Mode.CREATION,
      patchInstitution: jest.fn(),
    }
  })
  it('should disable submit button if the user wants his offer to concern one Institution but has selected none', async () => {
    renderVisibilityStep(props)
    await userEvent.click(
      screen.getByLabelText(/Un établissement en particulier/)
    )
    expect(
      screen.getByRole('button', { name: /Valider et créer l’offre/ })
    ).toBeDisabled()
  })

  it('should save selected institution and go to confirmation', async () => {
    const spyPatch = jest.fn().mockResolvedValue({ isOk: true })
    renderVisibilityStep({ ...props, patchInstitution: spyPatch })
    await userEvent.click(
      screen.getByLabelText(/Un établissement en particulier/)
    )
    await userEvent.click(await screen.findByAltText(/Afficher les options/))
    await userEvent.click(await screen.findByLabelText(/Institution 1/))
    await userEvent.click(
      screen.getByRole('button', { name: /Valider et créer l’offre/ })
    )
    expect(spyPatch).toHaveBeenCalledTimes(1)
    expect(mockHistoryPush).toHaveBeenLastCalledWith(
      '/offre/BQ/collectif/confirmation'
    )
  })

  it('should display an error when the institution could not be saved', async () => {
    const spyPatch = jest
      .fn()
      .mockResolvedValue({ isOk: false, message: 'Ooops' })
    const notifyError = jest.fn()
    // @ts-ignore
    jest.spyOn(useNotification, 'default').mockImplementation(() => ({
      error: notifyError,
    }))
    renderVisibilityStep({ ...props, patchInstitution: spyPatch })
    await userEvent.click(
      screen.getByLabelText(/Un établissement en particulier/)
    )
    await userEvent.click(await screen.findByAltText(/Afficher les options/))
    await userEvent.click(await screen.findByLabelText(/Institution 1/))
    await userEvent.click(
      screen.getByRole('button', { name: /Valider et créer l’offre/ })
    )
    expect(spyPatch).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(notifyError).toHaveBeenNthCalledWith(1, 'Ooops'))
  })

  it('should not save visibility when all institution are selected', async () => {
    const spyPatch = jest.fn()
    renderVisibilityStep({ ...props, patchInstitution: spyPatch })
    await userEvent.click(
      screen.getByRole('button', { name: /Valider et créer l’offre/ })
    )
    expect(spyPatch).not.toHaveBeenCalled()
    expect(mockHistoryPush).toHaveBeenLastCalledWith(
      '/offre/BQ/collectif/confirmation'
    )
  })
})
