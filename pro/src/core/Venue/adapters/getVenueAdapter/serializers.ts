import { BannerMetaModel, GetVenueResponseModel } from 'apiClient/v1'
import { VenueBannerMetaProps } from 'components/VenueForm/ImageUploaderVenue/ImageUploaderVenue'
import { AccessiblityEnum } from 'core/shared'
import { Venue } from 'core/Venue/types'
import { getLastCollectiveDmsApplication } from 'utils/getLastCollectiveDmsApplication'

export const serializeVenueApi = (venue: GetVenueResponseModel): Venue => {
  const venueAccessibility = {
    [AccessiblityEnum.VISUAL]: venue.visualDisabilityCompliant || false,
    [AccessiblityEnum.MENTAL]: venue.mentalDisabilityCompliant || false,
    [AccessiblityEnum.AUDIO]: venue.audioDisabilityCompliant || false,
    [AccessiblityEnum.MOTOR]: venue.motorDisabilityCompliant || false,
    [AccessiblityEnum.NONE]: [
      venue.visualDisabilityCompliant,
      venue.mentalDisabilityCompliant,
      venue.audioDisabilityCompliant,
      venue.motorDisabilityCompliant,
    ].every((accessibility) => accessibility === false),
  }

  /* istanbul ignore next: DEBT, TO FIX */
  return {
    demarchesSimplifieesApplicationId:
      venue.demarchesSimplifieesApplicationId || null,
    hasPendingBankInformationApplication:
      venue.hasPendingBankInformationApplication != null
        ? venue.hasPendingBankInformationApplication
        : null,
    managingOfferer: venue.managingOfferer || [],
    reimbursementPointId: venue.reimbursementPointId || null,
    id: venue.id || 0,
    pricingPoint: venue.pricingPoint || null,
    accessibility: venueAccessibility,
    address: venue.address || '',
    banId: '',
    bannerMeta: venue.bannerMeta
      ? serializeBannerMetaApi(venue.bannerMeta)
      : null,
    bannerUrl: venue.bannerUrl || '',
    city: venue.city || '',
    comment: venue.comment || '',
    contact: {
      phoneNumber: venue.contact?.phoneNumber || null,
      email: venue.contact?.email || null,
      webSite: venue.contact?.website || null,
    },
    departmentCode: venue.departementCode || '',
    description: venue.description || '',
    collectiveDomains: venue.collectiveDomains || [],
    dateCreated: venue.dateCreated || '',
    fieldsUpdated: venue.fieldsUpdated || '',
    isVirtual: venue.isVirtual || false,
    dmsToken: venue.dmsToken,
    isPermanent: venue.isPermanent || false,
    isVenueVirtual: venue.isVirtual,
    latitude: venue.latitude || 0,
    longitude: venue.longitude || 0,
    mail: venue.bookingEmail || '',
    name: venue.name,
    publicName: venue.publicName || '',
    postalCode: venue.postalCode || '',
    siret: venue.siret || '',
    venueLabel: venue.venueLabelId?.toString() || null,
    venueType: venue.venueTypeCode,
    withdrawalDetails: venue.withdrawalDetails || '',
    collectiveAccessInformation: venue.collectiveAccessInformation || '',
    collectiveDescription: venue.collectiveDescription || '',
    collectiveEmail: venue.collectiveEmail || '',
    collectiveInterventionArea: venue.collectiveInterventionArea || [],
    collectiveLegalStatus: venue.collectiveLegalStatus || null,
    collectiveNetwork: venue.collectiveNetwork || [],
    collectivePhone: venue.collectivePhone || '',
    collectiveStudents: venue.collectiveStudents || [],
    collectiveWebsite: venue.collectiveWebsite || '',
    adageInscriptionDate: venue.adageInscriptionDate || null,
    hasAdageId: venue.hasAdageId,
    collectiveDmsApplication: getLastCollectiveDmsApplication(
      venue.collectiveDmsApplications
    ),
  }
}

const serializeBannerMetaApi = (
  apiBannerMeta: BannerMetaModel
): VenueBannerMetaProps => {
  /* istanbul ignore next: DEBT, TO FIX */
  return {
    image_credit: apiBannerMeta.image_credit || '',
    original_image_url: apiBannerMeta.original_image_url || '',
    crop_params: {
      x_crop_percent: apiBannerMeta.crop_params?.x_crop_percent || 0,
      y_crop_percent: apiBannerMeta.crop_params?.y_crop_percent || 0,
      width_crop_percent: apiBannerMeta.crop_params?.width_crop_percent || 0,
      height_crop_percent: apiBannerMeta.crop_params?.height_crop_percent || 0,
    },
  }
}
