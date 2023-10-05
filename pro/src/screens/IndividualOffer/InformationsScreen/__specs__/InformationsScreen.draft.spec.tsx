import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { Route, Routes } from 'react-router-dom'

import { api } from 'apiClient/api'
import {
  GetIndividualOfferResponseModel,
  OfferStatus,
  WithdrawalTypeEnum,
} from 'apiClient/v1'
import { OFFER_WIZARD_STEP_IDS } from 'components/IndividualOfferBreadcrumb/constants'
import Notification from 'components/Notification/Notification'
import {
  IndividualOfferContext,
  IndividualOfferContextValues,
} from 'context/IndividualOfferContext'
import { REIMBURSEMENT_RULES } from 'core/Finances'
import { CATEGORY_STATUS, OFFER_WIZARD_MODE } from 'core/Offers/constants'
import { IndividualOffer, OfferSubCategory } from 'core/Offers/types'
import { getIndividualOfferPath } from 'core/Offers/utils/getIndividualOfferUrl'
import { AccessiblityEnum } from 'core/shared'
import { IndividualOfferVenueItem } from 'core/Venue/types'
import * as pcapi from 'repository/pcapi/pcapi'
import {
  individualOfferCategoryFactory,
  individualOfferContextFactory,
  individualOfferFactory,
  individualOfferSubCategoryFactory,
  individualOfferVenueItemFactory,
} from 'utils/individualApiFactories'
import { renderWithProviders } from 'utils/renderWithProviders'

import InformationsScreen, {
  InformationsScreenProps,
} from '../InformationsScreen'

vi.mock('utils/windowMatchMedia', () => ({
  doesUserPreferReducedMotion: vi.fn(() => true),
}))

vi.mock('screens/IndividualOffer/Informations/utils', () => {
  return {
    filterCategories: vi.fn(),
  }
})
vi.mock('repository/pcapi/pcapi', () => ({
  postThumbnail: vi.fn(),
}))
const scrollIntoViewMock = vi.fn()

const renderInformationsScreen = (
  props: InformationsScreenProps,
  contextOverride: IndividualOfferContextValues
) => {
  const storeOverrides = {
    user: {
      initialized: true,
      currentUser: {
        isAdmin: false,
        email: 'email@example.com',
      },
    },
  }
  const contextValue = individualOfferContextFactory(contextOverride)

  return renderWithProviders(
    <>
      <Routes>
        <Route
          path={getIndividualOfferPath({
            step: OFFER_WIZARD_STEP_IDS.INFORMATIONS,
            mode: OFFER_WIZARD_MODE.DRAFT,
          })}
          element={
            <IndividualOfferContext.Provider value={contextValue}>
              <InformationsScreen {...props} />
            </IndividualOfferContext.Provider>
          }
        />
        <Route
          path={getIndividualOfferPath({
            step: OFFER_WIZARD_STEP_IDS.STOCKS,
            mode: OFFER_WIZARD_MODE.DRAFT,
          })}
          element={<div>There is the stock route content</div>}
        />
      </Routes>
      <Notification />
    </>,
    {
      storeOverrides,
      initialRouterEntries: [
        getIndividualOfferPath({
          step: OFFER_WIZARD_STEP_IDS.INFORMATIONS,
          mode: OFFER_WIZARD_MODE.DRAFT,
        }),
      ],
    }
  )
}

