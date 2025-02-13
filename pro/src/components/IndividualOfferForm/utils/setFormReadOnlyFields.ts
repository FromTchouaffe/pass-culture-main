import {
  OFFER_STATUS_PENDING,
  OFFER_STATUS_REJECTED,
} from 'core/Offers/constants'
import { IndividualOffer } from 'core/Offers/types'
import { isOfferSynchronized } from 'core/Offers/utils'
import { isAllocineProvider } from 'core/Providers'

import { FORM_DEFAULT_VALUES } from '../constants'

const setFormReadOnlyFieldsForSynchronizedOffer = (
  offer: IndividualOffer
): string[] => {
  const editableFields: string[] = ['accessibility', 'externalTicketOfficeUrl']
  if (isAllocineProvider(offer.lastProvider)) {
    editableFields.push('isDuo')
  }

  return Object.keys(FORM_DEFAULT_VALUES).filter(
    (field: string) => !editableFields.includes(field)
  )
}

const setFormReadOnlyFields = (
  offer: IndividualOffer | null,
  isAdmin?: boolean
): string[] => {
  const readOnlyField: string[] = []

  if (isAdmin === true) {
    readOnlyField.push('offererId')
  }

  if (offer === null) {
    return readOnlyField
  }

  if ([OFFER_STATUS_REJECTED, OFFER_STATUS_PENDING].includes(offer.status)) {
    return Object.keys(FORM_DEFAULT_VALUES)
  }

  if (isOfferSynchronized(offer)) {
    return setFormReadOnlyFieldsForSynchronizedOffer(offer)
  }

  readOnlyField.push('categoryId', 'subcategoryId', 'offererId', 'venueId')
  return [...new Set(readOnlyField)]
}

export default setFormReadOnlyFields
