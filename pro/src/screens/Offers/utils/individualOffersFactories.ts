import { OfferStatus } from 'apiClient/v1'
import { Offer, Venue } from 'core/Offers/types'

let offerId = 1

export const individualOfferFactory = (customOffer = {}): Offer => {
  const currentOfferId = offerId++
  return {
    id: currentOfferId,
    status: OfferStatus.ACTIVE,
    isActive: true,
    hasBookingLimitDatetimesPassed: true,
    isEducational: false,
    name: `offer name ${offerId}`,
    isEvent: true,
    venue: venueFactory(),
    stocks: [],
    isEditable: true,
    ...customOffer,
  }
}

const venueFactory = (): Venue => ({
  name: 'venue name',
  offererName: 'offerer name',
  isVirtual: false,
})