describe('screens:IndividualOffer::Informations:draft', () => {
  let props: InformationsScreenProps
  let contextOverride: IndividualOfferContextValues
  let offer: IndividualOffer
  let subCategories: OfferSubCategory[]
  const offererId = 1
  const physicalVenueId = 1
  const virtualVenueId = 1
  const offerId = 12

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoViewMock
    const categories = [
      individualOfferCategoryFactory({
        id: 'CID',
        proLabel: 'Catégorie CID',
        isSelectable: true,
      }),
    ]
    subCategories = [
      individualOfferSubCategoryFactory({
        id: 'SCID virtual',
        categoryId: 'CID',
        proLabel: 'Sous catégorie online de CID',
        isEvent: false,
        conditionalFields: [],
        canBeDuo: false,
        canBeEducational: false,
        canBeWithdrawable: false,
        onlineOfflinePlatform: CATEGORY_STATUS.ONLINE,
        reimbursementRule: REIMBURSEMENT_RULES.STANDARD,
        isSelectable: true,
      }),
      individualOfferSubCategoryFactory({
        id: 'SCID physical',
        categoryId: 'CID',
        proLabel: 'Sous catégorie offline de CID',
        isEvent: false,
        conditionalFields: [],
        canBeDuo: true,
        canBeEducational: false,
        canBeWithdrawable: false,
        onlineOfflinePlatform: CATEGORY_STATUS.OFFLINE,
        reimbursementRule: REIMBURSEMENT_RULES.STANDARD,
        isSelectable: true,
      }),
    ]

    const venue1: IndividualOfferVenueItem = individualOfferVenueItemFactory()
    const venue2: IndividualOfferVenueItem = individualOfferVenueItemFactory({
      isVirtual: true,
    })

    offer = individualOfferFactory({
      id: offerId,
      author: 'Offer author',
      bookingEmail: 'booking@email.com',
      description: 'Offer description',
      durationMinutes: 140,
      isActive: true,
      isDuo: false,
      isEvent: false,
      isDigital: false,
      accessibility: {
        [AccessiblityEnum.AUDIO]: true,
        [AccessiblityEnum.MENTAL]: true,
        [AccessiblityEnum.MOTOR]: true,
        [AccessiblityEnum.VISUAL]: true,
        [AccessiblityEnum.NONE]: false,
      },
      isNational: false,
      name: 'Offer name',
      musicSubType: '',
      musicType: '',
      offererId: 12,
      offererName: '',
      performer: 'Offer performer',
      ean: '',
      showSubType: '',
      showType: '',
      stageDirector: 'Offer stageDirector',
      speaker: 'Offer speaker',
      subcategoryId: 'SCID physical',
      image: undefined,
      url: 'https://offer.example.com',
      externalTicketOfficeUrl: 'https://external.example.com',
      venueId: 2,
      venue: {
        id: 2,
        name: 'Venue name',
        publicName: 'Venue publicName',
        isVirtual: false,
        address: '15 rue de la corniche',
        postalCode: '75001',
        city: 'Paris',
        offerer: {
          id: 1,
          name: 'Offerer name',
        },
        departmentCode: '75',
        accessibility: {
          [AccessiblityEnum.AUDIO]: false,
          [AccessiblityEnum.MENTAL]: false,
          [AccessiblityEnum.MOTOR]: false,
          [AccessiblityEnum.VISUAL]: false,
          [AccessiblityEnum.NONE]: true,
        },
      },
      visa: '',
      withdrawalDetails: 'Offer withdrawalDetails',
      withdrawalDelay: 140,
      withdrawalType: WithdrawalTypeEnum.ON_SITE,
      stocks: [],
      lastProviderName: null,
      lastProvider: null,
      status: OfferStatus.DRAFT,
    })

    contextOverride = individualOfferContextFactory({
      offerId: offer.id,
      offer: offer,
      venueList: [venue1, venue2],
      offererNames: [{ id: 1, name: 'Offerer name' }],
      categories,
      subCategories,
    })

    props = {
      offererId: offererId.toString(),
      venueId: physicalVenueId.toString(),
    }

    vi.spyOn(api, 'patchOffer').mockResolvedValue({
      id: offerId,
    } as GetIndividualOfferResponseModel)
    vi.spyOn(api, 'postOffer').mockResolvedValue({
      id: offerId,
    } as GetIndividualOfferResponseModel)
    vi.spyOn(api, 'getOffer').mockResolvedValue(
      {} as GetIndividualOfferResponseModel
    )
    vi.spyOn(api, 'deleteThumbnail').mockResolvedValue()
  })

  it('should submit minimal physical offer', async () => {
    renderInformationsScreen(props, contextOverride)
    await userEvent.click(await screen.findByText('Enregistrer et continuer'))

    expect(api.patchOffer).toHaveBeenCalledTimes(1)
    expect(api.getOffer).toHaveBeenCalledTimes(1)

    expect(
      await screen.findByText('There is the stock route content')
    ).toBeInTheDocument()
    expect(pcapi.postThumbnail).not.toHaveBeenCalled()
    expect(api.postOffer).not.toHaveBeenCalled()
  })

  it('should submit minimal virtual offer', async () => {
    contextOverride.offer = {
      ...offer,
      venueId: virtualVenueId,
      subcategoryId: 'SCID virtual',
      isEvent: false,
      withdrawalDelay: null,
      withdrawalType: null,
    }
    props = {
      offererId: offererId.toString(),
      venueId: virtualVenueId.toString(),
    }

    renderInformationsScreen(props, contextOverride)
    await userEvent.click(await screen.findByText('Enregistrer et continuer'))

    expect(api.patchOffer).toHaveBeenCalledTimes(1)
    expect(api.getOffer).toHaveBeenCalledTimes(1)

    expect(
      await screen.findByText('There is the stock route content')
    ).toBeInTheDocument()
    expect(pcapi.postThumbnail).not.toHaveBeenCalled()
    expect(api.postOffer).not.toHaveBeenCalled()
  })
})
