import { FormikProvider, useFormik } from 'formik'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { GetEducationalOffererResponseModel } from 'apiClient/v1'
import OfferEducationalActions from 'components/OfferEducationalActions'
import {
  CanOffererCreateCollectiveOffer,
  OfferEducationalFormValues,
  Mode,
  isCollectiveOffer,
  isCollectiveOfferTemplate,
  CollectiveOffer,
  CollectiveOfferTemplate,
  EducationalCategories,
  applyVenueDefaultsToFormValues,
} from 'core/OfferEducational'
import patchCollectiveOfferAdapter from 'core/OfferEducational/adapters/patchCollectiveOfferAdapter'
import postCollectiveOfferAdapter from 'core/OfferEducational/adapters/postCollectiveOfferAdapter'
import postCollectiveOfferTemplateAdapter from 'core/OfferEducational/adapters/postCollectiveOfferTemplateAdapter'
import { computeInitialValuesFromOffer } from 'core/OfferEducational/utils/computeInitialValuesFromOffer'
import { computeURLCollectiveOfferId } from 'core/OfferEducational/utils/computeURLCollectiveOfferId'
import { SelectOption } from 'custom_types/form'
import useActiveFeature from 'hooks/useActiveFeature'
import useNotification from 'hooks/useNotification'
import { patchCollectiveOfferTemplateAdapter } from 'pages/CollectiveOfferEdition/adapters/patchCollectiveOfferTemplateAdapter'
import { queryParamsFromOfferer } from 'pages/Offers/utils/queryParamsFromOfferer'

import styles from './OfferEducational.module.scss'
import OfferEducationalForm from './OfferEducationalForm'
import { useCollectiveOfferImageUpload } from './useCollectiveOfferImageUpload'
import { getOfferEducationalValidationSchema } from './validationSchema'

export interface OfferEducationalProps {
  offer?: CollectiveOffer | CollectiveOfferTemplate
  setOffer: (offer: CollectiveOffer | CollectiveOfferTemplate) => void
  categories: EducationalCategories
  userOfferers: GetEducationalOffererResponseModel[]
  getIsOffererEligible?: CanOffererCreateCollectiveOffer
  mode: Mode
  isOfferBooked?: boolean
  isOfferActive?: boolean
  domainsOptions: SelectOption[]
  nationalPrograms: SelectOption[]
  isTemplate: boolean
  isOfferCreated?: boolean
  reloadCollectiveOffer?: () => void
}

const OfferEducational = ({
  offer,
  setOffer,
  categories,
  userOfferers,
  domainsOptions,
  nationalPrograms,
  getIsOffererEligible,
  mode,
  isOfferBooked = false,
  isTemplate,
  reloadCollectiveOffer,
}: OfferEducationalProps): JSX.Element => {
  const notify = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const { imageOffer, onImageDelete, onImageUpload, handleImageOnSubmit } =
    useCollectiveOfferImageUpload(offer, isTemplate)

  const templateOfferDatesEnabled = useActiveFeature(
    'WIP_ENABLE_DATES_OFFER_TEMPLATE'
  )

  const isFormatActive = useActiveFeature('WIP_ENABLE_FORMAT')

  const {
    structure: offererId,
    lieu: venueId,
    requete: requestId,
  } = queryParamsFromOfferer(location)

  const baseInitialValues = computeInitialValuesFromOffer(
    categories,
    userOfferers,
    isTemplate,
    offer,
    offererId,
    venueId
  )
  const isOfferCreated = offer !== undefined
  const initialValues =
    mode === Mode.CREATION
      ? applyVenueDefaultsToFormValues(
          baseInitialValues,
          userOfferers,
          isOfferCreated,
          categories
        )
      : baseInitialValues

  const onSubmit = async (offerValues: OfferEducationalFormValues) => {
    let response = null
    if (isTemplate) {
      if (offer === undefined) {
        response = await postCollectiveOfferTemplateAdapter({
          offer: offerValues,
          isFormatActive,
        })
      } else {
        response = await patchCollectiveOfferTemplateAdapter({
          offer: offerValues,
          initialValues,
          offerId: offer.id,
        })
      }
    } else {
      if (offer === undefined) {
        response = await postCollectiveOfferAdapter({
          offer: offerValues,
          isFormatActive,
        })
      } else {
        response = await patchCollectiveOfferAdapter({
          offer: offerValues,
          initialValues,
          offerId: offer.id,
        })
      }
    }

    const { payload, isOk, message } = response
    if (!isOk) {
      return notify.error(message)
    }
    const offerId = offer?.id ?? payload.id
    await handleImageOnSubmit(offerId)
    if (
      offer &&
      (isCollectiveOffer(payload) || isCollectiveOfferTemplate(payload))
    ) {
      setOffer({
        ...payload,
        imageUrl: imageOffer?.url,
        imageCredit: imageOffer?.credit,
      })
    }
    if (mode === Mode.EDITION && offer !== undefined) {
      return navigate(
        `/offre/${computeURLCollectiveOfferId(
          offer.id,
          offer.isTemplate
        )}/collectif/recapitulatif`
      )
    }
    const requestIdParams = requestId ? `?requete=${requestId}` : ''
    navigate(
      isTemplate
        ? `/offre/${payload.id}/collectif/vitrine/creation/recapitulatif`
        : `/offre/${payload.id}/collectif/stocks${requestIdParams}`
    )
  }

  const { resetForm, ...formik } = useFormik({
    initialValues,
    onSubmit,
    validationSchema: getOfferEducationalValidationSchema(
      templateOfferDatesEnabled,
      isFormatActive
    ),
  })

  return (
    <>
      {offer && (
        <OfferEducationalActions
          className={styles.actions}
          isBooked={isOfferBooked}
          offer={offer}
          reloadCollectiveOffer={reloadCollectiveOffer}
          mode={mode}
        />
      )}
      <FormikProvider value={{ ...formik, resetForm }}>
        <form onSubmit={formik.handleSubmit}>
          <OfferEducationalForm
            categories={categories}
            getIsOffererEligible={getIsOffererEligible}
            mode={mode}
            userOfferers={userOfferers}
            domainsOptions={domainsOptions}
            nationalPrograms={nationalPrograms}
            isTemplate={isTemplate}
            imageOffer={imageOffer}
            onImageDelete={onImageDelete}
            onImageUpload={onImageUpload}
            isOfferCreated={isOfferCreated}
            offer={offer}
          />
        </form>
      </FormikProvider>
    </>
  )
}

export default OfferEducational
