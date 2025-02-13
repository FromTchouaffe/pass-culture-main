import { EacFormat } from 'apiClient/adage'
import {
  EducationalInstitutionResponseModel,
  OfferAddressType,
  OfferStatus,
  StudentLevels,
  SubcategoryIdEnum,
  GetCollectiveOfferResponseModel,
  GetCollectiveOfferTemplateResponseModel,
} from 'apiClient/v1'
import { AccessibiltyFormValues } from 'core/shared'
import { hasProperty } from 'utils/types'

export type EducationalCategory = {
  id: string
  label: string
}

export type EducationalSubCategory = {
  id: string
  categoryId: string
  label: string
}

export type EducationalCategories = {
  educationalCategories: EducationalCategory[]
  educationalSubCategories: EducationalSubCategory[]
}

export type OfferEducationalFormValues = {
  category: string
  subCategory?: SubcategoryIdEnum
  title: string
  description: string
  duration: string
  offererId: string
  venueId: string
  eventAddress: {
    addressType: OfferAddressType
    otherAddress: string
    venueId: number | null
  }
  interventionArea: string[]
  participants: Record<StudentLevels | 'all', boolean>
  accessibility: AccessibiltyFormValues
  phone: string
  email: string
  notificationEmails: string[]
  domains: string[]
  'search-domains'?: string
  'search-interventionArea'?: string
  'search-formats'?: string
  priceDetail?: string
  imageUrl?: string
  imageCredit?: string
  nationalProgramId?: string
  isTemplate: boolean
  beginningDate?: string
  endingDate?: string
  hour?: string
  formats?: EacFormat[]
}

export type CanOffererCreateCollectiveOffer = Adapter<
  number,
  { isOffererEligibleToEducationalOffer: boolean },
  { isOffererEligibleToEducationalOffer: false }
>

export enum Mode {
  CREATION,
  EDITION,
  READ_ONLY,
}

export type OfferEducationalStockFormValues = {
  eventDate: string
  eventTime: string
  numberOfPlaces: number | ''
  totalPrice: number | ''
  bookingLimitDatetime: string
  priceDetail: string
  educationalOfferType: EducationalOfferType
}

export type GetStockOfferSuccessPayload = {
  isActive: boolean
  status: OfferStatus
  isBooked: boolean
  isCancellable: boolean
  venueDepartmentCode: string
  managingOffererId: number
  isEducational: boolean
  isShowcase: boolean
  offerId?: number | null
  institution?: EducationalInstitutionResponseModel | null
  name: string
}

export enum EducationalOfferType {
  SHOWCASE = 'SHOWCASE',
  CLASSIC = 'CLASSIC',
}

export type CollectiveOffer = GetCollectiveOfferResponseModel & {
  isTemplate: false
}

export const isCollectiveOffer = (value: unknown): value is CollectiveOffer =>
  // Could be enhanced to check that it is also a GetCollectiveOfferTemplateResponseModel
  hasProperty(value, 'isTemplate') && value.isTemplate === false

export type CollectiveOfferTemplate =
  GetCollectiveOfferTemplateResponseModel & {
    isTemplate: true
  }

export const isCollectiveOfferTemplate = (
  value: unknown
): value is CollectiveOfferTemplate =>
  // Could be enhanced to check that it is also a GetCollectiveOfferTemplateResponseModel
  hasProperty(value, 'isTemplate') && value.isTemplate === true

export type VisibilityFormValues = {
  visibility: 'all' | 'one'
  institution: string
  'search-institution': string
  'search-teacher': string | null
  teacher: string | null
}

export enum CollectiveOfferStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  PREBOOKED = 'PREBOOKED',
  BOOKED = 'BOOKED',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  ENDED = 'ENDED',
}
